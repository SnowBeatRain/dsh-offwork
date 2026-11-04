import { readFile, writeFile, rename, unlink, chmod } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const inject = ['commands', 'tools'];

export const DEFAULT_SETTINGS = Object.freeze({
  payMode: 'monthly',
  monthlySalary: 10000,
  dailySalary: 400,
  workdaysPerMonth: 21.75,
  start: '09:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  weekdays: Object.freeze([1, 2, 3, 4, 5]),
  timezone: 'Asia/Shanghai',
});

const dataFile = new URL('./data.json', import.meta.url);
const keys = Object.keys(DEFAULT_SETTINGS);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = error => ({ ok: false, error: error instanceof Error ? error.message : String(error) });

function validatePatch(value) {
  if (!isObject(value)) throw new Error('settings 必须是 JSON 对象。');
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`未知配置字段：${key}`);
  }
}

export function validateSettings(value) {
  validatePatch(value);
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new Error(`缺少配置字段：${key}`);
  }
  if (value.payMode !== 'monthly' && value.payMode !== 'daily') {
    throw new Error('payMode 必须是 monthly 或 daily。');
  }
  if (typeof value.dailySalary !== 'number' || !Number.isFinite(value.dailySalary) || value.dailySalary < 0) {
    throw new Error('dailySalary 必须是大于等于 0 的有限数字。');
  }
  if (typeof value.monthlySalary !== 'number' || !Number.isFinite(value.monthlySalary) || value.monthlySalary < 0) {
    throw new Error('monthlySalary 必须是大于等于 0 的有限数字。');
  }
  if (typeof value.workdaysPerMonth !== 'number' || !Number.isFinite(value.workdaysPerMonth) || value.workdaysPerMonth <= 0) {
    throw new Error('workdaysPerMonth 必须是大于 0 的有限数字。');
  }
  const minutes = key => {
    if (typeof value[key] !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value[key])) {
      throw new Error(`${key} 必须是 24 小时制 HH:mm。`);
    }
    const [hour, minute] = value[key].split(':').map(Number);
    return hour * 60 + minute;
  };
  const start = minutes('start');
  const end = minutes('end');
  const breakStart = minutes('breakStart');
  const breakEnd = minutes('breakEnd');
  if (end === start) throw new Error('start 和 end 不能相同。');
  const relative = minute => (minute - start + 1440) % 1440;
  const duration = relative(end);
  if (breakStart !== breakEnd) {
    const from = relative(breakStart);
    const to = relative(breakEnd);
    if (from >= to || to > duration) {
      throw new Error('午休必须按班次起点顺序落在班次内。');
    }
    if (to - from >= duration) throw new Error('午休不能占满整个班次。');
  }
  if (!Array.isArray(value.weekdays) || value.weekdays.length === 0 ||
      value.weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6) ||
      new Set(value.weekdays).size !== value.weekdays.length) {
    throw new Error('weekdays 必须是非空、不重复的 0–6 整数数组（0 为周日）。');
  }
  if (typeof value.timezone !== 'string' || value.timezone.length === 0 || value.timezone.trim() !== value.timezone) {
    throw new Error('timezone 必须是有效时区名称。');
  }
  try { new Intl.DateTimeFormat('en', { timeZone: value.timezone }); }
  catch { throw new Error('timezone 必须是有效时区名称。'); }
  return { ...value, weekdays: [...value.weekdays] };
}

// One local persistence owner, shared by the command and tool adapters.
// Reads never persist defaults. Writes are serialized and atomically replace a 0600 file.
export function createOperations(dataFileArg = dataFile) {
  const target = dataFileArg instanceof URL ? fileURLToPath(dataFileArg) : resolve(dataFileArg);
  let queue = Promise.resolve();
  async function read() {
    let text;
    try { text = await readFile(target, 'utf8'); }
    catch (error) {
      if (error.code === 'ENOENT') return { settings: validateSettings(DEFAULT_SETTINGS), configured: false };
      throw new Error('无法读取本机配置。');
    }
    try {
      const stored = JSON.parse(text);
      validatePatch(stored);
      // Only the newly introduced fields are optional in legacy files.
      const settings = validateSettings({ payMode: DEFAULT_SETTINGS.payMode, dailySalary: DEFAULT_SETTINGS.dailySalary, ...stored });
      return { settings, configured: true };
    } catch { throw new Error('本机配置损坏或无效；请检查插件目录 data.json。'); }
  }
  async function write(settings) {
    const temp = join(dirname(target), `.data-${randomUUID()}.tmp`);
    try {
      await writeFile(temp, `${JSON.stringify(settings, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
      await chmod(temp, 0o600);
      await rename(temp, target);
    } catch {
      throw new Error('无法保存本机配置。');
    } finally {
      await unlink(temp).catch(() => {});
    }
  }
  return function operate(action, patch) {
    const operation = queue.then(async () => {
      try {
        if (action !== 'get' && action !== 'set') throw new Error('action 必须是 get 或 set。');
        if (action === 'get' && patch !== undefined) throw new Error('get 不接受 settings。');
        if (action === 'set') validatePatch(patch);
        const current = await read();
        if (action === 'get') return { ok: true, ...current };
        const settings = validateSettings({ ...current.settings, ...patch });
        await write(settings);
        return { ok: true, settings, configured: true };
      } catch (error) { return fail(error); }
    });
    queue = operation.then(() => {}, () => {});
    return operation;
  };
}

const settingsSchema = {
  type: 'object', additionalProperties: false,
  description: '要合并保存的配置字段。时间使用 HH:mm。',
  properties: {
    payMode: { type: 'string', enum: ['monthly', 'daily'], description: '计薪方式，默认 monthly（月薪）；daily 为日薪。' },
    dailySalary: { type: 'number', description: '日薪，有限数字且 >= 0，默认 400。' },
    monthlySalary: { type: 'number', description: '月薪，有限数字且 >= 0。' },
    workdaysPerMonth: { type: 'number', description: '每月工作日数，有限数字且 > 0。' },
    start: { type: 'string', description: '上班时间 HH:mm。' },
    end: { type: 'string', description: '下班时间 HH:mm；早于上班表示次日，不能与上班相同。' },
    breakStart: { type: 'string', description: '休息开始 HH:mm。' },
    breakEnd: { type: 'string', description: '休息结束 HH:mm；与开始相同即关闭，否则按班次顺序在班次内，且不能占满班次。' },
    weekdays: { type: 'array', items: { type: 'integer', enum: [0, 1, 2, 3, 4, 5, 6] }, description: '非空、不重复；0 为周日，1 为周一。' },
    timezone: { type: 'string', description: '有效时区，例如 Asia/Shanghai。' },
  },
};

export function apply(ctx) {
  const operate = createOperations();
  ctx.effect(() => ctx.commands.register({
    name: 'offwork-clock',
    description: '读取或保存本机下班时钟配置：get 或 set JSON。',
    input: { hint: 'get | set {"monthlySalary":10000}' },
    recordInput: false,
    async handler({ rawInput }) {
      let result;
      try {
        const match = /^(get|set)(?:\s+([\s\S]*))?$/.exec(rawInput.trim());
        if (!match) throw new Error('用法：/offwork-clock get 或 /offwork-clock set JSON');
        const [, action, json] = match;
        if (action === 'get' && json !== undefined) throw new Error('get 不接受参数。');
        if (action === 'set' && !json?.trim()) throw new Error('set 需要 JSON 配置对象。');
        result = await operate(action, action === 'set' ? JSON.parse(json) : undefined);
      } catch (error) { result = fail(error); }
      return { kind: result.ok ? 'success' : 'error', text: JSON.stringify(result) };
    },
  }));
  ctx.effect(() => ctx.tools.register({
    name: 'offwork_clock',
    description: '读取或更新本机下班时钟的工资与班次配置。get 返回配置及 configured（是否已有保存文件）；set 合并保存。工资仅存本机，但调用及结果会进入会话记录。',
    parameters: {
      type: 'object', additionalProperties: false, required: ['action'],
      properties: {
        action: { type: 'string', enum: ['get', 'set'], description: 'get 读取；set 更新。' },
        settings: settingsSchema,
      },
    },
    output: {
      schema: {
        oneOf: [
          { type: 'object', additionalProperties: false, required: ['ok', 'settings', 'configured'], properties: { ok: { type: 'boolean', const: true }, settings: { ...settingsSchema, required: keys }, configured: { type: 'boolean' } } },
          { type: 'object', additionalProperties: false, required: ['ok', 'error'], properties: { ok: { type: 'boolean', const: false }, error: { type: 'string' } } },
        ],
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute(args) {
      if (!isObject(args) || Object.keys(args).some(key => key !== 'action' && key !== 'settings')) {
        return fail('参数必须是仅含 action 和可选 settings 的对象。');
      }
      return operate(args.action, args.settings);
    },
  }));
}
