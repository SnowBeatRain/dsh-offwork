// Authored Client entry. Run node tools/build.mjs to inline the tested pure modules.
window.__ModuleLoader__.load({
  id: 'dsh-offwork',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    /* PURE_MODULES */
    const messages = {
      zh: {
        ...COMPANION_MESSAGES.zh,
        ...PET_MESSAGES.zh,
        ...PET_INTERACTION_MESSAGES.zh,
        ...PET_SURFACE_MESSAGES.zh,
        title: '下班计时器',
        working: '距离下班',
        before: '距离开工',
        lunch: '午休中',
        done: '本班已完成',
        rest: '今天休息',
        earned: '本班已赚 · 税前',
        daily: '日薪',
        hourly: '有效时薪',
        progress: '计薪进度',
        settings: '设置',
        collapse: '收起为小条',
        expand: '展开',
        hide: '隐藏工资',
        show: '显示工资',
        save: '保存',
        cancel: '取消',
        monthlySalary: '税前月薪（元）',
        dailySalary: '税前日薪（元）',
        workdaysPerMonth: '月计薪天数',
        start: '上班时间',
        end: '下班时间',
        breakStart: '休息开始',
        breakEnd: '休息结束',
        timezone: '时区',
        weekdays: '班次开始日',
        payMode: '计薪方式',
        monthly: '月薪',
        dailyMode: '日薪',
        loading: '正在读取设置…',
        retry: '重新读取',
        noSession: '请先打开或创建一个会话。',
        error: '操作失败，请重试。',
        saved: '设置已保存',
        days: '日一二三四五六',
        privacy: '配置保存在 Harness 所在机器；读写结果进入所选会话记录。',
        drag: '按住可拖动；方向键微调，Home 复位',
        setup: '先设好你的作息',
        setupHint: '示例数值不是你的收入，保存后才开始计时。',
        breakEnabled: '扣除无薪休息',
        noBreak: '不扣休息',
        nextDay: '次日',
        preview: '折算',
        salaryGroup: '薪资',
        scheduleGroup: '作息',
        appearanceGroup: '外观',
        appearanceDone: '完成',
        advanced: '高级设置',
        sessionHint: '仅用于记录配置读写操作，不是账本，不影响工资计算。',
        session: '操作记录会话',
        masked: '工资已隐藏',
        reset: '复位位置',
        synced: '已读取最新配置',
        refresh: '读取最新配置',
        busy: '保存中…',
        storage: '浏览器禁止本地存储；位置与透明度本次有效。',
        shiftDate: '班次',
        opacity: '背景透明度',
        opacityHint: '只影响背景，不影响文字。',
        waterTitle: '喝水提醒',
        waterEnable: '开启喝水提醒',
        waterInterval: '自定义间隔（分钟）',
        waterSave: '保存提醒设置',
        waterEdit: '设置喝水提醒',
        waterBack: '返回',
        waterPresets: '常用间隔',
        waterMinutes: '分钟',
        waterEvery: '每',
        waterEffective: '当前间隔',
        waterManage: '数据管理',
        waterSaveHint: '修改后点击保存，按新间隔重新计时。',
        waterBrief: '按工作时间计时，午休暂停。关闭页面后不提醒。',
        waterApply: '应用间隔',
        waterInvalid: '请输入 5–240 的整数。',
        waterNext: '下次喝水',
        waterDue: '该喝水啦',
        waterDrink: '喝了',
        waterSnooze: '工作 10 分钟后',
        waterPause: '本班暂停',
        waterResume: '恢复本班提醒',
        waterCount: '本班打卡',
        waterManual: '喝了一杯',
        waterQuick: '喝水快捷操作',
        waterQuickClose: '收起喝水快捷操作',
        waterRecorded: '这杯记下啦。',
        waterRecordHint: '工作和午休期间可以打卡，关闭提醒也能记录。',
        waterActionStale: '状态已变化，请再试一次。',
        waterQuiet: '免打扰',
        waterQuietAdjust: '调整时长',
        waterQuiet30: '30 分钟',
        waterQuiet60: '1 小时',
        waterQuietEnd: '结束免打扰',
        waterQuietStarted: '好，先安静一会儿，到时再提醒你。',
        waterQuietEnded: '免打扰已结束。',
        waterQuietHint: '按自然时间，到期自动恢复；已到期的提醒只提示一次。',
        waterOff: '提醒已关闭',
        waterWaiting: '等待工作时段',
        waterBreak: '休息中，提醒计时暂停',
        waterPaused: '本班已暂停',
        waterFinished: '本班不再安排新提醒',
        waterOther: '提醒已到期，等待可见标签页处理',
        waterClear: '清除本班次数',
        waterReset: '重置喝水提醒',
        waterConfirm: '确认操作',
        waterClearHint: '仅清零本班次数，保留下一次提醒和暂停状态。',
        waterResetHint: '清除喝水提醒设置和记录，恢复默认关闭。',
        waterLocal: '提醒设置和打卡仅保存在当前浏览器，不进入会话。与薪资配置分别保存。',
        waterRules: '按工作分钟计时，午休冻结。开启、修改间隔或作息后重新计时；关闭页面后不提醒。',
        waterUnavailable:
          '喝水提醒存储不可用或数据无效，自动提醒已停止。可重试；重置将清除原喝水数据。',
        waterRetry: '重试读取',
        waterSetup: '请先保存薪资与作息。',
        waterLoading: '正在读取喝水提醒…',
        waterChanged: '提醒设置已在本浏览器生效',
        waterStale: '作息已变化，请点击“读取最新配置”后继续提醒。',
      },
      en: {
        ...COMPANION_MESSAGES.en,
        ...PET_MESSAGES.en,
        ...PET_INTERACTION_MESSAGES.en,
        ...PET_SURFACE_MESSAGES.en,
        title: 'Offwork Clock',
        working: 'Until clock-out',
        before: 'Until work starts',
        lunch: 'On break',
        done: 'Shift complete',
        rest: 'Day off',
        earned: 'Earned this shift · gross',
        daily: 'Shift pay',
        hourly: 'Paid-hour rate',
        progress: 'Paid progress',
        settings: 'Settings',
        collapse: 'Minimize to strip',
        expand: 'Expand',
        hide: 'Hide salary',
        show: 'Show salary',
        save: 'Save',
        cancel: 'Cancel',
        monthlySalary: 'Monthly gross (CNY)',
        dailySalary: 'Daily gross (CNY)',
        workdaysPerMonth: 'Paid days / month',
        start: 'Shift starts',
        end: 'Shift ends',
        breakStart: 'Break starts',
        breakEnd: 'Break ends',
        timezone: 'Time zone',
        weekdays: 'Shift starting days',
        payMode: 'Pay basis',
        monthly: 'Monthly',
        dailyMode: 'Daily',
        loading: 'Loading settings…',
        retry: 'Reload',
        noSession: 'Open or create a session first.',
        error: 'Operation failed. Please retry.',
        saved: 'Settings saved',
        days: 'SMTWTFS',
        privacy: 'Settings are saved on the Harness host; results enter the selected session log.',
        drag: 'Drag to move; arrow keys to adjust; Home resets',
        setup: 'Set up your schedule',
        setupHint: 'These are example values, not your income. Save to start.',
        breakEnabled: 'Deduct unpaid break',
        noBreak: 'no break',
        nextDay: 'next day',
        preview: 'Preview',
        salaryGroup: 'Salary',
        scheduleGroup: 'Schedule',
        appearanceGroup: 'Appearance',
        appearanceDone: 'Done',
        advanced: 'Advanced',
        sessionHint:
          'Logs configuration operations only; not a ledger and does not affect pay calculations.',
        session: 'Action log session',
        masked: 'Salary hidden',
        reset: 'Reset position',
        synced: 'Latest settings loaded',
        refresh: 'Reload latest settings',
        busy: 'Saving…',
        storage: 'Local storage is blocked; position and opacity last only for this visit.',
        shiftDate: 'Shift',
        opacity: 'Surface opacity',
        opacityHint: 'Affects the background only.',
        waterTitle: 'Water reminder',
        waterEnable: 'Enable water reminders',
        waterInterval: 'Custom interval (minutes)',
        waterSave: 'Save reminder settings',
        waterEdit: 'Reminder settings',
        waterBack: 'Back',
        waterPresets: 'Quick intervals',
        waterMinutes: 'min',
        waterEvery: 'Every',
        waterEffective: 'Current interval',
        waterManage: 'Manage data',
        waterSaveHint: 'Save changes to restart with the new interval.',
        waterBrief: 'Counts working time and pauses on unpaid breaks. Keep the page open.',
        waterApply: 'Apply interval',
        waterInvalid: 'Enter a whole number from 5 to 240.',
        waterNext: 'Next water break',
        waterDue: 'Time for some water',
        waterDrink: 'Drank water',
        waterSnooze: 'In 10 working minutes',
        waterPause: 'Pause this shift',
        waterResume: 'Resume this shift',
        waterCount: 'Drinks this shift',
        waterManual: 'Had a glass',
        waterQuick: 'Quick water actions',
        waterQuickClose: 'Close quick water actions',
        waterRecorded: 'Got it, your drink is recorded.',
        waterRecordHint: 'Check in during work or breaks, even with reminders off.',
        waterActionStale: 'The state changed. Please try again.',
        waterQuiet: 'Quiet time',
        waterQuietAdjust: 'Change duration',
        waterQuiet30: '30 minutes',
        waterQuiet60: '1 hour',
        waterQuietEnd: 'End quiet time',
        waterQuietStarted: 'Enjoy some quiet. I’ll remind you when it ends.',
        waterQuietEnded: 'Quiet time has ended.',
        waterQuietHint:
          'Uses clock time. Resumes automatically, with just one reminder if overdue.',
        waterOff: 'Reminders off',
        waterWaiting: 'Waiting for working hours',
        waterBreak: 'On break; reminder timer paused',
        waterPaused: 'Paused for this shift',
        waterFinished: 'No more reminders this shift',
        waterOther: 'Reminder due; waiting for a visible tab',
        waterClear: 'Clear shift count',
        waterReset: 'Reset water reminders',
        waterConfirm: 'Confirm',
        waterClearHint: 'Clear the drink count only. Keep the next reminder and pause state.',
        waterResetHint: 'Delete water preferences and records, then turn reminders off.',
        waterLocal:
          'Reminder preferences and check-ins stay in this browser, outside conversations. Saved separately from salary settings.',
        waterRules:
          'Counts working minutes; unpaid breaks pause the timer. Enabling or changing interval or schedule restarts it. The page must stay open.',
        waterUnavailable:
          'Water storage is unavailable or invalid; automatic reminders stopped. Retry, or reset to delete old water data.',
        waterRetry: 'Retry loading',
        waterSetup: 'Save your salary and schedule first.',
        waterLoading: 'Loading water reminders…',
        waterChanged: 'Reminder preferences saved in this browser',
        waterStale: 'Schedule changed. Reload the latest settings to continue reminders.',
      },
    };
    const STYLE =
      `
.owc-v2{--owc-accent:color-mix(in srgb,var(--dsw-alias-brand-primary) 65%,#2563eb);pointer-events:auto;position:fixed;top:96px;right:24px;z-index:40;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);border-radius:20px;color:var(--dsw-alias-label-primary);font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif;cursor:grab;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.owc-v2:active{cursor:grabbing}
.owc-v2.owc-compact{touch-action:none;border-radius:18px}
.owc-v2.owc-compact.owc-quick{width:296px;touch-action:manipulation}
.owc-v2:not(.owc-compact){width:296px}
.owc-v2 :is(button,input,select,label,a){cursor:pointer;user-select:auto;-webkit-user-select:auto}
.owc-v2 :is(input,select){user-select:text;-webkit-user-select:text}
.owc-glass{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:var(--owc-alpha,.82);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 97%,var(--owc-accent));-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 18%,transparent);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--dsw-alias-bg-base) 70%,transparent),0 8px 20px color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent),0 14px 34px color-mix(in srgb,var(--owc-accent) 5%,transparent);transition:opacity .18s ease}
.owc-content{position:relative;border-radius:inherit;max-height:calc(100dvh - 24px);overflow:auto;overscroll-behavior:contain;scrollbar-width:none}
.owc-content::-webkit-scrollbar{display:none}
.owc-v2 button{appearance:none;-webkit-appearance:none;border:0;margin:0;background:transparent;color:inherit;font:inherit;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:6px;min-height:28px;border-radius:10px;transition:background .15s ease,color .15s ease}
.owc-v2 button:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent)}
.owc-v2 button:focus-visible,.owc-v2 :is(input,select):focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.owc-v2 button:disabled{opacity:.45;cursor:not-allowed;background:transparent}
.owc-icon{color:var(--dsw-alias-label-secondary);min-width:28px}
.owc-text{font-size:11px;color:var(--dsw-alias-label-secondary);padding:4px 6px;min-height:24px;white-space:nowrap}
.owc-text:hover{color:var(--dsw-alias-label-primary)}
.owc-pill{display:flex;flex-direction:column;gap:8px;padding:12px 10px 9px 14px;min-width:168px}
.owc-pill-top>svg{color:var(--owc-accent);flex:none}
.owc-pill-top>.owc-icon{color:var(--dsw-alias-label-secondary)}
.owc-pill-top{display:flex;align-items:center;gap:7px;min-width:0}
.owc-grip{display:flex;align-items:baseline;gap:7px;touch-action:none;min-width:0}
.owc-pill-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 12%,transparent)}
.owc-pill-actions{display:flex;align-items:center;gap:2px}
.owc-pill-status{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;letter-spacing:.02em}
.owc-pill-time{font-size:24px;font-weight:500;letter-spacing:-.5px;font-variant-numeric:tabular-nums;white-space:nowrap;line-height:1.25}
.owc-pill-money{font-size:13px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;min-width:46px}
.owc-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);flex:none}
.owc-v2[data-status=working] .owc-dot{background:var(--dsw-alias-state-success-primary)}
.owc-v2[data-status=lunch] .owc-dot{background:var(--dsw-alias-state-warn-primary)}
.owc-v2[data-status=done] .owc-dot{background:var(--dsw-alias-brand-primary)}
.owc-v2[data-status=before] .owc-dot,.owc-v2[data-status=rest] .owc-dot{opacity:.6}
.owc-head{display:flex;align-items:center;gap:4px;padding:12px 12px 10px 18px;margin-bottom:12px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 12%,transparent)}
.owc-title{flex:1;min-width:0;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.owc-main{padding:4px 17px 12px}
.owc-status{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:1px}
.owc-time{font-size:34px;font-weight:350;line-height:1.28;letter-spacing:-1.2px;font-variant-numeric:tabular-nums}
.owc-progress{height:3px;border-radius:3px;overflow:hidden;background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);margin:10px 0 16px}
.owc-progress>div{height:100%;border-radius:3px;background:var(--owc-accent);transition:width .6s linear}
.owc-earn-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.owc-money{font-size:26px;font-weight:400;letter-spacing:-.6px;font-variant-numeric:tabular-nums;margin-top:1px}
.owc-muted{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.owc-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.owc-stats>div{padding:10px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 5%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 8%,transparent)}
.owc-stats span{display:block;font-size:10px;color:var(--dsw-alias-label-secondary)}
.owc-stats strong{display:block;margin-top:1px;font-size:13px;font-weight:500;font-variant-numeric:tabular-nums}
.owc-meta{margin-top:12px}
.owc-meta span{display:block;font-size:10.5px;line-height:1.7;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.owc-row-actions{display:flex;gap:4px;margin-top:8px;margin-left:-6px}
.owc-form{padding:2px 17px 15px}
.owc-v2.owc-editing{width:340px}
.owc-setting-group{min-width:0;margin:0 0 16px;padding:12px 12px 2px;border:1px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 15%,transparent);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 24%,transparent)}
.owc-setting-group legend{padding:0 6px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
.owc-form :is(input[type=time],input[type=number],select){min-height:36px;border-radius:10px}
.owc-advanced{margin:0 0 12px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 5%,transparent)}
.owc-advanced summary{cursor:pointer;font-size:12px;font-weight:500}
.owc-advanced[open] summary{margin-bottom:10px}
.owc-grip:focus-visible,.owc-advanced summary:focus-visible{outline:2px solid var(--owc-accent);outline-offset:3px}
.owc-field{display:block;margin-bottom:10px}
.owc-field>span{display:block;font-size:10.5px;color:var(--dsw-alias-label-secondary);margin-bottom:4px}
.owc-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.owc-v2 :is(input[type=text],input[type=time],input[type=number],select){width:100%;box-sizing:border-box;font:inherit;font-size:12px;padding:6px 8px;border-radius:9px;border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 13%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-base) 55%,transparent);color:inherit;min-height:30px}
.owc-v2 select option{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary)}
.owc-seg{display:flex;gap:3px;padding:3px;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}
.owc-seg button{flex:1;font-size:11.5px;min-height:26px;border-radius:8px}
.owc-seg button[aria-pressed=true]{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 92%,var(--dsw-alias-bg-base));box-shadow:0 1px 3px color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent)}
.owc-days{display:flex;gap:3px}
.owc-days button{flex:1;min-height:26px;font-size:11px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent)}
.owc-days button[aria-pressed=true]{background:color-mix(in srgb,var(--owc-accent) 12%,transparent);color:var(--owc-accent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--owc-accent) 22%,transparent)}
.owc-check{display:flex;flex-direction:row;align-items:center;gap:7px;font-size:11.5px;margin:0 0 10px}
.owc-check input{appearance:auto;-webkit-appearance:auto;width:auto;accent-color:var(--dsw-alias-brand-primary)}
.owc-private{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:30px;padding:4px 6px 4px 10px;border-radius:9px;border:1px dashed color-mix(in srgb,var(--dsw-alias-label-primary) 16%,transparent);font-size:12px;color:var(--dsw-alias-label-secondary)}
.owc-preview{font-size:11px;color:var(--dsw-alias-label-secondary);padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);margin:0 0 10px;font-variant-numeric:tabular-nums}
.owc-hint{font-size:10.5px;line-height:1.6;color:var(--dsw-alias-label-secondary);margin:0 0 10px}
.owc-range{width:100%;accent-color:var(--dsw-alias-brand-primary);margin:1px 0 2px}
.owc-save{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:12px}
.owc-v2 button.owc-primary{background:var(--owc-accent);color:#fff;padding:0 16px;min-height:36px;font-size:12px;font-weight:600;border-radius:12px}
.owc-v2 button.owc-primary:hover{background:color-mix(in srgb,var(--owc-accent) 88%,#000)}
.owc-v2 button.owc-primary:disabled{opacity:.5;color:#fff;background:var(--owc-accent)}
.owc-error,.owc-note{padding:0 17px 9px;margin:0;font-size:10.5px;line-height:1.6}
.owc-error{color:var(--dsw-alias-state-error-primary)}
.owc-note{color:var(--dsw-alias-label-secondary)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.owc-glass{opacity:1}}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){.owc-glass{opacity:1;-webkit-backdrop-filter:none;backdrop-filter:none}}
@media(prefers-reduced-motion:reduce){.owc-v2 button,.owc-glass,.owc-progress>div{transition:none}}
.owc-water{padding:10px 14px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);font-size:12px;cursor:default}
.owc-water summary{cursor:pointer;font-weight:600;margin-bottom:8px}
.owc-water p{margin:6px 0;font-size:11px;line-height:1.6;overflow-wrap:anywhere}
.owc-water-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
.owc-water-actions button{white-space:normal;text-align:left;font-size:11px}
.owc-water-due{background:color-mix(in srgb,var(--owc-accent) 9%,transparent);border-radius:0 0 18px 18px}
.owc-water-summary{font-size:11px!important;text-align:left;white-space:normal}
.owc-water input[type=number]{max-width:100px}
.owc-water .owc-check{margin-top:8px}
.owc-water-confirm{padding:8px;border:1px solid var(--owc-accent);border-radius:8px}
.owc-water-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.owc-water-head strong{display:flex;align-items:center;gap:5px;font-size:12px}
.owc-water-quiet{margin:0!important;align-self:center;flex:1;min-width:90px}
.owc-water-quiet summary{cursor:pointer;font-size:11px;padding:6px}
.owc-water-quiet[open]{flex-basis:100%}
.owc-water-overview{padding:12px 17px}
.owc-water-overview .owc-water-status{font-size:12px;font-variant-numeric:tabular-nums;margin:7px 0}
.owc-water-meta{display:flex;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary);font-size:11px}
.owc-water-form{border-top:0;padding:4px 17px 16px}
.owc-water-toggle{display:flex;align-items:center;justify-content:space-between;padding:10px 0;font-weight:600}
.owc-water-toggle input{width:18px;height:18px;accent-color:var(--owc-accent)}
.owc-water-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:8px 0 14px}
.owc-water-presets button{border:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);border-radius:10px;padding:8px 4px}
.owc-water-presets button[aria-pressed=true]{background:color-mix(in srgb,var(--owc-accent) 12%,transparent);color:var(--owc-accent);border-color:var(--owc-accent)}
.owc-water-form input[type=number]{max-width:none}
.owc-water-form fieldset{border:0;padding:0;margin:0;min-width:0}
.owc-water-form fieldset:disabled{opacity:.5}
.owc-water-form .owc-save{margin:12px 0}
.owc-water-form details{margin-top:14px;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent)}
.owc-pill-salary{display:flex;align-items:center;gap:3px}
.owc-pill-water{font-size:11px!important;gap:4px;white-space:nowrap;font-variant-numeric:tabular-nums}
.owc-water-summary{justify-content:flex-start!important}
@media(max-width:420px){.owc-pill{min-width:136px;padding:8px 8px 7px 12px}.owc-pill-status{display:none}.owc-pill-time{font-size:22px}.owc-main,.owc-form{padding-left:14px;padding-right:14px}.owc-time{font-size:31px}}
` +
      COMPANION_STYLE +
      PET_STYLE +
      PET_INTERACTION_STYLE +
      PET_SURFACE_STYLE;
    const ICONS = {
      water: [
        ['path', { d: 'M8 1.5C6.6 4 3.5 7.1 3.5 10a4.5 4.5 0 0 0 9 0C12.5 7.1 9.4 4 8 1.5Z' }],
      ],
      eye: [
        ['path', { d: 'M1.7 8S4.3 3.9 8 3.9 14.3 8 14.3 8 11.7 12.1 8 12.1 1.7 8 1.7 8Z' }],
        ['circle', { cx: 8, cy: 8, r: 2.05 }],
      ],
      eyeOff: [
        ['path', { d: 'M1.7 8S4.3 3.9 8 3.9 14.3 8 14.3 8 11.7 12.1 8 12.1 1.7 8 1.7 8Z' }],
        ['circle', { cx: 8, cy: 8, r: 2.05 }],
        ['path', { d: 'M3 3l10 10' }],
      ],
      sliders: [
        ['path', { d: 'M2.2 4.6h3.4M9.2 4.6h4.6M2.2 11.4h5.4M11.4 11.4h2.4' }],
        ['circle', { cx: 7.3, cy: 4.6, r: 1.55 }],
        ['circle', { cx: 9.4, cy: 11.4, r: 1.55 }],
      ],
      alarm: [
        ['circle', { cx: 8, cy: 9, r: 4.5 }],
        ['path', { d: 'M8 6.5V9l1.7 1M2 4l2-2M12 2l2 2M5 13l-1 2M11 13l1 2' }],
      ],
      chevronUp: [['path', { d: 'M3.7 9.8L8 5.5l4.3 4.3' }]],
      chevronDown: [['path', { d: 'M3.7 6.2L8 10.5l4.3-4.3' }]],
      close: [['path', { d: 'M4.3 4.3l7.4 7.4M11.7 4.3l-7.4 7.4' }]],
      refresh: [
        ['path', { d: 'M13.1 8a5.1 5.1 0 1 1-1.5-3.6' }],
        ['path', { d: 'M13.1 3v3.2H9.9' }],
      ],
    };
    const iconSvg = (name, size = 15) =>
      h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.55,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        ICONS[name].map(([tag, attrs], index) => h(tag, { key: index, ...attrs })),
      );

    return {
      inject: ['slots', 'locale', 'remote', 'remote.commands'],
      apply(ctx) {
        for (const [lang, dict] of Object.entries(messages))
          ctx.effect(() => ctx.locale.register('offwork-clock', lang, dict));
        const viewKey = 'dsh.offwork-clock.view.v4';
        const legacyKey = 'dsh.offwork-clock.view.v3';

        function Clock(props) {
          const locale = React.useSyncExternalStore(
            (fn) => ctx.locale.subscribe(fn),
            () => ctx.locale.getSnapshot(),
          );
          const t = ctx.locale.bind('offwork-clock');
          const sessions = props.useSessions((s) => s);
          const sessionIds = Array.isArray(sessions?.ids) ? sessions.ids : [];
          const [sessionChoice, setSessionChoice] = React.useState('');
          const sessionId = sessionIds.includes(sessionChoice) ? sessionChoice : sessionIds[0];
          const [data, setData] = React.useState(null);
          const [draft, setDraft] = React.useState(null);
          const [ui, dispatchUI] = React.useReducer(petUIReducer, initialPetUI);
          const editing = ui.screen === 'schedule' || ui.screen === 'appearance';
          const appearanceOnly = ui.screen === 'appearance';
          const waterEditing = ui.screen === 'water';
          const [appearanceDraft, setAppearanceDraft] = React.useState(null);
          const appearanceBase = React.useRef(null);
          const appearanceWasPet = React.useRef(false);
          const salaryBase = React.useRef(null);
          const menuBox = React.useRef(null);
          const menuTrigger = React.useRef(null);
          const [dragPosition, setDragPosition] = React.useState(null);
          const [busy, setBusy] = React.useState(false);
          const [error, setError] = React.useState('');
          const [notice, setNotice] = React.useState('');
          const [storageError, setStorageError] = React.useState(false);
          const [now, setNow] = React.useState(Date.now());
          const [savedView, setView] = React.useState(normalizeView(null));
          const view =
            appearanceOnly && appearanceDraft ? { ...savedView, ...appearanceDraft } : savedView;
          const [ready, setReady] = React.useState(false);
          const box = React.useRef(null);
          const petPanel = React.useRef(null);
          const cardContent = React.useRef(null);
          const menuContent = React.useRef(null);
          const toastContent = React.useRef(null);
          const [toastHeight, setToastHeight] = React.useState(48);
          const [cardMeasure, setCardMeasure] = React.useState({ key: '', height: 320 });
          const [menuMeasure, setMenuMeasure] = React.useState({ width: 0, height: 260 });
          const panelPlacement = React.useRef(null);
          const petDragged = React.useRef(false);
          const petOpen = ui.screen !== null;
          const petDetails = ui.screen === 'income';
          const [classicSize, setClassicSize] = React.useState({ width: 340, height: 240 });
          const [viewport, setViewport] = React.useState(() => petViewport(window));
          const dragState = React.useRef(null);
          const lastPosition = React.useRef(null);
          const generation = React.useRef(0);
          const requestBusy = React.useRef(false);
          const focusReturn = React.useRef(null);
          const [water, setWater] = React.useState(defaultHydration);
          const [waterReady, setWaterReady] = React.useState(false);
          const [waterError, setWaterError] = React.useState(false);
          const [waterBusy, setWaterBusy] = React.useState(false);
          const [waterVisible, setWaterVisible] = React.useState(!document.hidden);
          const [waterInterval, setWaterInterval] = React.useState('60');
          const [waterQuickOpen, setWaterQuickOpen] = React.useState(false);
          const waterQuickTrigger = React.useRef(null);
          const [waterEnabledDraft, setWaterEnabledDraft] = React.useState(false);
          const waterPending = React.useRef(false);
          const manualAttempt = React.useRef(null);
          const waterPreferencesBase = React.useRef(null);
          const editorWasOpen = React.useRef(false);
          const previousPetMode = React.useRef(null);
          const [waterInvalid, setWaterInvalid] = React.useState(false);
          const [waterConfirm, setWaterConfirm] = React.useState(null);
          const [waterNotice, setWaterNotice] = React.useState(false);
          const reactionState = React.useRef(null);
          const waterRuntime = React.useRef(null);
          const waterOwner = React.useRef(null);
          if (!waterOwner.current)
            waterOwner.current =
              window.crypto?.randomUUID?.() || String(Math.random()) + Date.now();
          const waterInputs = React.useRef(null);
          const waterScheduleChange = React.useRef(null);
          waterInputs.current = {
            settings: data?.configured && !error ? data.settings : null,
            editing: editing || waterEditing,
          };

          const settings = data?.settings;
          const workingDraft = draft || settings;
          const state = settings ? safeCalculate(settings) : null;
          const preview = workingDraft ? safeCalculate(workingDraft) : null;
          const safeState = state && !state.error ? state : null;
          const petMode =
            ready &&
            data?.configured &&
            !!safeState &&
            (appearanceOnly ? appearanceWasPet.current : view.companion);
          const petGeometry = petLayout(
            dragPosition ?? view.petPosition,
            viewport,
            appearanceOnly ? savedView.petSize : view.petSize,
          );
          const surfaceScreen = ui.screen || 'reminder';
          const surfaceWidth = petSurfaceWidth(surfaceScreen, viewport);
          const measureKey = [surfaceScreen, surfaceWidth, locale.active].join(':');
          const measured = cardMeasure.key === measureKey;
          const naturalHeight = measured ? cardMeasure.height : 320;
          const anchor = {
            x: petGeometry.x,
            y: petGeometry.y,
            width: petGeometry.petWidth,
            height: petGeometry.petHeight,
          };
          const placementKey = [
            measureKey,
            viewport.width,
            viewport.height,
            viewport.left,
            viewport.top,
            (dragPosition ?? savedView.petPosition)?.x,
            (dragPosition ?? savedView.petPosition)?.y,
          ].join(':');
          const previousPlacement =
            panelPlacement.current?.key === placementKey ? panelPlacement.current.panel : null;
          const floatingPanel = placePetSurface(anchor, viewport, {
            width: surfaceWidth,
            height: naturalHeight,
            previous: previousPlacement,
          });
          if (!petMode || !petOpen) panelPlacement.current = null;
          else if (measured) panelPlacement.current = { key: placementKey, panel: floatingPanel };
          const menuWidth = petSurfaceWidth('menu', viewport);
          const menuLayout = placePetSurface(anchor, viewport, {
            width: menuWidth,
            height: menuMeasure.width === menuWidth ? menuMeasure.height : 260,
            kind: 'menu',
            point: ui.menu,
          });
          const alertRoom = Math.max(
            anchor.x - viewport.left - 24,
            viewport.left + viewport.width - anchor.x - anchor.width - 24,
          );
          const waterAlertLayout = placePetSurface(anchor, viewport, {
            width: Math.min(140, Math.max(110, alertRoom)),
            height: 34,
            kind: 'menu',
            obstacles: [...(petOpen ? [floatingPanel] : []), ...(ui.menu ? [menuLayout] : [])],
          });
          const toastLayout = placePetSurface(anchor, viewport, {
            width: Math.min(224, viewport.width - 24),
            height: toastHeight,
            kind: 'menu',
          });
          const collapsed =
            !petMode &&
            !!safeState &&
            !editing &&
            !waterEditing &&
            view.mini &&
            !error &&
            !state?.error;
          const seconds = safeState
            ? safeState.status === 'before'
              ? safeState.startRemaining
              : safeState.remaining
            : NaN;
          const duration = formatDuration(seconds);
          const formatMoney = React.useMemo(
            () =>
              new Intl.NumberFormat(locale.active, {
                style: 'currency',
                currency: 'CNY',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            [locale.active],
          );
          const money = (value) => (view.masked ? '••••' : formatMoney.format(value));
          const moneyText = safeState ? money(safeState.earned) : '—';
          const classicPosition = clampPosition(
            view.position ?? {
              x: viewport.left + viewport.width - classicSize.width - 24,
              y: viewport.top + 96,
            },
            viewport,
            classicSize,
          );
          const cardStyle = {
            '--owc-alpha': String(view.opacity),
            '--owc-viewport-height': Math.max(1, viewport.height - 24) + 'px',
            left: classicPosition.x,
            top: classicPosition.y,
            right: 'auto',
            maxWidth: Math.max(1, viewport.width - 24),
            maxHeight: Math.max(1, viewport.height - 24),
          };

          function safeCalculate(value) {
            try {
              return calculate(value, now);
            } catch (e) {
              return { error: e instanceof Error ? e.message : t('error') };
            }
          }
          function errorText(e) {
            return e instanceof Error ? e.message : t('error');
          }
          function setPreference(patch) {
            setView((current) => ({ ...current, ...patch }));
          }

          const clamp = React.useCallback(
            (position) =>
              clampPosition(position, petViewport(window), {
                width: box.current?.offsetWidth || 300,
                height: box.current?.offsetHeight || 200,
              }),
            [],
          );

          React.useEffect(() => {
            try {
              const saved = localStorage.getItem(viewKey);
              const legacy = !saved ? JSON.parse(localStorage.getItem(legacyKey) || 'null') : null;
              setView(
                normalizeView(
                  saved
                    ? JSON.parse(saved)
                    : { position: legacy?.position ?? null, masked: legacy?.masked ?? true },
                ),
              );
            } catch {
              setStorageError(true);
            }
            setReady(true);
            const sync = (e) => {
              if (e.key !== viewKey) return;
              try {
                setView(normalizeView(JSON.parse(e.newValue || 'null')));
              } catch {}
            };
            window.addEventListener('storage', sync);
            return () => window.removeEventListener('storage', sync);
          }, []);

          React.useEffect(() => {
            if (!ready) return;
            try {
              localStorage.setItem(viewKey, JSON.stringify(normalizeView(savedView)));
            } catch {
              setStorageError(true);
            }
          }, [ready, savedView]);

          React.useEffect(() => {
            let active = true;
            let running = 0;
            let failed = false;
            let store;
            let channel;
            try {
              store = createHydrationStore(window.indexedDB);
            } catch {
              store = createHydrationStore(null);
            }
            try {
              channel = new BroadcastChannel('dsh.offwork-clock.hydration.v1');
            } catch {}
            const contextAt = (time) => {
              const current = waterInputs.current.settings;
              if (!current) return null;
              try {
                return hydrationContext(current, calculate(current, time));
              } catch {
                return null;
              }
            };
            const update = async (action = { type: 'tick' }, automatic = false) => {
              if (!active || (automatic && (running || failed))) return;
              running++;
              try {
                if (action.type === 'retry') {
                  store.close();
                  try {
                    store = createHydrationStore(window.indexedDB);
                  } catch {
                    store = createHydrationStore(null);
                  }
                }
                let changed = false;
                let recorded = false;
                let quietChanged = false;
                let usedPermit = null;
                const result = await store.update(
                  (current) => {
                    const time = Date.now();
                    const context = contextAt(time);
                    if (action.type === 'sync') return current;
                    const permit = waterScheduleChange.current;
                    const operation =
                      permit && context && permit.schedule === context.schedule
                        ? { ...action, baseSchedule: permit.baseSchedule }
                        : action;
                    let next = transitionHydration(
                      current,
                      context,
                      operation,
                      time,
                      waterOwner.current,
                    );
                    recorded =
                      ['drink', 'manual-drink'].includes(action.type) &&
                      next.shift?.count >
                        (current.shift?.id === next.shift?.id ? (current.shift?.count ?? 0) : 0);
                    quietChanged =
                      ['quiet', 'end-quiet'].includes(action.type) &&
                      next.shift?.quietUntil !== current.shift?.quietUntil;
                    if (automatic) {
                      const allow = !document.hidden && !waterInputs.current.editing;
                      next = transitionHydration(
                        next,
                        context,
                        { type: allow ? 'claim' : 'release' },
                        time,
                        waterOwner.current,
                      );
                    }
                    if (
                      permit &&
                      context &&
                      permit.schedule === context.schedule &&
                      next.shift?.schedule === context.schedule
                    )
                      usedPermit = permit;
                    changed = JSON.stringify(next) !== JSON.stringify(current);
                    return next;
                  },
                  { reset: action.type === 'reset' },
                );
                if (!active) return;
                if (
                  action.type === 'reset' ||
                  (usedPermit && waterScheduleChange.current === usedPermit)
                )
                  waterScheduleChange.current = null;
                failed = false;
                setWater(result);
                setWaterReady(true);
                setWaterError(false);
                if (changed || action.type === 'reset') {
                  try {
                    channel?.postMessage('changed');
                  } catch {}
                }
                return { state: result, recorded, quietChanged };
              } catch (waterFailure) {
                console.warn(
                  'Water reminder storage failed:',
                  waterFailure?.name,
                  waterFailure?.message,
                );
                if (active) {
                  failed = true;
                  setWaterError(true);
                  setWaterReady(true);
                }
              } finally {
                running--;
              }
            };
            const tick = () => {
              void update({ type: 'tick' }, true);
            };
            const visibility = () => {
              setWaterVisible(!document.hidden);
              setNow(Date.now());
              if (document.hidden) void update({ type: 'release' });
              else tick();
            };
            const pageHide = () => {
              setWaterVisible(false);
              void update({ type: 'release' });
            };
            waterRuntime.current = { update, tick };
            if (channel)
              channel.onmessage = () => {
                void update({ type: 'sync' });
              };
            const timer = setInterval(tick, 2000);
            document.addEventListener('visibilitychange', visibility);
            window.addEventListener('pageshow', visibility);
            window.addEventListener('pagehide', pageHide);
            window.addEventListener('focus', tick);
            tick();
            return () => {
              active = false;
              waterRuntime.current = null;
              clearInterval(timer);
              document.removeEventListener('visibilitychange', visibility);
              window.removeEventListener('pageshow', visibility);
              window.removeEventListener('pagehide', pageHide);
              window.removeEventListener('focus', tick);
              channel?.close();
              void store
                .update((current) => {
                  if (current.shift?.claim?.owner === waterOwner.current)
                    current.shift.claim = null;
                  return current;
                })
                .catch(() => {})
                .finally(() => store.close());
            };
          }, []);

          React.useEffect(() => {
            waterRuntime.current?.tick();
          }, [settings, editing, waterEditing, error]);

          React.useEffect(() => {
            if (!waterNotice) return;
            const timer = setTimeout(() => setWaterNotice(false), 5000);
            return () => clearTimeout(timer);
          }, [waterNotice]);

          React.useEffect(() => {
            if (!waterQuickOpen || !collapsed) return;
            const closeOutside = (event) => {
              if (!box.current?.contains(event.target)) setWaterQuickOpen(false);
            };
            document.addEventListener('pointerdown', closeOutside);
            return () => document.removeEventListener('pointerdown', closeOutside);
          }, [waterQuickOpen, collapsed]);

          function toggleWaterQuick(event) {
            waterQuickTrigger.current = event.currentTarget;
            setWaterQuickOpen((open) => !open);
          }

          function closeWaterQuick() {
            setWaterQuickOpen(false);
            (
              (waterQuickTrigger.current?.isConnected ? waterQuickTrigger.current : null) ||
              box.current?.querySelector('.owc-pill-water') ||
              box.current?.querySelector('.owc-companion-trigger') ||
              box.current?.querySelector('.owc-grip')
            )?.focus();
          }

          function openWaterEditor(event) {
            navigateScreen('water', event);
          }

          function closeWaterEditor() {
            if (waterPending.current) return;
            performNavigation(ui.back);
          }

          async function saveWaterSettings(event) {
            event.preventDefault();
            const interval = Number(waterInterval);
            if (!Number.isInteger(interval) || interval < 5 || interval > 240) {
              setWaterInvalid(true);
              return;
            }
            const result = await waterAction({
              type: 'preferences',
              ...(waterEnabledDraft !== waterPreferencesBase.current?.enabled
                ? { enabled: waterEnabledDraft }
                : {}),
              ...(interval !== waterPreferencesBase.current?.interval ? { interval } : {}),
            });
            if (result) performNavigation(ui.back);
            return result;
          }

          async function waterAction(action) {
            if (waterPending.current) return;
            waterPending.current = true;
            setWaterBusy(true);
            setWaterNotice(false);
            const actionFocus = document.activeElement;
            const hadFocus = box.current?.querySelector('.owc-water-due')?.contains(actionFocus);
            try {
              const outcome = await waterRuntime.current?.update(action);
              const result = outcome?.state;
              if (result) {
                setWaterConfirm(null);
                setNow(Date.now());
                if (action.type === 'preferences')
                  setWaterNotice({ key: 'waterChanged', kind: 'notice' });
                if (action.type === 'drink' && outcome.recorded)
                  setWaterNotice({ key: 'waterRecorded', kind: 'drink', token: result.revision });
                if (action.type === 'manual-drink') {
                  setWaterNotice({
                    key: result.shift?.recentActions.includes(action.actionId)
                      ? 'waterRecorded'
                      : 'waterActionStale',
                    kind: outcome.recorded ? 'drink' : 'notice',
                    token: result.revision,
                  });
                  manualAttempt.current = null;
                }
                if (action.type === 'quiet')
                  setWaterNotice({
                    key:
                      outcome.quietChanged && result.shift?.quietUntil > Date.now()
                        ? 'waterQuietStarted'
                        : 'waterActionStale',
                    kind: 'notice',
                  });
                if (action.type === 'end-quiet')
                  setWaterNotice({
                    key: outcome.quietChanged ? 'waterQuietEnded' : 'waterActionStale',
                    kind: 'notice',
                  });
                if (action.type === 'reset') {
                  manualAttempt.current = null;
                  setWaterInterval('60');
                  setWaterEnabledDraft(false);
                  setWaterInvalid(false);
                }
                if (
                  hadFocus ||
                  ['manual-drink', 'end-quiet', 'clear-count', 'reset'].includes(action.type)
                ) {
                  requestAnimationFrame(() => {
                    const active = document.activeElement;
                    if (active !== actionFocus && active?.tagName !== 'BODY') return;
                    const target = hadFocus
                      ? petMode
                        ? '.owc-pet-handle'
                        : '.owc-grip,.owc-title'
                      : action.type === 'manual-drink'
                        ? petMode
                          ? '.owc-pet-water-row .owc-primary'
                          : '.owc-water-actions .owc-primary'
                        : action.type === 'end-quiet'
                          ? petMode
                            ? '.owc-pet-quiet-row button'
                            : '.owc-water-quiet summary'
                          : '.owc-water-form details > summary';
                    box.current?.querySelector(target)?.focus();
                  });
                }
                waterRuntime.current?.tick();
              }
              return result;
            } finally {
              waterPending.current = false;
              setWaterBusy(false);
            }
          }

          React.useEffect(() => {
            if (sessionId) reload();
            else setError(t('noSession'));
            return () => {
              generation.current++;
            };
          }, [sessionId]);

          React.useEffect(() => {
            let timer;
            const tick = () => {
              setNow(Date.now());
              timer = setTimeout(tick, 1000 - (Date.now() % 1000));
            };
            const visibility = () => {
              clearTimeout(timer);
              setNow(Date.now());
              if (!document.hidden) tick();
            };
            if (!document.hidden) tick();
            document.addEventListener('visibilitychange', visibility);
            return () => {
              clearTimeout(timer);
              document.removeEventListener('visibilitychange', visibility);
            };
          }, []);

          React.useLayoutEffect(() => {
            const resize = () => {
              const rect = box.current?.getBoundingClientRect();
              const nextViewport = petViewport(window);
              setViewport((current) =>
                Object.keys(nextViewport).every((key) => current[key] === nextViewport[key])
                  ? current
                  : nextViewport,
              );
              if (!rect || petMode) return;
              const width = box.current.offsetWidth,
                height = box.current.offsetHeight;
              setClassicSize((current) =>
                current.width === width && current.height === height ? current : { width, height },
              );
            };
            const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
            if (box.current) ro?.observe(box.current);
            resize();
            window.addEventListener('resize', resize);
            window.visualViewport?.addEventListener('resize', resize);
            window.visualViewport?.addEventListener('scroll', resize);
            return () => {
              ro?.disconnect();
              window.removeEventListener('resize', resize);
              window.visualViewport?.removeEventListener('resize', resize);
              window.visualViewport?.removeEventListener('scroll', resize);
            };
          }, [clamp, petMode]);

          React.useEffect(() => {
            if (ui.pending) {
              box.current?.querySelector('[data-keep-editing]')?.focus();
              return;
            }
            const wasOpen = editorWasOpen.current;
            const modeChanged = previousPetMode.current !== petMode;
            previousPetMode.current = petMode;
            editorWasOpen.current = editing || waterEditing;
            if (editing && modeChanged) {
              box.current?.querySelector('input[name=companion]')?.focus();
              return;
            }
            if (!editing && !waterEditing) {
              if (!wasOpen) return;
              if (focusReturn.current?.isConnected) focusReturn.current.focus?.();
              else if (petMode) box.current?.querySelector('.owc-pet-handle')?.focus?.();
              else if (waterQuickOpen)
                box.current?.querySelector('[data-water-quick] .owc-text')?.focus?.();
              else box.current?.querySelector('.owc-grip,.owc-title')?.focus?.();
              focusReturn.current = null;
              return;
            }
            box.current?.querySelector('form input,form select,.owc-appearance input')?.focus?.();
          }, [editing, waterEditing, petMode, ui.screen, ui.pending]);

          React.useEffect(
            () => () => {
              generation.current++;
              dragState.current = null;
            },
            [],
          );

          async function request(action, patch) {
            if (!sessionId) throw new Error(t('noSession'));
            const rpc = await ctx.remote.commands.execute(
              sessionId,
              '/offwork-clock ' + action + (patch ? ' ' + JSON.stringify(patch) : ''),
              [],
            );
            return decodeCommand(rpc);
          }

          async function reload(explicit = false) {
            if (requestBusy.current) return;
            const token = ++generation.current;
            setBusy(true);
            setError('');
            try {
              const baseSchedule = (await waterRuntime.current?.update({ type: 'sync' }))?.state
                ?.shift?.schedule;
              if (token !== generation.current) return;
              const next = await request('get');
              if (token !== generation.current) return;
              if (next.configured)
                waterScheduleChange.current = {
                  baseSchedule,
                  schedule: hydrationContext(next.settings, calculate(next.settings, Date.now()))
                    .schedule,
                };
              setData(next);
              if (!next.configured) {
                setDraft({ ...next.settings });
                dispatchUI({ type: 'navigate', screen: 'schedule', discard: true });
                salaryBase.current = next.settings;
              }
              if (explicit) setNotice(t('synced'));
            } catch (e) {
              if (token === generation.current) setError(errorText(e));
            } finally {
              if (token === generation.current) setBusy(false);
            }
          }

          async function save(event) {
            event.preventDefault();
            if (requestBusy.current) return;
            requestBusy.current = true;
            setBusy(true);
            setError('');
            const token = ++generation.current;
            try {
              const baseSchedule = (await waterRuntime.current?.update({ type: 'sync' }))?.state
                ?.shift?.schedule;
              if (token !== generation.current) return;
              const next = await request(
                'set',
                changedSettings(salaryBase.current ?? settings, draft),
              );
              if (token === generation.current) {
                waterScheduleChange.current = {
                  baseSchedule,
                  schedule: hydrationContext(next.settings, calculate(next.settings, Date.now()))
                    .schedule,
                };
                setData(next);
                dispatchUI({ type: 'navigate', screen: ui.back, discard: true });
                setDraft(null);
                setNotice(t('saved'));
                return next;
              }
            } catch (e) {
              if (token === generation.current) setError(errorText(e));
            } finally {
              requestBusy.current = false;
              if (token === generation.current) setBusy(false);
            }
          }

          function commitPosition(position) {
            const next = clamp(position);
            setPreference(petMode ? { petPosition: next } : { position: next });
            lastPosition.current = next;
          }
          function dragDown(e) {
            if (e.button !== 0) return;
            petDragged.current = false;
            if (
              petMode
                ? !e.target.closest?.('.owc-pet-handle')
                : e.target.closest?.(
                    'button,input,select,label,a,textarea,summary,[contenteditable]',
                  )
            )
              return;
            const capture = petMode ? e.target.closest('.owc-pet-handle') : e.currentTarget;
            if (petMode && ui.menu) dispatchUI({ type: 'dismiss-menu' });
            const rect = box.current.getBoundingClientRect();
            dragState.current = {
              dx: e.clientX - rect.left,
              dy: e.clientY - rect.top,
              x0: e.clientX,
              y0: e.clientY,
              moved: false,
              capture,
            };
            try {
              capture.setPointerCapture?.(e.pointerId);
            } catch {}
          }
          function dragMove(e) {
            const d = dragState.current;
            if (!d) return;
            if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
            d.moved = true;
            petDragged.current = true;
            const next = clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy });
            if (petMode) setDragPosition(next);
            lastPosition.current = next;
            if (box.current) {
              box.current.style.left = next.x + 'px';
              box.current.style.top = next.y + 'px';
              box.current.style.right = 'auto';
            }
          }
          function dragEnd(e) {
            const d = dragState.current;
            if (!d) return;
            dragState.current = null;
            if (e.type === 'pointercancel' || e.type === 'lostpointercapture')
              petDragged.current = false;
            if (d.moved && lastPosition.current) commitPosition(lastPosition.current);
            setDragPosition(null);
            try {
              if (d.capture?.hasPointerCapture?.(e.pointerId))
                d.capture.releasePointerCapture(e.pointerId);
            } catch {}
          }
          function gripKeys(e) {
            if (e.key === 'Home') {
              e.preventDefault();
              setPreference(petMode ? { petPosition: null } : { position: null });
              return;
            }
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
            e.preventDefault();
            const rect = box.current.getBoundingClientRect();
            commitPosition({
              x: rect.left + (e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0),
              y: rect.top + (e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0),
            });
          }

          function openAppearanceContext(event) {
            if (
              !box.current?.contains(event.target) ||
              event.target.closest?.(
                'textarea,select,input:not([type=checkbox]):not([type=radio]):not([type=range]),[contenteditable=true],[contenteditable=""]',
              )
            )
              return false;
            event.preventDefault();
            event.stopPropagation();
            petDragged.current = false;
            if (ui.pending) return true;
            if (!petMode) {
              if (!busy && !waterBusy) navigateScreen('appearance', event);
              return true;
            }
            const trigger =
              event.target.closest('button,.owc-title,[data-pet-page-title]') ||
              event.target
                .closest('.owc-pet-panel')
                ?.querySelector('[data-pet-page-title],.owc-head button') ||
              box.current.querySelector('.owc-pet-handle');
            menuTrigger.current = menuBox.current?.contains(trigger)
              ? menuTrigger.current?.isConnected
                ? menuTrigger.current
                : box.current?.querySelector('.owc-pet-handle')
              : trigger;
            const rect = trigger?.getBoundingClientRect();
            const point =
              event.type === 'keydown'
                ? { x: rect?.right ?? petGeometry.x, y: rect?.top ?? petGeometry.y }
                : { x: event.clientX, y: event.clientY };
            dispatchUI({ type: 'menu', position: point });
            return true;
          }
          function appearanceShortcut(event) {
            if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
              return openAppearanceContext(event);
            return false;
          }
          function performNavigation(screen, root = false) {
            if (root) panelPlacement.current = null;
            if (screen !== ui.screen) {
              if (screen === 'water') {
                waterPreferencesBase.current = { enabled: water.enabled, interval: water.interval };
                setWaterInterval(String(water.interval));
                setWaterEnabledDraft(water.enabled);
                setWaterInvalid(false);
                setWaterConfirm(null);
              }
              if (screen === 'schedule') {
                salaryBase.current = settings;
                setDraft({ ...settings });
                setError('');
              }
              if (screen === 'appearance') {
                appearanceBase.current = appearanceValues(savedView);
                appearanceWasPet.current = !!petMode;
                setAppearanceDraft(appearanceValues(savedView));
              }
              if (ui.screen === 'schedule') {
                setDraft(null);
                setError('');
              }
              if (ui.screen === 'appearance') setAppearanceDraft(null);
            }
            dispatchUI({ type: 'navigate', screen, discard: true, root });
            setWaterConfirm(null);
          }
          function navigateScreen(screen, event) {
            if (!data?.configured && screen !== 'schedule') return;
            if (ui.pending || busy || waterBusy || requestBusy.current || waterPending.current)
              return;
            const root = event?.currentTarget?.getAttribute?.('role') === 'menuitem';
            if (event?.currentTarget) focusReturn.current = event.currentTarget;
            if (screen !== ui.screen && draftChanged()) {
              dispatchUI({ type: 'navigate', screen, dirty: true, root });
              return;
            }
            performNavigation(screen, root);
          }
          function draftChanged() {
            if (waterEditing && waterPreferencesBase.current)
              return (
                waterEnabledDraft !== waterPreferencesBase.current.enabled ||
                Number(waterInterval) !== waterPreferencesBase.current.interval
              );
            if (ui.screen === 'schedule' && draft && salaryBase.current)
              return Object.keys(changedSettings(salaryBase.current, draft)).length > 0;
            if (appearanceOnly && appearanceDraft && appearanceBase.current)
              return (
                Object.keys(changedSettings(appearanceBase.current, appearanceDraft)).length > 0
              );
            return false;
          }
          function applyAppearance() {
            panelPlacement.current = null;
            if (appearanceDraft)
              setPreference(changedSettings(appearanceBase.current, appearanceDraft));
            performNavigation(ui.back);
            return true;
          }
          async function saveAndContinue() {
            if (!ui.pending || busy || waterBusy) return;
            const destination = ui.pending.screen;
            const result = waterEditing
              ? await saveWaterSettings({ preventDefault() {} })
              : appearanceOnly
                ? applyAppearance()
                : await save({ preventDefault() {} });
            if (result) performNavigation(destination, ui.pending.root);
            else dispatchUI({ type: 'stay' });
          }
          function updateAppearance(patch) {
            setAppearanceDraft((current) => ({ ...current, ...patch }));
          }
          function openAppearance(event) {
            navigateScreen('appearance', event);
          }
          function openEditor(event) {
            navigateScreen('schedule', event);
          }
          function closeEditor() {
            if ((!data?.configured && !appearanceOnly) || busy) return;
            performNavigation(ui.back);
          }
          function update(key, value) {
            setDraft((current) => ({ ...current, [key]: value }));
          }
          function toggleBreak(e) {
            const point = (text) => +text.slice(0, 2) * 60 + +text.slice(3);
            const label = (minutes) =>
              String(Math.floor(minutes / 60)).padStart(2, '0') +
              ':' +
              String(minutes % 60).padStart(2, '0');
            setDraft((current) => {
              if (!e.target.checked)
                return { ...current, breakStart: current.start, breakEnd: current.start };
              const start = point(current.start);
              const span = (point(current.end) - start + 1440) % 1440;
              return {
                ...current,
                breakStart: current.start,
                breakEnd: label((start + Math.max(1, Math.min(60, Math.floor(span / 2)))) % 1440),
              };
            });
          }

          const label = (text, control) =>
            h('label', { className: 'owc-field' }, h('span', null, text), control);
          const numberInput = (key) =>
            h('input', {
              name: key,
              type: 'number',
              step: 'any',
              min: key === 'workdaysPerMonth' ? '0.01' : '0',
              value: workingDraft?.[key] ?? '',
              disabled: busy,
              onChange: (e) => update(key, e.target.value === '' ? '' : e.target.valueAsNumber),
            });
          const timeInput = (key) =>
            h('input', {
              name: key,
              type: 'time',
              required: true,
              value: workingDraft?.[key] ?? '',
              disabled: busy,
              onChange: (e) => update(key, e.target.value),
            });
          const sessionSelect = () =>
            h(
              'select',
              {
                value: sessionId || '',
                disabled: busy,
                onChange: (e) => setSessionChoice(e.target.value),
              },
              sessionIds.length
                ? sessionIds.map((id) =>
                    h(
                      'option',
                      { key: id, value: id },
                      sessions?.byId?.[id]?.title || String(id).slice(0, 12),
                    ),
                  )
                : h('option', { value: '' }, t('noSession')),
            );
          const salaryToggle = () =>
            h(
              'button',
              {
                type: 'button',
                className: 'owc-text',
                'aria-pressed': view.masked,
                title: t(view.masked ? 'show' : 'hide'),
                onClick: () => setPreference({ masked: !view.masked }),
              },
              iconSvg(view.masked ? 'eyeOff' : 'eye', 13),
              t(view.masked ? 'show' : 'hide'),
            );

          const waterContext =
            data?.configured && safeState && !error ? hydrationContext(settings, safeState) : null;
          const waterState = hydrationView(water, waterContext, now);
          const waterClaim = water.shift?.claim;
          const waterPrompt =
            waterReady &&
            !waterError &&
            !editing &&
            !waterEditing &&
            waterVisible &&
            !document.hidden &&
            waterState.phase === 'due' &&
            waterClaim?.owner === waterOwner.current &&
            waterClaim.sequence === water.shift.sequence &&
            waterClaim.until > Date.now() &&
            waterClaim.until <= Date.now() + HYDRATION_LEASE_MS;
          const reactionSurface = [
            collapsed,
            editing,
            waterEditing,
            view.companion,
            view.companionMotion,
            waterVisible,
          ].join(':');
          if (reactionState.current?.token !== waterNotice?.token) {
            reactionState.current = {
              token: waterNotice?.token,
              surface: reactionSurface,
              stopped: ['quiet', 'paused', 'break'].includes(waterState.phase),
            };
          } else if (reactionState.current && reactionState.current.surface !== reactionSurface) {
            reactionState.current.stopped = true;
          }
          const companion = companionPresentation({
            workStatus: safeState?.status,
            phase: waterState.phase,
            ownsPrompt: waterPrompt,
            ready: waterReady && !!safeState,
            failed: waterError || !!error,
            feedback: waterNotice || null,
            visible: view.companion,
            motion: view.companionMotion && !reactionState.current?.stopped,
            pageVisible: waterVisible && !document.hidden && !editing && !waterEditing,
          });
          const companionCard = (compact = false) =>
            companion.visible &&
            h(
              'div',
              { className: 'owc-companion', 'data-companion': companion.pose },
              !compact && companionArtwork(h, companion, 52, waterNotice?.token),
              h(
                'div',
                { className: 'owc-companion-copy' },
                h(
                  'div',
                  { className: 'owc-companion-name' },
                  t('companionName'),
                  h('span', null, t('companionLabel')),
                ),
                companion.message &&
                  h(
                    'p',
                    {
                      key: companion.announce
                        ? 'feedback:' + (waterNotice?.token ?? companion.message)
                        : 'ambient',
                    },
                    t(companion.message),
                  ),
              ),
            );
          const waterSummary = () => {
            if (!waterReady) return t('waterLoading');
            if (waterError) return t('waterUnavailable');
            if (
              water.enabled &&
              waterContext &&
              water.shift &&
              water.shift.config !== waterContext.config
            )
              return t('waterStale');
            const labels = {
              off: 'waterOff',
              waiting: 'waterWaiting',
              break: 'waterBreak',
              paused: 'waterPaused',
              finished: 'waterFinished',
              due: waterPrompt ? 'waterDue' : 'waterOther',
            };
            if (waterState.phase === 'quiet')
              return t('waterQuiet') + ' · ' + formatDuration(waterState.quietRemaining / 1000);
            return waterState.phase === 'countdown'
              ? t('waterNext') + ' · ' + formatDuration(waterState.remaining / 1000)
              : t(labels[waterState.phase]);
          };
          const waterCanRecord =
            waterReady &&
            !waterError &&
            data?.configured &&
            ['working', 'lunch'].includes(waterContext?.status) &&
            (!water.shift || water.shift.config === waterContext.config);
          const waterCanQuiet = waterCanRecord && water.enabled && !water.shift?.paused;
          const recordWater = (event) => {
            if (event.detail > 1) return;
            if (!manualAttempt.current)
              manualAttempt.current = {
                type: 'manual-drink',
                shiftId: waterContext.id,
                actionId: window.crypto?.randomUUID?.() || String(Math.random()) + Date.now(),
                ...(waterState.phase === 'due' ? { eventId: waterState.eventId } : {}),
              };
            void waterAction(manualAttempt.current);
          };
          const waterControls = () =>
            h(
              'div',
              { className: 'owc-water-actions' },
              !waterPrompt &&
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-primary',
                    disabled: !waterCanRecord || waterBusy,
                    onClick: recordWater,
                  },
                  t('waterManual'),
                ),
              waterState.phase === 'quiet' &&
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy || waterError,
                    onClick: () => waterAction({ type: 'end-quiet' }),
                  },
                  t('waterQuietEnd'),
                ),
              waterCanQuiet &&
                h(
                  'details',
                  { className: 'owc-water-quiet' },
                  h(
                    'summary',
                    null,
                    t(waterState.phase === 'quiet' ? 'waterQuietAdjust' : 'waterQuiet'),
                  ),
                  h(
                    'div',
                    { className: 'owc-water-actions' },
                    [30, 60].map((minutes) =>
                      h(
                        'button',
                        {
                          key: minutes,
                          type: 'button',
                          disabled: waterBusy,
                          onClick: (event) => {
                            const menu = event.currentTarget.closest('details');
                            menu.open = false;
                            menu.querySelector('summary')?.focus();
                            void waterAction({ type: 'quiet', minutes });
                          },
                        },
                        t(minutes === 30 ? 'waterQuiet30' : 'waterQuiet60'),
                      ),
                    ),
                  ),
                  waterState.phase !== 'quiet' &&
                    h('p', { className: 'owc-hint' }, t('waterQuietHint')),
                ),
              water.enabled &&
                h(
                  'button',
                  {
                    type: 'button',
                    disabled:
                      waterError ||
                      waterBusy ||
                      !waterContext ||
                      water.shift?.id !== waterContext.id,
                    onClick: () => waterAction({ type: water.shift?.paused ? 'resume' : 'pause' }),
                  },
                  t(water.shift?.paused ? 'waterResume' : 'waterPause'),
                ),
              waterError &&
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy,
                    onClick: () => waterAction({ type: 'retry' }),
                  },
                  t('waterRetry'),
                ),
            );

          const waterOverview = (quick = false) =>
            h(
              'div',
              {
                className: 'owc-water owc-water-overview',
                'data-water-overview': true,
                'data-water-quick': quick || undefined,
                role: quick ? 'region' : undefined,
                'aria-label': quick ? t('waterQuick') : undefined,
                onKeyDown: quick
                  ? (event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        closeWaterQuick();
                      }
                    }
                  : undefined,
              },
              h(
                'div',
                { className: 'owc-water-head' },
                h('strong', null, iconSvg('water', 14), t('waterTitle')),
                quick &&
                  h(
                    'button',
                    { type: 'button', className: 'owc-text', onClick: openAppearance },
                    t('appearanceGroup'),
                  ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-text',
                    style: { marginLeft: 'auto' },
                    'aria-label': t('waterEdit'),
                    disabled: !waterReady || !data?.configured,
                    onClick: openWaterEditor,
                  },
                  t('settings'),
                ),
                quick &&
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-icon',
                      'aria-label': t('waterQuickClose'),
                      title: t('waterQuickClose'),
                      onClick: closeWaterQuick,
                    },
                    iconSvg('close', 14),
                  ),
              ),
              quick && companionCard(true),
              !waterPrompt &&
                h(
                  'p',
                  { className: 'owc-water-status', 'data-water-status': true },
                  waterSummary(),
                ),
              h(
                'div',
                { className: 'owc-water-meta' },
                h(
                  'span',
                  { 'data-water-effective': water.interval },
                  t('waterEvery') + ' ' + water.interval + ' ' + t('waterMinutes'),
                ),
                h('span', { 'data-water-count': true }, t('waterCount') + ': ' + waterState.count),
              ),
              waterControls(),
              !['working', 'lunch'].includes(waterContext?.status) &&
                h('p', { className: 'owc-hint' }, t('waterRecordHint')),
              waterState.phase === 'quiet' &&
                h('p', { className: 'owc-hint' }, t('waterQuietHint')),
              waterNotice && !view.companion && h('p', null, t(waterNotice.key)),
            );

          const waterSettings = () =>
            h(
              'form',
              {
                className: 'owc-water owc-water-form',
                'data-water-settings': true,
                onSubmit: saveWaterSettings,
                noValidate: true,
                onKeyDown: (event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    navigateScreen(ui.back);
                  }
                },
              },
              h(
                'label',
                { className: 'owc-water-toggle' },
                h('span', null, t('waterEnable')),
                h('input', {
                  type: 'checkbox',
                  checked: waterEnabledDraft,
                  disabled: !waterReady || waterError || waterBusy || !data?.configured,
                  onChange: (event) => {
                    setWaterEnabledDraft(event.target.checked);
                    setWaterNotice(false);
                  },
                }),
              ),
              h(
                'fieldset',
                { disabled: !waterReady || waterError || waterBusy || !data?.configured },
                h('legend', { className: 'owc-muted' }, t('waterPresets')),
                h(
                  'div',
                  { className: 'owc-water-presets' },
                  [15, 30, 45, 60, 90, 120].map((minutes) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        key: minutes,
                        'aria-pressed': Number(waterInterval) === minutes,
                        onClick: () => {
                          setWaterInterval(String(minutes));
                          setWaterInvalid(false);
                        },
                      },
                      minutes + ' ' + t('waterMinutes'),
                    ),
                  ),
                ),
                h(
                  'label',
                  { className: 'owc-field' },
                  h('span', null, t('waterInterval')),
                  h('input', {
                    name: 'waterInterval',
                    type: 'number',
                    inputMode: 'numeric',
                    min: '5',
                    max: '240',
                    step: '1',
                    value: waterInterval,
                    'aria-invalid': waterInvalid,
                    onChange: (event) => {
                      setWaterInterval(event.target.value);
                      setWaterInvalid(false);
                    },
                  }),
                ),
              ),
              waterInvalid && h('p', { role: 'alert' }, t('waterInvalid')),
              h(
                'p',
                { 'data-water-saved-interval': water.interval },
                t('waterEffective') + ': ' + water.interval + ' ' + t('waterMinutes'),
              ),
              h('p', { className: 'owc-hint' }, t('waterSaveHint')),
              h('p', { className: 'owc-hint' }, t('waterBrief')),
              waterError && h('p', { role: 'alert' }, t('waterUnavailable')),
              !data?.configured && h('p', null, t('waterSetup')),
              h(
                'div',
                { className: 'owc-save' },
                h(
                  'button',
                  { type: 'button', disabled: waterBusy, onClick: closeWaterEditor },
                  t('cancel'),
                ),
                h(
                  'button',
                  {
                    type: 'submit',
                    className: 'owc-primary',
                    disabled: !waterReady || waterError || waterBusy || !data?.configured,
                  },
                  t(waterBusy ? 'busy' : 'waterSave'),
                ),
              ),
              waterError &&
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy,
                    onClick: () => waterAction({ type: 'retry' }),
                  },
                  t('waterRetry'),
                ),
              h(
                'details',
                null,
                h('summary', null, t('waterManage')),
                h('p', null, t('waterLocal')),
                h(
                  'div',
                  { className: 'owc-water-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      disabled: waterError || waterBusy || !waterState.count,
                      onClick: () => setWaterConfirm('clear-count'),
                    },
                    t('waterClear'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      disabled: waterBusy || !waterReady,
                      onClick: () => setWaterConfirm('reset'),
                    },
                    t('waterReset'),
                  ),
                ),
                waterConfirm &&
                  h(
                    'div',
                    { className: 'owc-water-confirm' },
                    h('p', null, t(waterConfirm === 'reset' ? 'waterResetHint' : 'waterClearHint')),
                    h(
                      'div',
                      { className: 'owc-water-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          disabled: waterBusy,
                          onClick: () => waterAction({ type: waterConfirm }),
                        },
                        t('waterConfirm'),
                      ),
                      h(
                        'button',
                        { type: 'button', onClick: () => setWaterConfirm(null) },
                        t('cancel'),
                      ),
                    ),
                  ),
              ),
            );
          const waterReminder = () =>
            waterPrompt &&
            h(
              'div',
              { className: 'owc-water owc-water-due', 'data-water-event': waterState.eventId },
              h('p', null, iconSvg('water', 14), ' ' + t('waterDue')),
              h(
                'div',
                { className: 'owc-water-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy,
                    onClick: () => waterAction({ type: 'drink', eventId: waterState.eventId }),
                  },
                  t('waterDrink'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy,
                    onClick: () => waterAction({ type: 'snooze', eventId: waterState.eventId }),
                  },
                  t('waterSnooze'),
                ),
              ),
            );

          const strip = () =>
            h(
              'div',
              { className: 'owc-pill' },
              h(
                'div',
                { className: 'owc-pill-top' },
                companion.visible
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'owc-companion-trigger',
                        'aria-label': t('companionOpen'),
                        'aria-expanded': waterQuickOpen,
                        title:
                          t('companionName') +
                          (companion.message ? ' · ' + t(companion.message) : ''),
                        onClick: toggleWaterQuick,
                        onKeyDown: (event) => {
                          if (event.key === 'Escape' && waterQuickOpen) {
                            event.preventDefault();
                            closeWaterQuick();
                          }
                        },
                      },
                      companionArtwork(h, companion, 36, waterNotice?.token),
                    )
                  : iconSvg('alarm', 16),
                h(
                  'span',
                  { className: 'owc-grip', tabIndex: 0, title: t('drag'), onKeyDown: gripKeys },
                  safeState.status !== 'done' &&
                    h('span', { className: 'owc-pill-status' }, t(safeState.status)),
                  h('span', { className: 'owc-pill-time' }, duration),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-icon',
                    style: { marginLeft: 'auto' },
                    title: t('expand'),
                    'aria-label': t('expand'),
                    onClick: () => {
                      setWaterQuickOpen(false);
                      setPreference({ mini: false });
                    },
                  },
                  iconSvg('chevronUp', 14),
                ),
              ),
              waterPrompt
                ? waterReminder()
                : h(
                    'div',
                    { className: 'owc-pill-bottom' },
                    h(
                      'div',
                      { className: 'owc-pill-salary' },
                      h(
                        'span',
                        {
                          className: 'owc-pill-money',
                          'aria-label': view.masked ? t('masked') : moneyText,
                        },
                        moneyText,
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'owc-icon',
                          title: t(view.masked ? 'show' : 'hide'),
                          'aria-label': t(view.masked ? 'show' : 'hide'),
                          onClick: () => setPreference({ masked: !view.masked }),
                        },
                        iconSvg(view.masked ? 'eyeOff' : 'eye', 13),
                      ),
                    ),
                    (water.enabled || waterError) &&
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'owc-pill-water',
                          onClick: toggleWaterQuick,
                          'aria-label': t('waterQuick'),
                          'aria-expanded': waterQuickOpen,
                          onKeyDown: (event) => {
                            if (event.key === 'Escape' && waterQuickOpen) {
                              event.preventDefault();
                              closeWaterQuick();
                            }
                          },
                          title: waterSummary(),
                        },
                        iconSvg('water', 13),
                        waterState.phase === 'quiet' && !waterError
                          ? t('waterQuiet') +
                              ' ' +
                              formatDuration(waterState.quietRemaining / 1000).replace(/^00:/, '')
                          : waterState.phase === 'countdown' && !waterError
                            ? formatDuration(waterState.remaining / 1000).replace(/^00:/, '')
                            : t(
                                waterError
                                  ? 'waterTitle'
                                  : {
                                      paused: 'waterPaused',
                                      break: 'lunch',
                                      waiting: 'waterWaiting',
                                      finished: 'waterFinished',
                                      due: 'waterDue',
                                      off: 'waterOff',
                                    }[waterState.phase],
                              ),
                      ),
                  ),
            );

          const panelHead = () =>
            h(
              'div',
              { className: 'owc-head' },
              h(
                'span',
                {
                  className: 'owc-title',
                  tabIndex: 0,
                  title: t('drag'),
                  onKeyDown: gripKeys,
                },
                waterEditing
                  ? t('waterTitle')
                  : editing
                    ? t(
                        appearanceOnly
                          ? 'appearanceGroup'
                          : data?.configured
                            ? 'settings'
                            : 'setup',
                      )
                    : petMode
                      ? t('companionName')
                      : t('title'),
              ),
              !editing &&
                !waterEditing &&
                data?.configured &&
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-text',
                    onClick: openAppearance,
                  },
                  t('appearanceGroup'),
                ),
              waterEditing
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-icon',
                      title: t('waterBack'),
                      'aria-label': t('waterBack'),
                      onClick: closeWaterEditor,
                      disabled: waterBusy,
                    },
                    iconSvg('close'),
                  )
                : editing
                  ? data?.configured &&
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'owc-icon',
                        title: t(appearanceOnly ? 'waterBack' : 'cancel'),
                        'aria-label': t(appearanceOnly ? 'waterBack' : 'cancel'),
                        onClick: closeEditor,
                        disabled: busy,
                      },
                      iconSvg('close'),
                    )
                  : h(
                      React.Fragment,
                      null,
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'owc-icon',
                          title: t('settings'),
                          'aria-label': t('settings'),
                          onClick: openEditor,
                          disabled: busy,
                        },
                        iconSvg('sliders'),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'owc-icon',
                          title: t(petMode ? 'petClose' : 'collapse'),
                          'aria-label': t(petMode ? 'petClose' : 'collapse'),
                          onClick: () =>
                            petMode ? closePetPanel() : setPreference({ mini: true }),
                        },
                        iconSvg('chevronDown'),
                      ),
                    ),
            );

          const panelBody = (section = 'all') => {
            if (!safeState)
              return h(
                'div',
                { className: 'owc-main' },
                h(
                  'div',
                  { className: 'owc-status' },
                  h('span', { className: 'owc-dot' }),
                  t('loading'),
                ),
                !sessionId && h('p', { className: 'owc-hint' }, t('noSession')),
                h(
                  'div',
                  { className: 'owc-row-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-text',
                      onClick: () => reload(true),
                      disabled: busy || !sessionId,
                    },
                    iconSvg('refresh', 12),
                    t('retry'),
                  ),
                ),
              );
            const status = safeState.status === 'done' ? '' : t(safeState.status);
            return h(
              'div',
              { className: 'owc-main' },
              section !== 'earnings' &&
                status &&
                h('div', { className: 'owc-status' }, h('span', { className: 'owc-dot' }), status),
              section !== 'earnings' &&
                h(
                  'div',
                  { className: 'owc-time', 'aria-label': status + ' ' + duration },
                  duration,
                ),
              section !== 'earnings' &&
                h(
                  'div',
                  {
                    className: 'owc-progress',
                    role: 'progressbar',
                    'aria-label': t('progress'),
                    'aria-valuenow': Math.floor(safeState.progress * 100),
                    'aria-valuemin': 0,
                    'aria-valuemax': 100,
                  },
                  h('div', { style: { width: safeState.progress * 100 + '%' } }),
                ),
              section !== 'clock' &&
                h(
                  'div',
                  { className: 'owc-earn-row' },
                  h('span', { className: 'owc-muted' }, t('earned')),
                  salaryToggle(),
                ),
              section !== 'clock' &&
                h(
                  'div',
                  { className: 'owc-money', 'aria-label': view.masked ? t('masked') : moneyText },
                  moneyText,
                ),
              section !== 'clock' &&
                h(
                  'div',
                  { className: 'owc-stats' },
                  h(
                    'div',
                    null,
                    h('span', null, t('daily')),
                    h('strong', null, money(safeState.daily)),
                  ),
                  h(
                    'div',
                    null,
                    h('span', null, t('hourly')),
                    h('strong', null, money(safeState.hourly)),
                  ),
                ),
              h(
                'div',
                { className: 'owc-meta' },
                h(
                  'span',
                  null,
                  settings.start +
                    ' — ' +
                    settings.end +
                    (settings.end < settings.start ? ' +1' : '') +
                    ' · ' +
                    (settings.breakStart === settings.breakEnd
                      ? t('noBreak')
                      : settings.breakStart + '–' + settings.breakEnd),
                ),
                h(
                  'span',
                  null,
                  t('shiftDate') + ' ' + safeState.shiftDate + ' · ' + settings.timezone,
                ),
              ),
              h(
                'div',
                { className: 'owc-row-actions' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-text',
                    onClick: () => reload(true),
                    disabled: busy,
                  },
                  iconSvg('refresh', 12),
                  t('refresh'),
                ),
                petMode &&
                  h(
                    'button',
                    { type: 'button', className: 'owc-text', onClick: openEditor },
                    t('petWorkSettings'),
                  ),
                !petMode &&
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-text',
                      onClick: () =>
                        setPreference(petMode ? { petPosition: null } : { position: null }),
                    },
                    t('reset'),
                  ),
              ),
            );
          };

          const appearanceFields = () =>
            h(
              'fieldset',
              { className: 'owc-setting-group' },
              h('legend', null, t('appearanceGroup')),
              h(
                'label',
                { className: 'owc-check' },
                h('input', {
                  type: 'checkbox',
                  name: 'companion',
                  checked: view.companion,
                  onChange: (event) => updateAppearance({ companion: event.target.checked }),
                }),
                t('petMode'),
              ),
              h(
                'label',
                { className: 'owc-check' },
                h('input', {
                  type: 'checkbox',
                  checked: view.companionMotion,
                  disabled: !view.companion,
                  onChange: (event) => updateAppearance({ companionMotion: event.target.checked }),
                }),
                t('companionMotion'),
              ),
              label(
                t('petSize'),
                h('input', {
                  type: 'range',
                  min: '80',
                  max: '180',
                  step: '4',
                  value: view.petSize,
                  'aria-label': t('petSize'),
                  disabled: !view.companion,
                  onChange: (event) => updateAppearance({ petSize: event.target.valueAsNumber }),
                }),
              ),
              h('p', { className: 'owc-hint' }, t('petAppearanceHint')),
              label(
                t('opacity'),
                h(
                  React.Fragment,
                  null,
                  h('input', {
                    className: 'owc-range',
                    type: 'range',
                    min: '30',
                    max: '100',
                    step: '1',
                    value: String(Math.round(view.opacity * 100)),
                    disabled: busy,
                    'aria-label': t('opacity'),
                    onChange: (event) =>
                      updateAppearance({ opacity: event.target.valueAsNumber / 100 }),
                  }),
                  h(
                    'span',
                    { className: 'owc-hint', style: { margin: 0 } },
                    Math.round(view.opacity * 100) + '% · ' + t('opacityHint'),
                  ),
                ),
              ),
            );
          const editor = () => {
            if (appearanceOnly)
              return h(
                'div',
                { className: 'owc-form owc-appearance', 'data-appearance-settings': true },
                h('p', { className: 'owc-hint' }, t('petAppearancePreview')),
                h(
                  'div',
                  { 'data-appearance-preview': true, className: 'owc-appearance-preview' },
                  view.companion
                    ? petArtwork(h, companion, view.petSize)
                    : h('p', null, t('petClassicPreview')),
                ),
                appearanceFields(),
                h(
                  'div',
                  { className: 'owc-save' },
                  h('button', { type: 'button', onClick: closeEditor }, t('cancel')),
                  h(
                    'button',
                    { type: 'button', className: 'owc-primary', onClick: applyAppearance },
                    t('petApplyAppearance'),
                  ),
                ),
              );
            if (!workingDraft) return null;
            const payDaily = workingDraft.payMode === 'daily';
            const salaryKey = payDaily ? 'dailySalary' : 'monthlySalary';
            const salaryControl = view.masked
              ? h(
                  'div',
                  { className: 'owc-private' },
                  h('span', null, '••••'),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-text',
                      'aria-label': t('show'),
                      onClick: () => setPreference({ masked: false }),
                    },
                    t('show'),
                  ),
                )
              : numberInput(salaryKey);
            const breakOn = workingDraft.breakStart !== workingDraft.breakEnd;
            const commonZones = [
              'Asia/Shanghai',
              'Asia/Hong_Kong',
              'Asia/Taipei',
              'Asia/Singapore',
              'Asia/Tokyo',
              'Asia/Seoul',
              'Asia/Kolkata',
              'Europe/London',
              'Europe/Paris',
              'America/New_York',
              'America/Los_Angeles',
              'Australia/Sydney',
              'UTC',
            ];
            let allZones = [];
            try {
              allZones = Intl.supportedValuesOf('timeZone');
            } catch {}
            const zones = [
              ...new Set([workingDraft.timezone, ...commonZones, ...allZones].filter(Boolean)),
            ];
            return h(
              'form',
              {
                className: 'owc-form',
                onSubmit: save,
                onKeyDown: (e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    navigateScreen(ui.back);
                  }
                },
              },
              !data?.configured && h('p', { className: 'owc-hint' }, t('setupHint')),
              h(
                'fieldset',
                { className: 'owc-setting-group' },
                h('legend', null, t('salaryGroup')),
                label(
                  t('payMode'),
                  h(
                    'div',
                    { className: 'owc-seg' },
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: busy,
                        'aria-pressed': !payDaily,
                        'aria-label': t('monthly'),
                        onClick: () => update('payMode', 'monthly'),
                      },
                      t('monthly'),
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: busy,
                        'aria-pressed': payDaily,
                        'aria-label': t('dailyMode'),
                        onClick: () => update('payMode', 'daily'),
                      },
                      t('dailyMode'),
                    ),
                  ),
                ),
                h(
                  'div',
                  { className: 'owc-row2' },
                  label(t(salaryKey), salaryControl),
                  !payDaily && label(t('workdaysPerMonth'), numberInput('workdaysPerMonth')),
                ),
              ),
              h(
                'fieldset',
                { className: 'owc-setting-group' },
                h('legend', null, t('scheduleGroup')),
                h(
                  'div',
                  { className: 'owc-row2' },
                  label(t('start'), timeInput('start')),
                  label(t('end'), timeInput('end')),
                ),
                workingDraft.end < workingDraft.start &&
                  h('p', { className: 'owc-hint' }, t('end') + ' · ' + t('nextDay')),
                h(
                  'label',
                  { className: 'owc-check' },
                  h('input', {
                    type: 'checkbox',
                    checked: breakOn,
                    disabled: busy,
                    onChange: toggleBreak,
                  }),
                  t('breakEnabled'),
                ),
                breakOn &&
                  h(
                    'div',
                    { className: 'owc-row2' },
                    label(t('breakStart'), timeInput('breakStart')),
                    label(t('breakEnd'), timeInput('breakEnd')),
                  ),
                label(
                  t('weekdays'),
                  h(
                    'div',
                    { className: 'owc-days' },
                    [0, 1, 2, 3, 4, 5, 6].map((day) =>
                      h(
                        'button',
                        {
                          key: day,
                          type: 'button',
                          disabled: busy,
                          'aria-pressed': workingDraft.weekdays.includes(day),
                          'aria-label': t('weekdays') + ' ' + t('days')[day],
                          onClick: () =>
                            update(
                              'weekdays',
                              workingDraft.weekdays.includes(day)
                                ? workingDraft.weekdays.filter((d) => d !== day)
                                : [...workingDraft.weekdays, day].sort((a, b) => a - b),
                            ),
                        },
                        t('days')[day],
                      ),
                    ),
                  ),
                ),
                label(
                  t('timezone'),
                  h(
                    'select',
                    {
                      name: 'timezone',
                      value: workingDraft.timezone ?? '',
                      disabled: busy,
                      onChange: (e) => update('timezone', e.target.value),
                    },
                    zones.map((zone) => h('option', { key: zone, value: zone }, zone)),
                  ),
                ),
              ),
              preview &&
                !preview.error &&
                h(
                  'div',
                  { className: 'owc-preview' },
                  t('preview') +
                    ' · ' +
                    t('daily') +
                    ' ' +
                    money(preview.daily) +
                    ' · ' +
                    t('hourly') +
                    ' ' +
                    money(preview.hourly),
                ),
              preview?.error &&
                h(
                  'p',
                  { className: 'owc-error', role: 'alert', style: { padding: 0 } },
                  preview.error,
                ),
              h(
                'details',
                { className: 'owc-advanced' },
                h('summary', null, t('advanced')),
                h('p', { className: 'owc-hint' }, t('sessionHint')),
                label(t('session'), sessionSelect()),
              ),
              h('p', { className: 'owc-hint' }, t('privacy')),
              h(
                'div',
                { className: 'owc-save' },
                data?.configured &&
                  h(
                    'button',
                    { type: 'button', className: 'owc-text', onClick: closeEditor, disabled: busy },
                    t('cancel'),
                  ),
                h(
                  'button',
                  { type: 'submit', className: 'owc-primary', disabled: busy || !!preview?.error },
                  t(busy ? 'busy' : 'save'),
                ),
              ),
            );
          };

          const notices = () =>
            h(
              React.Fragment,
              null,
              error && h('p', { className: 'owc-error', role: 'alert' }, error),
              state?.error && h('p', { className: 'owc-error', role: 'alert' }, state.error),
              notice && h('p', { className: 'owc-note', role: 'status' }, notice),
              storageError && h('p', { className: 'owc-note' }, t('storage')),
            );

          function closePetPanel() {
            navigateScreen(null);
          }
          function togglePetPanel(event) {
            if (petDragged.current && event.detail !== 0) {
              petDragged.current = false;
              return;
            }
            navigateScreen(
              event.currentTarget.classList.contains('owc-pet-clock') ? 'income' : 'home',
              event,
            );
          }
          function closePetMenu(restore = true) {
            dispatchUI({ type: 'dismiss-menu' });
            if (restore)
              (menuTrigger.current?.isConnected
                ? menuTrigger.current
                : box.current?.querySelector('.owc-pet-handle')
              )?.focus();
          }
          const liveFeedback = () =>
            h(
              'span',
              { className: 'owc-sr-only', role: 'status', 'aria-atomic': true },
              h(
                'span',
                {
                  key: waterPrompt
                    ? waterState.eventId
                    : (waterNotice?.token ?? waterNotice?.key ?? 'idle'),
                },
                waterPrompt ? t('waterDue') : waterNotice ? t(waterNotice.key) : '',
              ),
            );
          const petShowing = petOpen;
          const petFloating = petShowing || waterPrompt;
          React.useLayoutEffect(() => {
            if (!petMode || !petFloating || !cardContent.current) return;
            const content = cardContent.current,
              header = petPanel.current?.querySelector('.owc-head');
            let frame = 0;
            const measure = () => {
              const height = Math.ceil(
                content.getBoundingClientRect().height +
                  (header?.getBoundingClientRect().height ?? 0) +
                  2,
              );
              setCardMeasure((current) =>
                current.key === measureKey && Math.abs(current.height - height) < 1
                  ? current
                  : { key: measureKey, height },
              );
            };
            const observer =
              typeof ResizeObserver === 'function'
                ? new ResizeObserver(() => {
                    cancelAnimationFrame(frame);
                    frame = requestAnimationFrame(measure);
                  })
                : null;
            observer?.observe(content);
            if (header) observer?.observe(header);
            measure();
            return () => {
              observer?.disconnect();
              cancelAnimationFrame(frame);
            };
          }, [petMode, petFloating, measureKey, ui.pending]);
          React.useLayoutEffect(() => {
            if (!petMode || !ui.menu || !menuContent.current) return;
            const content = menuContent.current;
            let frame = 0;
            const measure = () => {
              const height = Math.ceil(content.getBoundingClientRect().height + 2);
              setMenuMeasure((current) =>
                current.width === menuWidth && Math.abs(current.height - height) < 1
                  ? current
                  : { width: menuWidth, height },
              );
            };
            const observer =
              typeof ResizeObserver === 'function'
                ? new ResizeObserver(() => {
                    cancelAnimationFrame(frame);
                    frame = requestAnimationFrame(measure);
                  })
                : null;
            observer?.observe(content);
            measure();
            return () => {
              observer?.disconnect();
              cancelAnimationFrame(frame);
            };
          }, [petMode, !!ui.menu, menuWidth]);
          React.useLayoutEffect(() => {
            if (!petMode || petShowing || waterPrompt || !waterNotice || !toastContent.current)
              return;
            const content = toastContent.current;
            let frame = 0;
            const measure = () => {
              const height = Math.ceil(content.getBoundingClientRect().height + 20);
              setToastHeight((current) => (current === height ? current : height));
            };
            const observer =
              typeof ResizeObserver === 'function'
                ? new ResizeObserver(() => {
                    cancelAnimationFrame(frame);
                    frame = requestAnimationFrame(measure);
                  })
                : null;
            observer?.observe(content);
            measure();
            return () => {
              observer?.disconnect();
              cancelAnimationFrame(frame);
            };
          }, [petMode, petShowing, waterPrompt, waterNotice, viewport.width]);
          React.useEffect(() => {
            if (!ui.menu) return;
            const blur = () => dispatchUI({ type: 'dismiss-menu' });
            window.addEventListener('blur', blur);
            return () => window.removeEventListener('blur', blur);
          }, [ui.menu]);
          React.useEffect(() => {
            if (!petMode || (!petShowing && !ui.menu)) return;
            const outside = (event) => {
              if (ui.menu && !menuBox.current?.contains(event.target)) {
                dispatchUI({ type: 'dismiss-menu' });
                return;
              }
              if (box.current?.contains(event.target)) return;
              if (ui.menu) dispatchUI({ type: 'dismiss-menu' });
              else if (!editing && !waterEditing && !waterBusy)
                dispatchUI({ type: 'navigate', screen: null });
            };
            document.addEventListener('pointerdown', outside);
            return () => document.removeEventListener('pointerdown', outside);
          }, [petMode, petShowing, ui.menu, editing, waterEditing, waterBusy]);
          React.useEffect(() => {
            if (ui.menu) menuBox.current?.querySelector('[role=menuitem]:not(:disabled)')?.focus();
          }, [ui.menu]);
          React.useEffect(() => {
            if (!petMode || editing || waterEditing || ui.menu) return;
            if (ui.pending) {
              box.current?.querySelector('[data-keep-editing]')?.focus();
              return;
            }
            if (ui.screen === null) box.current?.querySelector('.owc-pet-handle')?.focus();
            else petPanel.current?.querySelector('[data-pet-page-title]')?.focus();
          }, [ui.screen]);

          React.useEffect(() => {
            if (ui.pending && (busy || waterBusy))
              box.current?.querySelector('[data-nav-confirm]')?.focus();
          }, [ui.pending, busy, waterBusy]);
          const draftGuard = () =>
            h(
              'div',
              {
                className: 'owc-pet-unsaved',
                'data-nav-confirm': true,
                tabIndex: -1,
                onKeyDown: (event) => {
                  if (event.key !== 'Tab') return;
                  const buttons = [
                    ...event.currentTarget.querySelectorAll('button:not(:disabled)'),
                  ];
                  if (!buttons.length) {
                    event.preventDefault();
                    return;
                  }
                  if (event.shiftKey && document.activeElement === buttons[0]) {
                    event.preventDefault();
                    buttons.at(-1).focus();
                  } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
                    event.preventDefault();
                    buttons[0].focus();
                  }
                },
                role: 'alertdialog',
                'aria-label': t('petUnsaved'),
              },
              h('h3', null, t('petUnsaved')),
              h('p', null, t('petUnsavedHint')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-primary',
                  disabled: busy || waterBusy,
                  onClick: saveAndContinue,
                },
                t('petSaveContinue'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  disabled: busy || waterBusy,
                  onClick: () => performNavigation(ui.pending.screen, ui.pending.root),
                },
                t('petDiscard'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  'data-keep-editing': true,
                  disabled: busy || waterBusy,
                  onClick: () => dispatchUI({ type: 'stay' }),
                },
                t('petKeepEditing'),
              ),
            );
          const petPageTitle = {
            home: 'petWaterCard',
            income: 'petCountdownCard',
            earnings: 'petEarningsCard',
            water: 'petWaterSettings',
            appearance: 'petAppearance',
            schedule: 'petWorkSettings',
          };
          const petHeader = () =>
            h(
              'div',
              { className: 'owc-head' },
              PET_EDITOR_SCREENS.includes(ui.screen) &&
                ui.back !== null &&
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-text',
                    disabled: busy || waterBusy || !!ui.pending,
                    onClick: () => navigateScreen(ui.back),
                    'aria-label': t('petBack'),
                  },
                  '← ',
                  t('petBack'),
                ),
              h(
                'strong',
                { 'data-pet-page-title': true, tabIndex: -1, style: { flex: 1, fontSize: 12 } },
                t(petPageTitle[ui.screen] || 'waterTitle'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-icon',
                  'aria-label': t('petCloseAll'),
                  disabled: busy || waterBusy || !!ui.pending,
                  onClick: closePetPanel,
                },
                iconSvg('close', 14),
              ),
            );
          const petHome = () =>
            h(
              'div',
              { className: 'owc-pet-home', 'data-pet-home': true },

              h(
                'div',
                {
                  className: 'owc-pet-water-card' + (waterPrompt ? ' owc-water-due' : ''),
                  'data-water-event': waterPrompt ? waterState.eventId : undefined,
                },
                h(
                  'p',
                  { className: 'owc-water-status', 'data-water-status': true },
                  waterPrompt
                    ? t('waterDue')
                    : waterState.phase === 'quiet'
                      ? t('petQuietActive')
                      : waterSummary(),
                ),
                h(
                  'div',
                  { className: 'owc-pet-water-row' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'owc-primary',
                      disabled: !waterCanRecord || waterBusy,
                      onClick: recordWater,
                    },
                    t('petRecord'),
                  ),
                  h(
                    'span',
                    { 'data-water-count': true },
                    t('waterCount') + ': ' + waterState.count,
                  ),
                ),
              ),
              h(
                'div',
                { className: 'owc-pet-quiet-row' },
                [30, 60].map((minutes) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      key: minutes,
                      disabled: !waterCanQuiet || waterBusy,
                      onClick: () => waterAction({ type: 'quiet', minutes }),
                    },
                    t(minutes === 30 ? 'petQuiet30' : 'petQuiet60'),
                  ),
                ),
              ),
              h(
                'div',
                { className: 'owc-pet-quiet-status' },
                waterPrompt
                  ? h(
                      'button',
                      {
                        type: 'button',
                        disabled: waterBusy,
                        onClick: () => waterAction({ type: 'snooze', eventId: waterState.eventId }),
                      },
                      t('waterSnooze'),
                    )
                  : water.shift?.paused
                    ? t('petPausedHint')
                    : waterState.phase === 'quiet'
                      ? h(
                          React.Fragment,
                          null,
                          t('waterQuiet') +
                            ' · ' +
                            formatDuration(waterState.quietRemaining / 1000),
                          h(
                            'button',
                            {
                              type: 'button',
                              disabled: waterBusy,
                              onClick: () => waterAction({ type: 'end-quiet' }),
                            },
                            t('waterQuietEnd'),
                          ),
                        )
                      : t('petQuietHint'),
              ),
              h(
                'div',
                { className: 'owc-pet-feedback' },
                waterNotice
                  ? t(waterNotice.key)
                  : waterError
                    ? t('waterUnavailable')
                    : t('petHomeHint'),
              ),
              waterError &&
                h(
                  'button',
                  {
                    type: 'button',
                    disabled: waterBusy,
                    onClick: () => waterAction({ type: 'retry' }),
                  },
                  t('waterRetry'),
                ),
              h(
                'div',
                { className: 'owc-pet-home-links' },
                h('button', { type: 'button', onClick: openWaterEditor }, t('petWaterSettings')),
                h(
                  'button',
                  {
                    type: 'button',
                    disabled:
                      !water.enabled ||
                      busy ||
                      waterBusy ||
                      waterError ||
                      !waterContext ||
                      water.shift?.id !== waterContext.id,
                    onClick: () => waterAction({ type: water.shift?.paused ? 'resume' : 'pause' }),
                  },
                  t(water.shift?.paused ? 'waterResume' : 'waterPause'),
                ),
              ),
            );
          const contextMenu = () =>
            ui.menu &&
            h(
              'div',
              {
                ref: menuBox,
                className: 'owc-pet-context',
                role: 'menu',
                'aria-label': t('petMenu'),
                style: {
                  left: menuLayout.left,
                  top: menuLayout.top,
                  width: menuLayout.width,
                  maxHeight: menuLayout.height,
                },
                onBlur: (event) => {
                  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
                    dispatchUI({ type: 'dismiss-menu' });
                },
                onKeyDown: (event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    closePetMenu();
                    return;
                  }
                  const items = [
                    ...event.currentTarget.querySelectorAll('[role=menuitem]:not(:disabled)'),
                  ];
                  const index = items.indexOf(document.activeElement);
                  const next =
                    event.key === 'ArrowDown'
                      ? (index + 1) % items.length
                      : event.key === 'ArrowUp'
                        ? (index + items.length - 1) % items.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? items.length - 1
                            : -1;
                  if (next >= 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    items[next]?.focus();
                  }
                },
              },
              h(
                'div',
                { ref: menuContent, className: 'owc-menu-natural' },
                [
                  ['income', 'petCountdownCard'],
                  ['home', 'petWaterCard'],
                  ['earnings', 'petEarningsCard'],
                  ['appearance', 'petAppearance'],
                  ['schedule', 'petWorkSettings'],
                ].map(([screen, label]) =>
                  h(
                    'button',
                    {
                      key: screen,
                      type: 'button',
                      role: 'menuitem',
                      tabIndex: -1,
                      disabled: busy || waterBusy,
                      onClick: (event) => navigateScreen(screen, event),
                    },
                    t(label),
                  ),
                ),

                h('hr', null),
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'menuitem',
                    tabIndex: -1,
                    onClick: () => {
                      setPreference({ petPosition: null });
                      closePetMenu();
                    },
                  },
                  t('reset'),
                ),
              ),
            );

          if (petMode)
            return h(
              'section',
              {
                ref: box,
                className: 'owc-v2 owc-pet-shell',
                'data-version': '1.0.1',
                'data-pet-model': PET_MODEL.id,
                'data-status': safeState.status,
                'aria-label': t('companionLabel'),
                style: {
                  '--owc-alpha': String(view.opacity),
                  left: petGeometry.x,
                  top: petGeometry.y,
                  right: 'auto',
                  width: petGeometry.petWidth,
                  height: petGeometry.petHeight,
                },
                onPointerDown: dragDown,
                onPointerMove: dragMove,
                onPointerUp: dragEnd,
                onPointerCancel: dragEnd,
                onLostPointerCapture: dragEnd,
                onContextMenuCapture: openAppearanceContext,
                onKeyDown: (event) => {
                  if (appearanceShortcut(event)) return;
                  if (event.key !== 'Escape' || event.defaultPrevented) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (ui.menu) closePetMenu();
                  else if (busy || waterBusy) return;
                  else if (ui.pending) dispatchUI({ type: 'stay' });
                  else if (editing || waterEditing) navigateScreen(ui.back);
                  else if (petShowing) closePetPanel();
                  else if (waterPrompt)
                    void waterAction({ type: 'snooze', eventId: waterState.eventId });
                },
              },
              h('style', null, STYLE),
              liveFeedback(),
              h(
                'div',
                { className: 'owc-pet-stage' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-pet-handle',
                    'aria-label': t('petOpen'),
                    'aria-expanded': !!petShowing,
                    title: t('companionName') + ' · ' + t('petHint'),
                    onClick: togglePetPanel,
                    onKeyDown: gripKeys,
                  },
                  petArtwork(h, companion, petGeometry.artworkSize, waterNotice?.token),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-pet-clock',
                    onClick: togglePetPanel,
                    'aria-label': t('petClock'),
                  },
                  iconSvg('alarm', 12),
                  h('span', { className: 'owc-pet-clock-label' }, t(safeState.status)),
                  ['done', 'rest'].includes(safeState.status) ? null : h('strong', null, duration),
                ),
              ),
              waterPrompt &&
                petShowing &&
                ui.screen !== 'home' &&
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'owc-pet-water-alert owc-water-due',
                    'data-water-event': waterState.eventId,
                    'aria-label': t('petWaterAlert'),
                    onClick: (event) => navigateScreen('home', event),
                    style: {
                      left: waterAlertLayout.left,
                      top: waterAlertLayout.top,
                      width: waterAlertLayout.width,
                      height: waterAlertLayout.height,
                    },
                  },
                  iconSvg('water', 13),
                  t('petWaterBadge'),
                ),
              contextMenu(),
              !petShowing &&
                !waterPrompt &&
                waterNotice &&
                h(
                  'div',
                  {
                    className: 'owc-pet-toast',
                    'aria-hidden': true,
                    style: {
                      left: toastLayout.left,
                      top: toastLayout.top,
                      width: toastLayout.width,
                      maxHeight: toastLayout.height,
                    },
                  },
                  h('div', { ref: toastContent }, t(waterNotice.key)),
                ),
              petFloating &&
                h(
                  'div',
                  {
                    ref: petPanel,
                    className: 'owc-pet-panel owc-pet-workspace',
                    'data-pet-panel': petShowing ? 'open' : 'bubble',
                    'data-pet-screen': ui.screen || 'reminder',
                    'data-side': floatingPanel.side,
                    role: 'region',
                    'aria-label': t(petPageTitle[ui.screen] || 'waterTitle'),
                    style: {
                      left: floatingPanel.left,
                      top: floatingPanel.top,
                      width: floatingPanel.width,
                      height: floatingPanel.height,
                      maxHeight: floatingPanel.maxHeight,
                    },
                  },
                  h('div', { className: 'owc-glass', 'aria-hidden': true }),
                  petShowing
                    ? petHeader()
                    : h(
                        'div',
                        { className: 'owc-head' },
                        h('strong', { style: { flex: 1, fontSize: 12 } }, t('waterTitle')),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'owc-icon',
                            'aria-label': t('waterSnooze'),
                            disabled: waterBusy,
                            onClick: () =>
                              waterAction({ type: 'snooze', eventId: waterState.eventId }),
                          },
                          iconSvg('close', 14),
                        ),
                      ),
                  h(
                    'div',
                    { className: 'owc-pet-scroll' },
                    h(
                      'div',
                      { ref: cardContent, className: 'owc-pet-natural' },
                      petShowing
                        ? h(
                            React.Fragment,
                            null,
                            ui.pending
                              ? draftGuard()
                              : waterEditing
                                ? waterSettings()
                                : editing
                                  ? editor()
                                  : petDetails
                                    ? panelBody('clock')
                                    : ui.screen === 'earnings'
                                      ? panelBody('earnings')
                                      : petHome(),
                            notices(),
                          )
                        : waterReminder(),
                    ),
                  ),
                ),
            );

          return h(
            'section',
            {
              ref: box,
              className:
                'owc-v2' +
                (collapsed ? ' owc-compact' : '') +
                (collapsed && waterQuickOpen ? ' owc-quick' : '') +
                (editing || waterEditing ? ' owc-editing' : ''),
              'aria-label': t('title'),
              'data-version': '1.0.1',
              'data-status': safeState?.status || 'setup',
              style: cardStyle,
              onPointerDown: dragDown,
              onPointerMove: dragMove,
              onPointerUp: dragEnd,
              onPointerCancel: dragEnd,
              onLostPointerCapture: dragEnd,
              onContextMenuCapture: openAppearanceContext,
              onKeyDown: (event) => {
                if (
                  appearanceShortcut(event) ||
                  event.key !== 'Escape' ||
                  event.defaultPrevented ||
                  busy ||
                  waterBusy
                )
                  return;
                event.preventDefault();
                if (ui.pending) dispatchUI({ type: 'stay' });
                else if (editing || waterEditing) navigateScreen(ui.back);
                else if (waterQuickOpen) closeWaterQuick();
                else setPreference({ mini: true });
              },
            },
            h('style', null, STYLE),
            h('div', { className: 'owc-glass', 'aria-hidden': 'true' }),
            h(
              'div',
              { className: 'owc-content' },
              h(
                'span',
                { className: 'owc-sr-only', role: 'status', 'aria-atomic': true },
                h(
                  'span',
                  {
                    key: waterPrompt
                      ? waterState.eventId
                      : (waterNotice?.token ?? waterNotice?.key ?? 'idle'),
                  },
                  waterPrompt ? t('waterDue') : waterNotice ? t(waterNotice.key) : '',
                ),
              ),
              collapsed
                ? h(
                    React.Fragment,
                    null,
                    strip(),
                    waterQuickOpen && waterOverview(true),
                    !waterQuickOpen &&
                      waterNotice &&
                      (!view.companion || companion.announce) &&
                      h('p', { className: 'owc-mini-feedback' }, t(waterNotice.key)),
                  )
                : h(
                    React.Fragment,
                    null,
                    panelHead(),
                    !editing && !waterEditing && companionCard(),
                    ui.pending
                      ? draftGuard()
                      : waterEditing
                        ? waterSettings()
                        : editing
                          ? editor()
                          : panelBody(),
                    notices(),
                    !editing && !waterEditing && waterOverview(),
                  ),
              !collapsed && waterReminder(),
            ),
          );
        }

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'offwork-clock',
              order: 900,
              label: () => ctx.locale.bind('offwork-clock')('title'),
            },
            Clock,
          ),
        );
      },
    };
  },
});
