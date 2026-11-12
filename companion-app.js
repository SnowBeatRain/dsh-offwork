export const COMPANION_APP_STYLE = `
.owc-hub-launch{display:flex!important;align-items:center;justify-content:center;gap:7px;width:100%;min-height:30px!important;border-radius:10px!important;margin:4px 0!important;font-size:12px!important;cursor:pointer}
.owc-hub{box-sizing:border-box;--hub-accent:var(--owc-accent,#7779bc);position:fixed;z-index:65;right:16px;bottom:16px;width:min(370px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;border:1px solid color-mix(in srgb,var(--hub-accent) 25%,transparent);border-radius:18px;padding:16px;background:var(--dsw-alias-bg-overlay,#fff);color:var(--dsw-alias-label-primary,#242b42);box-shadow:0 10px 36px #151c3820;font:13px/1.6 system-ui;cursor:default;user-select:text;touch-action:pan-y}
.owc-hub *{box-sizing:border-box}.owc-hub header{display:flex;gap:10px;align-items:center;margin-bottom:10px}.owc-hub header strong{flex:1;font-size:16px}.owc-hub button{min-height:34px!important;padding:5px 10px!important;border:1px solid color-mix(in srgb,var(--hub-accent) 22%,transparent)!important;border-radius:9px!important;font:inherit!important;background:transparent;color:inherit;cursor:pointer}.owc-hub button:hover{background:color-mix(in srgb,var(--hub-accent) 10%,transparent)}.owc-hub button:disabled{opacity:.5;cursor:wait}.owc-hub button[data-primary=true]{background:var(--hub-accent);color:white}.owc-hub nav{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}.owc-hub nav button[aria-selected=true]{background:color-mix(in srgb,var(--hub-accent) 16%,transparent)}.owc-hub p{margin:8px 0}.owc-hub .hub-muted{font-size:12px;opacity:.72}.owc-hub .hub-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:9px 0}.owc-hub label{display:block;margin:10px 0}.owc-hub input:not([type=checkbox]),.owc-hub select,.owc-hub textarea{width:100%;padding:7px 9px;border:1px solid color-mix(in srgb,var(--hub-accent) 30%,transparent);border-radius:8px;background:var(--dsw-alias-bg-base,#f7f8fb);color:inherit;font:inherit}.owc-hub input[type=checkbox]{margin-right:8px}.owc-hub textarea{min-height:70px;resize:vertical}.owc-hub article{border-top:1px solid color-mix(in srgb,var(--hub-accent) 18%,transparent);padding:10px 0}.owc-hub output{font-variant-numeric:tabular-nums}.owc-hub .hub-error{color:#bd465a}.owc-hub .hub-preview{display:block;width:144px;height:192px;object-fit:contain;margin:auto;background:repeating-conic-gradient(#ddd 0% 25%,#f7f7f7 0% 50%) 50%/16px 16px;border-radius:12px}.owc-hub [role=status]{font-size:12px}.owc-hub small{display:block;opacity:.7}.owc-hub details{margin:10px 0}.owc-hub summary{cursor:pointer}.owc-hub input[type=range]{padding:0!important}.owc-hub-alert{bottom:20px}.owc-hub-alert .hub-row button{flex:1}.owc-hub [data-complete=true]{color:var(--hub-accent)}
`;

export function useCompanionFeatures(React, input) {
  const h = React.createElement;
  const { useState, useRef, useEffect } = React;
  const zh = !String(input.language || 'zh').startsWith('en');
  const text = (cn, en) => (zh ? cn : en);
  const [state, setState] = useState(defaultCompanionState);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [screen, setScreen] = useState(null),
    [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const [agentAccess, setAgentAccess] = useState(false);
  const [backup, setBackup] = useState(null),
    [restoreBefore, setRestoreBefore] = useState(null);
  const [photo, setPhoto] = useState(null),
    [crop, setCrop] = useState({ zoom: 1, x: 50, y: 50 }),
    [photoPreview, setPhotoPreview] = useState('');
  const [notes, setNotes] = useState(null),
    [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(undefined);
  const [testReminder, setTestReminder] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const latest = useRef(input);
  latest.current = input;
  const current = useRef(state);
  current.current = state;
  const runtime = useRef(null),
    owner = useRef(null),
    audio = useRef(null),
    panel = useRef(null),
    launcher = useRef(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const lastInput = useRef(0),
    alive = useRef(true),
    returnFocus = useRef(null);
  if (!owner.current) owner.current = crypto.randomUUID();
  const now = tick;
  const events = ready ? companionEvents(state, input, now) : [];
  const pending = companionPending(state, events, now);
  const owned = pending.filter(
    (e) =>
      state.deliveries[e.id]?.owner === owner.current && state.deliveries[e.id]?.leaseUntil > now,
  );
  const active = testReminder
    ? { id: 'test', kind: 'test', label: text('测试计时已结束', 'Test timer finished') }
    : owned[0];
  const showAlert = !!(active && !screen && !document.hidden && !input.editing);

  async function settingsCall(action, extra = {}) {
    const response = await fetch(new URL('offwork-clock/settings', document.baseURI), {
      method: action === 'get' ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'X-Offwork-Client': '1',
        ...(action === 'get' ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(action === 'get' ? {} : { body: JSON.stringify({ action, ...extra }) }),
    });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(body.error || 'Settings unavailable');
    return body;
  }
  async function unlockSound() {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) throw new Error(text('浏览器不支持提示音', 'Audio is unavailable'));
    if (!audio.current) audio.current = new C();
    await audio.current.resume();
    setSoundReady(audio.current.state === 'running');
  }
  function chime() {
    if (audio.current?.state !== 'running') return false;
    const ctx = audio.current,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    return true;
  }
  useEffect(() => {
    alive.current = true;
    const changed = () => {
      lastInput.current = Date.now();
    };
    const unlock = () => {
      if (current.current.preferences.sound) void unlockSound().catch(() => {});
    };
    document.addEventListener('input', changed);
    document.addEventListener('pointerdown', unlock);
    return () => {
      alive.current = false;
      document.removeEventListener('input', changed);
      document.removeEventListener('pointerdown', unlock);
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    let store = createStateStore(
        window.indexedDB,
        COMPANION_DB,
        defaultCompanionState,
        validateCompanionState,
      ),
      closed = false,
      running = false,
      failed = false;
    let channel;
    try {
      channel = new BroadcastChannel(COMPANION_DB);
    } catch {}
    const publish = (result) => {
      if (!closed) {
        setState(result);
        setReady(true);
        setTick(Date.now());
      }
    };
    async function update(action) {
      const result = await store.update((s) => companionTransition(s, action, Date.now()));
      publish(result);
      channel?.postMessage('changed');
      return result;
    }
    async function poll() {
      if (closed || running || failed) return;
      running = true;
      let notify = null;
      try {
        const result = await store.update((s) => {
          const time = Date.now(),
            signals = latest.current;
          const nextEvents = companionEvents(s, signals, time);
          let next = reconcileCompanion(s, nextEvents, time);
          const available = companionPending(next, nextEvents, time);
          const first = available[0];
          const recentlyTyping = next.preferences.deferTyping && time - lastInput.current < 5000;
          const linkedRunning =
            next.preferences.linkedSession &&
            signals.runningSessions?.includes(next.preferences.linkedSession);
          const defer =
            first &&
            first.kind !== 'smoking' &&
            first.kind !== 'timer' &&
            (recentlyTyping || linkedRunning) &&
            time - next.deliveries[first.id].createdAt < 120000;
          if (!document.hidden && first && !signals.editing && !defer)
            next = companionTransition(
              next,
              { type: 'claim', id: first.id, owner: owner.current },
              time,
            );
          else next = companionTransition(next, { type: 'release', owner: owner.current }, time);
          if (first && !defer && !signals.editing) {
            const d = next.deliveries[first.id];
            const foreground = !document.hidden && d.owner === owner.current;
            const background =
              document.hidden &&
              d.leaseUntil <= time &&
              next.preferences.notifications &&
              window.Notification?.permission === 'granted';
            if (!d.notifiedAt && (foreground || background)) {
              next = companionTransition(next, { type: 'notify', id: first.id }, time);
              notify = { event: first, background, preferences: next.preferences };
            }
          }
          return next;
        });
        publish(result);
        if (notify && !closed) {
          if (notify.preferences.sound) chime();
          if (notify.background) {
            try {
              const notification = new Notification(
                text('下班搭子 · 到点了', 'Offwork · Time is up'),
                { body: notify.event.label, tag: 'offwork:' + notify.event.id },
              );
              notification.onclick = () => {
                window.focus();
                setScreen('reminders');
                notification.close();
              };
            } catch {
              setNotice(
                text(
                  '系统通知未能发送，回到页面可查看提醒',
                  'System notification unavailable; reminders remain in the page',
                ),
              );
            }
          }
        }
      } catch {
        failed = true;
        setError(
          text(
            '本地数据暂不可用；自动提醒已暂停，请重试读取。',
            'Local storage unavailable. Automatic reminders paused; retry loading.',
          ),
        );
      } finally {
        running = false;
      }
    }
    runtime.current = {
      update,
      poll,
      retry: async () => {
        store.close();
        store = createStateStore(
          window.indexedDB,
          COMPANION_DB,
          defaultCompanionState,
          validateCompanionState,
        );
        failed = false;
        setError('');
        await poll();
      },
      read: () => store.update((s) => s),
    };
    const sync = () => {
      void poll();
    };
    channel && (channel.onmessage = sync);
    const interval = setInterval(sync, 1000);
    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    return () => {
      closed = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('focus', sync);
      channel?.close();
      runtime.current = null;
      void store
        .update((s) =>
          companionTransition(s, { type: 'release', owner: owner.current }, Date.now()),
        )
        .catch(() => {})
        .finally(() => store.close());
    };
  }, []);

  async function act(action) {
    if (!runtime.current) return;
    setBusy(true);
    setError('');
    try {
      return await runtime.current.update(action);
    } catch (e) {
      setError(e.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function execute(fn) {
    setBusy(true);
    setError('');
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  function open(next, event) {
    if (dirty || photo) {
      setConfirmLeave(next);
      return;
    }
    returnFocus.current = event?.currentTarget || launcher.current;
    setNotes(null);
    setScreen(next);
    setNotice('');
    setBackup(null);
  }
  function close() {
    if (dirty || photo) {
      setConfirmLeave(null);
      return;
    }
    setScreen(null);
    setNotes(null);
    setPhoto(null);
    setBackup(null);
    returnFocus.current?.isConnected && returnFocus.current.focus();
  }
  useEffect(() => {
    if (screen === 'settings')
      void execute(async () => {
        const r = await settingsCall('get');
        setAgentAccess(r.agentAccess);
      });
  }, [screen]);
  useEffect(() => {
    if (!screen) return;
    panel.current?.querySelector('header button')?.focus();
  }, [screen]);
  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return;
    }
    try {
      setPhotoPreview(cropCompanionImage(photo, crop));
    } catch (e) {
      setError(e.message);
    }
  }, [photo, crop]);

  useEffect(() => {
    const recovery = createCompanionRecoveryStore(window.indexedDB, createStateStore);
    let live = true;
    recovery
      .update((s) => s)
      .then((s) => {
        if (live && s.bundle) setRestoreBefore(s.bundle);
      })
      .catch(() => {})
      .finally(() => recovery.close());
    return () => {
      live = false;
    };
  }, []);

  function download(name, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportBackup() {
    return execute(async () => {
      const local = await runtime.current.read();
      const waterStore = createHydrationStore(window.indexedDB),
        smokeStore = createStateStore(
          window.indexedDB,
          SMOKING_TIMER_DB,
          defaultCountdown,
          validateCountdown,
        );
      let water, smoking;
      try {
        water = await waterStore.update((s) => s);
        smoking = await smokeStore.update((s) => s);
      } finally {
        waterStore.close();
        smokeStore.close();
      }
      // Browser data only; salary is an explicitly separate export below.
      download('offwork-browser-backup.json', {
        format: 'dsh-offwork-browser',
        version: 1,
        createdAt: Date.now(),
        companion: local,
        water,
        smoking,
        view: latest.current.view,
      });
      setNotice(
        text(
          '浏览器数据已导出；不包含薪资。文件含个人记录，请妥善保存。',
          'Browser data exported without salary. Keep the personal backup private.',
        ),
      );
    });
  }
  async function inspectBackup(file) {
    return execute(async () => {
      if (!file || file.size > 3 * 1024 * 1024)
        throw new Error(text('备份须小于3MB', 'Backup must be smaller than 3MB'));
      const parsed = validateBrowserBackup(JSON.parse(await file.text()));
      const w = createHydrationStore(window.indexedDB),
        s = createStateStore(
          window.indexedDB,
          SMOKING_TIMER_DB,
          defaultCountdown,
          validateCountdown,
        );
      try {
        const baseline = {
          companion: await runtime.current.read(),
          water: await w.update((x) => x),
          smoking: await s.update((x) => x),
          view: latest.current.view,
        };
        setBackup({ data: parsed, stamp: companionBackupStamp(baseline) });
      } finally {
        w.close();
        s.close();
      }
    });
  }
  async function restoreBackup() {
    return execute(async () => {
      if (!backup) return;
      // Capture rollback material before the first write. A partial failure stays
      // visible and can be restored; never silently claim a cross-DB transaction.
      const waterStore = createHydrationStore(window.indexedDB),
        smokeStore = createStateStore(
          window.indexedDB,
          SMOKING_TIMER_DB,
          defaultCountdown,
          validateCountdown,
        );
      const recovery = createCompanionRecoveryStore(window.indexedDB, createStateStore);
      try {
        const before = {
          companion: await runtime.current.read(),
          water: await waterStore.update((s) => s),
          smoking: await smokeStore.update((s) => s),
          view: latest.current.view,
        };
        if (companionBackupStamp(before) !== backup.stamp)
          throw new Error(
            text(
              '预览后数据已变化，请重新选择备份文件。',
              'Data changed after preview. Select the backup again.',
            ),
          );
        const rollback = {
          format: 'dsh-offwork-browser',
          version: 1,
          createdAt: Date.now(),
          ...before,
        };
        await recovery.update((s) => ({ ...s, bundle: rollback }));
        setRestoreBefore(rollback);
        download('offwork-before-restore.json', rollback);
        const original = backup.data;
        await runtime.current.update({
          type: 'restore',
          value: original.companion,
          base: before.companion.revision,
          stamp: companionStateStamp(before.companion),
        });
        await waterStore.update((s) => {
          if (companionWaterStamp(s) !== companionWaterStamp(before.water))
            throw new Error('Water changed; restore interrupted');
          return { ...original.water, claim: null, revision: s.revision };
        });
        await smokeStore.update((s) => {
          if (s.revision !== before.smoking.revision)
            throw new Error('Timer changed; restore interrupted');
          return { ...original.smoking, revision: s.revision };
        });
        latest.current.setView(original.view);
        latest.current.refreshLegacy();
        setBackup(null);
        setNotice(
          text(
            '已恢复，通知和声音需重新开启。恢复前备份已下载。',
            'Restored. Re-enable sound/notifications if wanted. A pre-restore backup was downloaded.',
          ),
        );
      } catch (e) {
        setError(
          text(
            '恢复没有完成。请检查下方错误；若已有部分写入，可从“上次恢复前备份”下载回退文件。',
            'Restore did not complete. If any data was written, use the pre-restore backup below to roll back.',
          ) +
            ' ' +
            e.message,
        );
      } finally {
        waterStore.close();
        smokeStore.close();
        recovery.close();
      }
    });
  }
  async function handleReminder(event, operation) {
    if (event.kind === 'test') {
      setTestReminder(false);
      setScreen('settings');
      setNotice(
        text(
          '测试完成；没有修改计时或记录。',
          'Test completed; no timers or records were changed.',
        ),
      );
      return;
    }
    if (operation === 'dismiss' || operation === 'snooze')
      return act({ type: operation, id: event.id });
    if (event.kind === 'wrap') {
      open('wrap');
      return;
    }
    if (event.kind === 'water') {
      const success = await latest.current.drink();
      if (success) await act({ type: 'dismiss', id: event.id });
      return;
    }
    let success;
    if (event.kind === 'smoking') success = await latest.current.restartSmoking();
    else {
      const timer = current.current.timers.find((t) => t.id === event.timerId);
      if (timer)
        success = await act({
          type: 'timer',
          id: timer.id,
          revision: timer.clock.revision,
          operation: { type: 'restart' },
        });
    }
    if (success) {
      await act({
        type: 'record',
        event: { id: event.id, type: 'timer', at: Date.now(), label: event.label },
      });
      await act({ type: 'dismiss', id: event.id });
    }
  }
  const button = (label, onClick, primary = false, extra = {}) =>
    h(
      'button',
      { type: 'button', onClick, disabled: busy, 'data-primary': primary, ...extra },
      label,
    );
  const check = (label, checked, onChange) =>
    h(
      'label',
      null,
      h('input', {
        type: 'checkbox',
        checked,
        disabled: busy,
        onChange: (e) => onChange(e.target.checked),
      }),
      label,
    );
  const prefs = (patch) => act({ type: 'preferences', patch });
  const reminderCard = (e) =>
    h(
      'article',
      { key: e.id, 'data-reminder-kind': e.kind },
      h('strong', null, e.label),
      h(
        'p',
        { className: 'hub-muted' },
        e.kind === 'wrap'
          ? text('留下一件明天要做的事，再结束今天。', 'Leave one next step for tomorrow.')
          : text(
              '计时已结束。关闭只收起提示，稍后会在10分钟后再提醒。',
              'Time is up. Close dismisses the card; snooze reminds you in 10 minutes.',
            ),
      ),
      h(
        'div',
        { className: 'hub-row' },
        button(
          e.kind === 'water'
            ? text('喝了一杯', 'Drank water')
            : e.kind === 'wrap'
              ? text('收尾一下', 'Wrap up')
              : text('重新计时', 'Restart'),
          () => handleReminder(e, 'complete'),
          true,
        ),
        button(text('稍后10分钟', 'Snooze 10m'), () => handleReminder(e, 'snooze')),
        button(text('关闭', 'Dismiss'), () => handleReminder(e, 'dismiss')),
      ),
    );

  function timerPanel() {
    return h(
      React.Fragment,
      null,
      h(
        'p',
        { className: 'hub-muted' },
        text(
          '现有抽烟计时保留原设置；下面可以添加独立计时。',
          'Your smoking timer keeps its settings. Add independent timers below.',
        ),
      ),
      button(text('打开抽烟计时', 'Open smoking timer'), () => {
        close();
        latest.current.openLegacy('smoking');
      }),
      state.timers.map((timer) => {
        const view = countdownView(timer.clock, now);
        return h(
          'article',
          { key: timer.id },
          h('strong', null, timer.name),
          ' · ',
          h(
            'output',
            null,
            view.phase === 'idle'
              ? text('未开始', 'Not started')
              : formatDuration(Math.ceil(view.remaining / 1000)),
          ),
          h(
            'div',
            { className: 'hub-row' },
            button(
              view.phase === 'running'
                ? text('暂停', 'Pause')
                : view.phase === 'paused'
                  ? text('继续', 'Resume')
                  : text('开始', 'Start'),
              () =>
                act({
                  type: 'timer',
                  id: timer.id,
                  revision: timer.clock.revision,
                  operation: {
                    type:
                      view.phase === 'running'
                        ? 'pause'
                        : view.phase === 'paused'
                          ? 'resume'
                          : 'start',
                  },
                }),
              true,
            ),
            button(text('重新计时', 'Restart'), () =>
              act({
                type: 'timer',
                id: timer.id,
                revision: timer.clock.revision,
                operation: { type: 'restart' },
              }),
            ),
            button(text('停止', 'Stop'), () =>
              act({
                type: 'timer',
                id: timer.id,
                revision: timer.clock.revision,
                operation: { type: 'stop' },
              }),
            ),
            button(text('删除', 'Delete'), () => {
              if (window.confirm(text('删除此计时？', 'Delete this timer?')))
                void act({
                  type: 'timer',
                  id: timer.id,
                  revision: timer.clock.revision,
                  operation: { type: 'delete' },
                });
            }),
          ),
        );
      }),
      h(
        'form',
        {
          onSubmit: async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              data = new FormData(form);
            const result = await act({
              type: 'add-timer',
              id: crypto.randomUUID(),
              name: String(data.get('name')),
              minutes: Number(data.get('minutes')),
            });
            if (result) form.reset();
          },
        },
        h(
          'label',
          null,
          text('计时名称', 'Timer name'),
          h('input', {
            name: 'name',
            maxLength: 40,
            required: true,
            placeholder: text('泡茶 / 起身 / 专注', 'Tea / stretch / focus'),
          }),
        ),
        h(
          'label',
          null,
          text('时长（1–1440分钟）', 'Duration (1–1440 minutes)'),
          h('input', {
            name: 'minutes',
            type: 'number',
            min: 1,
            max: 1440,
            step: 1,
            required: true,
            defaultValue: 25,
          }),
        ),
        h(
          'button',
          { type: 'submit', disabled: busy || state.timers.length >= 8 },
          text('添加计时', 'Add timer'),
        ),
      ),
    );
  }
  function wrapPanel() {
    const shift = input.shift,
      date = shift?.shiftDate || new Date(now).toISOString().slice(0, 10);
    const entry =
      notes?.date === date
        ? notes
        : {
            date,
            done: state.journal[date]?.done || '',
            next: state.journal[date]?.next || '',
            base: state.journal[date]?.updatedAt || 0,
          };
    const summary = companionDaySummary(state, date, input.timezone || 'UTC');
    const previous = Object.entries(state.journal)
      .filter(([key]) => key < date)
      .sort(([a], [b]) => b.localeCompare(a))[0];
    const save = (end) =>
      execute(async () => {
        const result = await runtime.current.update({ type: 'journal', ...entry, end });
        setNotes({ ...entry, base: result.journal[date].updatedAt });
        setDirty(false);
        setNotice(
          end
            ? text(
                '今天收尾了。全天喝水与代理任务照常运行。',
                'Day wrapped up. All-day water reminders and agent tasks keep running.',
              )
            : text('收尾草稿已保存', 'Wrap-up draft saved'),
        );
        if (end) latest.current.react?.();
      });
    return h(
      React.Fragment,
      null,
      h(
        'p',
        null,
        date,
        ' · ',
        state.journal[date]?.endedAt
          ? text('已收尾', 'Wrapped up')
          : text('今天的收尾', 'Today’s wrap-up'),
      ),
      previous?.[1].next &&
        h(
          'article',
          null,
          h('strong', null, text('上次留给自己的事', 'Your previous next step')),
          h('p', null, previous[1].next),
        ),
      h(
        'label',
        null,
        text('今天完成了什么（可跳过）', 'What did you finish? (optional)'),
        h('textarea', {
          value: entry.done,
          'aria-label': text('今天完成了什么（可跳过）', 'What did you finish? (optional)'),
          maxLength: 500,
          onChange: (e) => {
            setNotes({ ...entry, done: e.target.value });
            setDirty(true);
          },
        }),
      ),
      h(
        'label',
        null,
        text('明天第一件事（可跳过）', 'One next step for tomorrow (optional)'),
        h('textarea', {
          value: entry.next,
          'aria-label': text('明天第一件事（可跳过）', 'One next step for tomorrow (optional)'),
          maxLength: 500,
          onChange: (e) => {
            setNotes({ ...entry, next: e.target.value });
            setDirty(true);
          },
        }),
      ),
      h(
        'p',
        { className: 'hub-muted' },
        text(
          `当天已记录喝水 ${summary.water} 次，确认计时结束 ${summary.timers} 次。只统计新版开始后的实际操作。`,
          `Recorded today: ${summary.water} drinks, ${summary.timers} timer acknowledgements. Only actions recorded since this update are counted.`,
        ),
      ),
      h(
        'div',
        { className: 'hub-row' },
        button(text('保存草稿', 'Save draft'), () => save(false)),
        button(text('结束今天', 'End today'), () => save(true), true),
      ),
      !input.configured &&
        h(
          'p',
          { className: 'hub-muted' },
          text(
            '未配置作息也可写收尾；设置作息后可开启下班前提醒。',
            'You can write a wrap-up without a schedule. Configure one to enable pre-offwork reminders.',
          ),
        ),
      h(
        'details',
        null,
        h('summary', null, text('最近收尾记录', 'Recent wrap-ups')),
        Object.entries(state.journal)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 14)
          .map(([d, j]) =>
            h(
              'article',
              { key: d },
              h('strong', null, d),
              h('p', null, j.done || '—'),
              h('small', null, text('下一步：', 'Next: '), j.next || '—'),
            ),
          ),
      ),
    );
  }
  function settingsPanel() {
    const p = state.preferences;
    return h(
      React.Fragment,
      null,
      h(
        'p',
        { className: 'hub-muted' },
        text(
          '提醒需要页面保持打开；关闭所有页面后，下次打开恢复到期状态。后台可能被浏览器延迟。',
          'Keep a page open for reminders. Closed pages restore overdue state on reopening; browsers may delay background delivery.',
        ),
      ),
      button(text('测试页面提示', 'Test in-page reminder'), () => {
        setTestReminder(true);
        setScreen(null);
      }),
      check(text('提示音', 'Sound'), p.sound, async (value) => {
        if (!value) return prefs({ sound: false });
        await execute(async () => {
          await unlockSound();
          await runtime.current.update({ type: 'preferences', patch: { sound: true } });
        });
      }),
      button(text('试听', 'Play sample'), () =>
        execute(async () => {
          await unlockSound();
          chime();
        }),
      ),
      p.sound &&
        !soundReady &&
        h(
          'small',
          null,
          text(
            '提示音等待页面交互解锁；先点击试听。',
            'Sound needs a page interaction. Play the sample first.',
          ),
        ),
      check(
        text('后台浏览器通知', 'Background browser notifications'),
        p.notifications,
        async (value) => {
          if (!value) return prefs({ notifications: false });
          await execute(async () => {
            if (!window.Notification || !window.isSecureContext)
              throw new Error(
                text(
                  '需要HTTPS和支持通知的浏览器',
                  'HTTPS and a browser with notifications are required',
                ),
              );
            const permission = await Notification.requestPermission();
            if (permission !== 'granted')
              throw new Error(
                text(
                  '通知权限未授予；页面提示仍可用',
                  'Permission not granted; in-page reminders remain available',
                ),
              );
            await runtime.current.update({ type: 'preferences', patch: { notifications: true } });
          });
        },
      ),
      h(
        'small',
        null,
        text('通知权限：', 'Notification permission: ') +
          (window.Notification?.permission || 'unavailable'),
      ),
      h(
        'div',
        { className: 'hub-row' },
        button(text('全部免打扰30分钟', 'Quiet for 30m'), () =>
          prefs({ quietUntil: Date.now() + 1800000 }),
        ),
        button(text('结束免打扰', 'End quiet mode'), () => prefs({ quietUntil: 0 })),
      ),
      p.quietUntil > now &&
        h(
          'output',
          null,
          text('免打扰剩余 ', 'Quiet remaining '),
          formatDuration(Math.ceil((p.quietUntil - now) / 1000)),
        ),
      check(text('下班前提醒收尾', 'Remind me to wrap up'), p.wrapEnabled, (v) =>
        prefs({ wrapEnabled: v }),
      ),
      h(
        'label',
        null,
        text('提前多久', 'How early'),
        h(
          'select',
          {
            'aria-label': text('提前多久', 'How early'),
            value: p.leadMinutes,
            onChange: (e) => prefs({ leadMinutes: Number(e.target.value) }),
          },
          [0, 5, 10, 15, 30, 60].map((n) =>
            h('option', { key: n, value: n }, n + text('分钟', ' min')),
          ),
        ),
      ),
      check(
        text(
          '输入时暂缓休息与收尾提示（最多2分钟）',
          'Defer rest/wrap-up while typing (up to 2 min)',
        ),
        p.deferTyping,
        (v) => prefs({ deferTyping: v }),
      ),
      h(
        'label',
        null,
        text(
          '等待这个会话本轮结束再提醒（最多2分钟）',
          'Defer while this session runs (up to 2 min)',
        ),
        h(
          'select',
          {
            'aria-label': text('关联会话', 'Linked session'),
            value: p.linkedSession,
            onChange: (e) => prefs({ linkedSession: e.target.value }),
          },
          h('option', { value: '' }, text('不关联', 'No linked session')),
          (input.sessionIds || []).map((id) =>
            h('option', { key: id, value: id }, id.slice(0, 24)),
          ),
        ),
      ),
      h(
        'small',
        null,
        text(
          '只读取运行状态，不读取会话内容。宿主未提供状态时按普通计时提醒。',
          'Reads status only. Falls back to normal reminders when host status is unavailable.',
        ),
      ),
      h(
        'article',
        null,
        check(
          text('允许代理工具读写作息与薪资', 'Allow agent tools to read/write schedule and salary'),
          agentAccess,
          async (allowed) =>
            execute(async () => {
              const r = await settingsCall('access', { allowed });
              setAgentAccess(r.agentAccess);
            }),
        ),
        h(
          'small',
          null,
          text(
            '默认关闭。开启后，工具返回的数据可能进入会话记录；界面设置始终直接保存。',
            'Off by default. Tool results may enter conversation history. UI settings save directly.',
          ),
        ),
      ),
      button(text('作息与薪资设置', 'Schedule and salary'), () => {
        close();
        latest.current.openLegacy('schedule');
      }),
    );
  }
  function appearancePanel() {
    const p = state.preferences;
    return h(
      React.Fragment,
      null,
      h(
        'label',
        null,
        text('主题色', 'Accent theme'),
        h(
          'select',
          {
            'aria-label': text('主题色', 'Accent theme'),
            value: p.theme,
            onChange: (e) => prefs({ theme: e.target.value }),
          },
          Object.keys(COMPANION_THEMES).map((k) =>
            h(
              'option',
              { key: k, value: k },
              {
                host: text('跟随宿主', 'Follow host'),
                lavender: text('雾紫', 'Lavender'),
                ocean: text('海蓝', 'Ocean'),
                rose: text('玫瑰', 'Rose'),
                slate: text('石板灰', 'Slate'),
              }[k],
            ),
          ),
        ),
      ),
      h(
        'label',
        null,
        text('卡片字号与宽度', 'Card text and width'),
        h(
          'select',
          {
            'aria-label': text('卡片字号与宽度', 'Card text and width'),
            value: p.cardScale,
            onChange: (e) => prefs({ cardScale: Number(e.target.value) }),
          },
          [0.9, 1, 1.1, 1.2].map((v) =>
            h('option', { key: v, value: v }, Math.round(v * 100) + '%'),
          ),
        ),
      ),
      button(text('调整人物大小与内置形象', 'Character size and built-in appearances'), () => {
        close();
        latest.current.openLegacy('appearance');
      }),
      h(
        'label',
        null,
        text('导入自己的形象（仅本浏览器）', 'Import your image (this browser only)'),
        h('input', {
          type: 'file',
          accept: 'image/png,image/webp,image/jpeg',
          onChange: (e) => {
            const f = e.target.files[0];
            e.target.value = '';
            void execute(async () => {
              setPhoto(await loadCompanionImage(f));
              setCrop({ zoom: 1, x: 50, y: 50 });
            });
          },
        }),
      ),
      (photoPreview || p.image) &&
        h('img', {
          className: 'hub-preview',
          src: photoPreview || p.image,
          alt: text('形象裁切预览', 'Character crop preview'),
        }),
      photo &&
        h(
          React.Fragment,
          null,
          ['zoom', 'x', 'y'].map((k) =>
            h(
              'label',
              { key: k },
              {
                zoom: text('缩放', 'Zoom'),
                x: text('水平位置', 'Horizontal position'),
                y: text('垂直位置', 'Vertical position'),
              }[k],
              h('input', {
                type: 'range',
                min: k === 'zoom' ? 1 : 0,
                max: k === 'zoom' ? 3 : 100,
                step: k === 'zoom' ? 0.05 : 1,
                value: crop[k],
                onChange: (e) => setCrop({ ...crop, [k]: Number(e.target.value) }),
              }),
            ),
          ),
          h(
            'div',
            { className: 'hub-row' },
            button(
              text('应用人物', 'Apply character'),
              async () => {
                const r = await prefs({ image: photoPreview, customEnabled: true });
                if (r) {
                  setPhoto(null);
                  latest.current.setView({ companion: true });
                }
              },
              true,
            ),
            button(text('取消预览', 'Cancel preview'), () => setPhoto(null)),
          ),
        ),
      p.image &&
        check(text('使用自定义人物', 'Use custom character'), p.customEnabled, (v) =>
          prefs({ customEnabled: v }),
        ),
      button(text('恢复内置外观和默认主题', 'Restore built-in appearance and theme'), () =>
        prefs({ customEnabled: false, theme: 'host', cardScale: 1 }),
      ),
      h(
        'small',
        null,
        text(
          '静态图片不会自动生成动画。图片会转换为PNG，包含在浏览器备份中。取消预览不会更换已保存人物。',
          'Static images do not generate animation. Images are converted to PNG and included in browser backups. Cancelling leaves the saved character unchanged.',
        ),
      ),
    );
  }
  function dataPanel() {
    return h(
      React.Fragment,
      null,
      h(
        'p',
        { className: 'hub-muted' },
        text(
          '浏览器备份包含喝水、抽烟、自定义计时、收尾笔记与外观，不含薪资。恢复会替换这些浏览器数据，并先下载恢复前备份。',
          'Browser backups include water, smoking, timers, wrap-up notes and appearance, without salary. Restore replaces this data after downloading a pre-restore backup.',
        ),
      ),
      button(text('导出浏览器备份', 'Export browser backup'), exportBackup, true),
      h(
        'label',
        null,
        text('预览要恢复的备份', 'Preview backup to restore'),
        h('input', {
          type: 'file',
          accept: '.json,application/json',
          onChange: (e) => {
            const f = e.target.files[0];
            e.target.value = '';
            void inspectBackup(f);
          },
        }),
      ),
      backup &&
        h(
          'article',
          null,
          h('strong', null, text('恢复预览', 'Restore preview')),
          h(
            'p',
            null,
            text(
              `喝水计数 ${backup.data.water.count}；计时 ${backup.data.companion.timers.length}；收尾 ${Object.keys(backup.data.companion.journal).length} 条。`,
              `Water count ${backup.data.water.count}; timers ${backup.data.companion.timers.length}; wrap-ups ${Object.keys(backup.data.companion.journal).length}.`,
            ),
          ),
          h(
            'p',
            { className: 'hub-muted' },
            text(
              '请暂时停止其他标签页的操作。声音与系统通知在恢复后关闭。',
              'Pause actions in other tabs. Sound and notifications will be disabled after restore.',
            ),
          ),
          button(text('确认替换并恢复', 'Confirm replacement and restore'), restoreBackup, true),
          button(text('取消', 'Cancel'), () => setBackup(null)),
        ),
      restoreBefore &&
        button(text('下载上次恢复前备份', 'Download pre-restore backup'), () =>
          download('offwork-before-restore.json', restoreBefore),
        ),
      h(
        'article',
        null,
        h('strong', null, text('薪资单独导出', 'Separate salary export')),
        h(
          'p',
          { className: 'hub-muted' },
          text(
            '此文件包含真实薪资，请自行保管。不会上传或发送到会话。',
            'Contains salary. Store it privately; not uploaded or sent to a conversation.',
          ),
        ),
        button(text('导出作息与薪资', 'Export schedule and salary'), () =>
          execute(async () => {
            const r = await settingsCall('get');
            download('offwork-private-settings.json', {
              format: 'dsh-offwork-settings',
              version: 1,
              settings: r.settings,
            });
          }),
        ),
        h(
          'label',
          null,
          text('恢复作息与薪资', 'Restore schedule and salary'),
          h('input', {
            type: 'file',
            accept: '.json,application/json',
            onChange: (e) => {
              const file = e.target.files[0];
              e.target.value = '';
              void execute(async () => {
                if (!file || file.size > 16384) throw new Error('Invalid settings file');
                const value = JSON.parse(await file.text());
                if (value.format !== 'dsh-offwork-settings' || value.version !== 1)
                  throw new Error('Invalid settings file');
                if (
                  !window.confirm(
                    text(
                      '将替换作息与薪资，是否继续？当前设置会先下载备份。',
                      'Replace schedule and salary? Current settings will be downloaded first.',
                    ),
                  )
                )
                  return;
                const before = await settingsCall('get');
                download('offwork-settings-before-restore.json', {
                  format: 'dsh-offwork-settings',
                  version: 1,
                  settings: before.settings,
                });
                await settingsCall('set', { settings: value.settings });
                latest.current.reload();
                setNotice(text('作息与薪资已恢复', 'Schedule and salary restored'));
              });
            },
          }),
        ),
      ),
    );
  }
  function render() {
    const tabs = [
      ['reminders', text('提醒', 'Reminders')],
      ['timers', text('计时', 'Timers')],
      ['wrap', text('收尾', 'Wrap-up')],
      ['settings', text('设置', 'Settings')],
      ['appearance', text('外观', 'Appearance')],
      ['data', text('备份', 'Backup')],
    ];
    const panelStyle = {
      ...(COMPANION_THEMES[state.preferences.theme]
        ? { '--hub-accent': COMPANION_THEMES[state.preferences.theme] }
        : {}),
      fontSize: 13 * state.preferences.cardScale,
      width: Math.min(370 * state.preferences.cardScale, window.innerWidth - 24),
    };
    return h(
      React.Fragment,
      null,
      h('style', null, COMPANION_APP_STYLE),
      h(
        'button',
        {
          ref: launcher,
          type: 'button',
          className: 'owc-hub-launch',
          'data-companion-launch': true,
          onClick: (e) => open('reminders', e),
          'aria-expanded': !!screen,
        },
        text('搭子菜单', 'Companion menu'),
        pending.length ? ' · ' + pending.length : text(' · 计时 / 收尾', ' · Timers / wrap-up'),
      ),
      (screen || showAlert || (error && !ready)) &&
        h(
          'section',
          {
            ref: panel,
            className: 'owc-hub' + (!screen ? ' owc-hub-alert' : ''),
            style: panelStyle,
            'data-companion-screen': screen || 'alert',
            role: 'region',
            'aria-label': text('下班搭子', 'Offwork companion'),
            onPointerDown: (e) => e.stopPropagation(),
            onContextMenu: (e) => e.stopPropagation(),
            onKeyDown: (e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
                screen ? close() : active && void handleReminder(active, 'dismiss');
              }
            },
          },
          h(
            'header',
            null,
            h(
              'strong',
              null,
              screen ? text('下班搭子', 'Offwork companion') : text('到点了', 'Time is up'),
            ),
            button(
              '×',
              () => (screen ? close() : active && handleReminder(active, 'dismiss')),
              false,
              { 'aria-label': text('关闭面板', 'Close panel') },
            ),
          ),
          screen &&
            h(
              'nav',
              { role: 'tablist', 'aria-label': text('搭子功能', 'Companion features') },
              tabs.map(([id, label]) =>
                button(label, (e) => open(id, e), false, {
                  key: id,
                  role: 'tab',
                  'aria-selected': screen === id,
                }),
              ),
            ),
          error && h('p', { className: 'hub-error', role: 'alert' }, error),
          (!ready || error) &&
            button(text('重试读取', 'Retry loading'), () => runtime.current?.retry()),
          notice && h('p', { role: 'status' }, notice),
          confirmLeave !== undefined
            ? h(
                'article',
                null,
                h(
                  'p',
                  null,
                  text(
                    '有未保存的笔记或外观预览，放弃后离开？',
                    'Discard unsaved notes or image preview?',
                  ),
                ),
                button(text('继续编辑', 'Keep editing'), () => setConfirmLeave(undefined)),
                button(text('放弃并离开', 'Discard and leave'), () => {
                  setDirty(false);
                  setNotes(null);
                  setPhoto(null);
                  setScreen(confirmLeave);
                  setConfirmLeave(undefined);
                }),
              )
            : !ready
              ? null
              : !screen
                ? reminderCard(active)
                : screen === 'timers'
                  ? timerPanel()
                  : screen === 'wrap'
                    ? wrapPanel()
                    : screen === 'settings'
                      ? settingsPanel()
                      : screen === 'appearance'
                        ? appearancePanel()
                        : screen === 'data'
                          ? dataPanel()
                          : h(
                              React.Fragment,
                              null,
                              pending.length
                                ? pending.map(reminderCard)
                                : h(
                                    'p',
                                    null,
                                    text(
                                      '目前没有待处理提醒。计时到点会在这里出现。',
                                      'No pending reminders. Timers appear here when due.',
                                    ),
                                  ),
                              events.length > pending.length &&
                                h(
                                  'details',
                                  null,
                                  h(
                                    'summary',
                                    null,
                                    text('已关闭或稍后的到期计时', 'Dismissed or snoozed timers'),
                                  ),
                                  events
                                    .filter((e) => !pending.includes(e))
                                    .map((e) =>
                                      h(
                                        'article',
                                        { key: e.id },
                                        h('strong', null, e.label),
                                        button(text('查看', 'View'), () => {
                                          close();
                                          latest.current.openLegacy(
                                            e.kind === 'water'
                                              ? 'home'
                                              : e.kind === 'smoking'
                                                ? 'smoking'
                                                : 'income',
                                          );
                                        }),
                                      ),
                                    ),
                                ),
                              button(
                                text('开一个计时', 'Start a timer'),
                                (e) => open('timers', e),
                                true,
                              ),
                              button(text('准备下班', 'Wrap up today'), (e) => open('wrap', e)),
                            ),
        ),
    );
  }
  return {
    state,
    ready,
    screen,
    render,
    act,
    open,
    quiet: state.preferences.quietUntil > now,
    customImage: state.preferences.customEnabled ? state.preferences.image : null,
    record: (event) =>
      runtime.current
        ?.update({ type: 'record', event })
        .catch(() => setError(text('记录未保存，请重试', 'Could not save record'))),
    suppressLegacyWater: true,
  };
}
