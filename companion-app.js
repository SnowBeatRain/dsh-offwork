export const COMPANION_APP_STYLE = `
.owc-extra{padding:0 16px 12px;font:inherit;color:inherit;cursor:default;user-select:text;touch-action:pan-y}
.owc-appearance .owc-extra{padding:0}.owc-extra *{box-sizing:border-box}.owc-extra h3{font-size:12px;font-weight:600;margin:14px 0 8px}.owc-extra p{margin:8px 0;line-height:1.65}.owc-extra .hub-muted,.owc-extra small{font-size:11px;opacity:.72}.owc-extra small{display:block}.owc-extra .hub-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:9px 0}.owc-extra label{display:block;margin:10px 0}.owc-extra input:not([type=checkbox]),.owc-extra select,.owc-extra textarea{width:100%;padding:7px 9px;border:1px solid color-mix(in srgb,var(--owc-accent) 20%,transparent);border-radius:8px;background:var(--dsw-alias-bg-base,#f7f8fb);color:inherit;font:inherit}.owc-extra input[type=checkbox]{margin-right:8px}.owc-extra textarea{min-height:64px;resize:vertical}.owc-extra article{padding:10px 0;border-top:1px solid color-mix(in srgb,var(--owc-accent) 15%,transparent)}.owc-extra output{font-variant-numeric:tabular-nums}.owc-extra button{min-height:32px;padding:5px 10px;border-radius:8px}.owc-extra button[data-primary=true]{background:var(--owc-accent);color:white}.owc-extra details{margin:8px 0}.owc-extra summary{font-size:11px;cursor:pointer}.owc-extra .hub-error{color:#bd465a}.owc-extra .hub-preview{display:block;width:144px;height:192px;object-fit:contain;margin:8px auto;background:repeating-conic-gradient(#ddd 0% 25%,#f7f7f7 0% 50%) 50%/16px 16px;border-radius:10px}.owc-extra-feedback:empty{display:none}.owc-extra-feedback p{font-size:11px}.owc-extra [data-wrap-entry]{width:100%;text-align:left}.owc-wrap-entry{padding-top:12px;border-top:1px solid color-mix(in srgb,var(--owc-accent) 15%,transparent)}
.owc-v2 button.owc-pet-clock,.owc-v2 button.owc-pet-timer-row{cursor:pointer;color:inherit;min-height:28px;padding:4px 7px;border:0;border-radius:0;background:transparent}.owc-v2 button.owc-pet-clock{width:100%;justify-content:center}.owc-v2 button.owc-pet-timer-row:hover,.owc-v2 button.owc-pet-clock:hover{background:color-mix(in srgb,var(--owc-accent) 9%,transparent)}.owc-quick-actions{display:flex;gap:4px;align-items:center;padding:4px 6px;border-top:1px solid color-mix(in srgb,var(--owc-accent) 12%,transparent)}.owc-v2 .owc-quick-actions button{min-height:28px;padding:3px 7px;font-size:11px;background:transparent;border:0;display:flex;align-items:center;justify-content:center;gap:5px}.owc-quick-actions button:first-child{flex:1}.owc-quick-actions .owc-quick-more{font-size:18px;min-width:30px}.owc-v2 .owc-quick-actions button:hover{background:color-mix(in srgb,var(--owc-accent) 10%,transparent)}.owc-v2 .owc-quick-actions button:focus-visible,.owc-v2 button.owc-pet-timer-row:focus-visible,.owc-v2 button.owc-pet-clock:focus-visible{outline:2px solid var(--owc-accent);outline-offset:-2px}.owc-extra label.owc-check{display:flex;align-items:center;gap:8px;flex:1}.owc-extra .hub-row>.owc-check{margin:0}.owc-extra button.owc-link-row{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 0;border:0;border-bottom:1px solid color-mix(in srgb,var(--owc-accent) 12%,transparent);border-radius:0;background:transparent;text-align:left}.owc-extra button.owc-link-row>span:last-child{opacity:.5;font-size:16px}.owc-extra button.owc-secondary{background:transparent;border:1px solid color-mix(in srgb,var(--owc-accent) 25%,transparent);padding:5px 10px}.owc-v2 .owc-quick-actions .owc-quick-more:only-child{flex:none;margin-left:auto;min-height:24px;padding:0 6px;font-size:16px}.owc-extra details>summary{font-weight:500}.owc-extra .owc-setting-links{margin:4px 0 12px}.owc-extra .owc-appearance-colors,.owc-extra .owc-appearance-custom{border-top:1px solid color-mix(in srgb,var(--owc-accent) 12%,transparent);padding-top:10px;margin-top:12px}.owc-v2 button.owc-inline-timer{width:100%;display:flex;align-items:center;gap:5px;min-height:28px;background:transparent;border:0;border-top:1px solid color-mix(in srgb,var(--owc-accent) 12%,transparent);border-radius:0;padding:4px 8px;font-size:11px}.owc-inline-timer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:left}.owc-inline-timer strong{font-variant-numeric:tabular-nums}.owc-v2 button.owc-classic-mini-time{padding:0;min-height:24px;border:0;background:transparent;font:inherit;font-weight:600;cursor:pointer}.owc-v2 button.owc-classic-mini-time:hover{color:var(--owc-accent)}@media(pointer:coarse){.owc-v2 .owc-quick-actions button,.owc-v2 button.owc-pet-clock,.owc-v2 button.owc-pet-timer-row{min-height:40px}}
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
  const screen = input.screen;
  const [busy, setBusy] = useState(false);
  const [appearanceDraft, setAppearanceDraft] = useState(null);
  const appearanceBase = useRef(null);
  const [addingTimer, setAddingTimer] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const [agentAccess, setAgentAccess] = useState(false);
  const [backup, setBackup] = useState(null),
    [restoreBefore, setRestoreBefore] = useState(null);
  const [photo, setPhoto] = useState(null),
    [crop, setCrop] = useState({ zoom: 1, x: 50, y: 50 }),
    [photoPreview, setPhotoPreview] = useState('');
  const [notes, setNotes] = useState(null),
    [dirty, setDirty] = useState(false);
  const [testReminder, setTestReminder] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const latest = useRef(input);
  latest.current = input;
  const current = useRef(state);
  current.current = state;
  const runtime = useRef(null),
    owner = useRef(null),
    audio = useRef(null);
  const lastInput = useRef(0),
    alive = useRef(true);
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
  const showAlert = !!(active && !screen && !input.menuOpen && !document.hidden && !input.editing);

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
  function setScreen(next) {
    latest.current.navigate(
      next === 'settings' ? 'preferences' : next === 'timers' ? 'smoking' : next,
    );
  }
  function open(next, event) {
    latest.current.navigate(
      next === 'settings' ? 'preferences' : next === 'timers' ? 'smoking' : next,
      event,
    );
  }
  function close() {
    latest.current.navigate(null);
  }
  function discardDrafts() {
    setNotes(null);
    setDirty(false);
    setPhoto(null);
    setPhotoPreview('');
    setAppearanceDraft(null);
    appearanceBase.current = null;
    setBackup(null);
    setNotice('');
    setError('');
  }
  function beginAppearance() {
    const p = current.current.preferences;
    const next = {
      theme: p.theme,
      cardScale: p.cardScale,
      customEnabled: p.customEnabled,
      image: p.image,
    };
    appearanceBase.current = next;
    setAppearanceDraft(next);
    setPhoto(null);
    setError('');
  }
  function changeAppearance(patch) {
    setAppearanceDraft((p) => ({ ...p, ...patch }));
  }
  async function applyAppearance() {
    if (!appearanceDraft || busy) return false;
    const patch = changedSettings(
      appearanceBase.current || current.current.preferences,
      appearanceDraft,
    );
    if (photo) {
      if (!photoPreview) return false;
      patch.image = photoPreview;
      patch.customEnabled = true;
    }
    const saved = await act({ type: 'preferences', patch });
    if (saved) {
      setPhoto(null);
      setAppearanceDraft(null);
      appearanceBase.current = null;
    }
    return !!saved;
  }
  useEffect(() => {
    if (screen === 'preferences')
      void execute(async () => {
        const r = await settingsCall('get');
        setAgentAccess(r.agentAccess);
      });
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
      { className: 'owc-check' },
      h('input', {
        type: 'checkbox',
        checked,
        disabled: busy,
        onChange: (e) => onChange(e.target.checked),
      }),
      label,
    );
  const prefs = (patch) => act({ type: 'preferences', patch });
  const reminderCard = (e, compact = false) =>
    h(
      'article',
      { key: e.id, 'data-reminder-kind': e.kind },
      !compact && h('strong', null, e.label),
      h(
        'p',
        { className: 'hub-muted' },
        e.kind === 'wrap'
          ? text('留下一件明天要做的事，再结束今天。', 'Leave one next step for tomorrow.')
          : e.kind === 'water'
            ? text('喝点水，再继续。', 'Time for some water.')
            : text('计时已结束。', 'Time is up.'),
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
      state.timers.length > 0 && h('h3', null, text('其他计时', 'Other timers')),
      state.timers.map((timer) => {
        const view = countdownView(timer.clock, now);
        const snoozedUntil =
          state.deliveries['timer:' + timer.id + ':' + timer.clock.deadline]?.snoozeUntil || 0;
        return h(
          'article',
          { key: timer.id },
          h('strong', null, timer.name),
          ' · ',
          h(
            'output',
            null,
            view.phase === 'idle'
              ? timer.clock.minutes + text('分钟 · 未开始', ' min · Not started')
              : view.phase === 'due' && snoozedUntil > now
                ? text('稍后 ', 'Snoozed ') + formatDuration(Math.ceil((snoozedUntil - now) / 1000))
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
            h(
              'details',
              null,
              h('summary', null, text('更多', 'More')),
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
          ),
        );
      }),
      !addingTimer &&
        button(text('＋ 添加其他计时', '+ Add another timer'), () => setAddingTimer(true)),
      addingTimer &&
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
              if (result) {
                form.reset();
                setAddingTimer(false);
              }
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
          button(text('取消', 'Cancel'), () => setAddingTimer(false)),
        ),
    );
  }
  function wrapDraft() {
    const date = input.shift?.shiftDate || new Date(now).toISOString().slice(0, 10);
    return notes?.date === date
      ? notes
      : {
          date,
          done: state.journal[date]?.done || '',
          next: state.journal[date]?.next || '',
          base: state.journal[date]?.updatedAt || 0,
        };
  }
  async function saveNotes(end = false) {
    return execute(async () => {
      const entry = wrapDraft();
      const result = await runtime.current.update({ type: 'journal', ...entry, end });
      setNotes({ ...entry, base: result.journal[entry.date].updatedAt });
      setDirty(false);
      setNotice(
        end
          ? text('今天收尾了，明天接着来。', 'All set for tomorrow.')
          : text('草稿已保存', 'Draft saved'),
      );
      if (end) latest.current.react?.();
      return result;
    });
  }
  function wrapPanel() {
    const entry = wrapDraft(),
      date = entry.date;
    const summary = companionDaySummary(state, date, input.timezone || 'UTC');
    const previous = Object.entries(state.journal)
      .filter(([key]) => key < date)
      .sort(([a], [b]) => b.localeCompare(a))[0];
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
          `今天喝水 ${summary.water} 次 · 计时完成 ${summary.timers} 次`,
          `Today: ${summary.water} drinks · ${summary.timers} timer acknowledgements`,
        ),
      ),
      h(
        'div',
        { className: 'hub-row' },
        button(text('保存草稿', 'Save draft'), () => saveNotes(false)),
        button(
          state.journal[date]?.endedAt
            ? text('更新收尾', 'Update wrap-up')
            : text('结束今天', 'End today'),
          () => saveNotes(true),
          true,
        ),
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
    const nav = (label, target) =>
      button(
        h(React.Fragment, null, h('span', null, label), h('span', { 'aria-hidden': true }, '›')),
        (e) => open(target, e),
        false,
        { className: 'owc-link-row' },
      );
    const permission = window.Notification?.permission;
    return h(
      React.Fragment,
      null,
      h(
        'div',
        { className: 'owc-setting-links' },
        nav(text('作息与薪资', 'Schedule and salary'), 'schedule'),
        nav(text('喝水间隔', 'Water interval'), 'water'),
        nav(text('备份与恢复', 'Backup and restore'), 'data'),
      ),
      h('h3', null, text('提醒', 'Reminders')),
      h(
        'div',
        { className: 'hub-row' },
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
            const result = await Notification.requestPermission();
            if (result !== 'granted')
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
      p.notifications &&
        permission === 'denied' &&
        h(
          'small',
          null,
          text(
            '浏览器已阻止通知，请在网站设置中重新允许。',
            'Notifications are blocked; allow them in site settings.',
          ),
        ),
      p.quietUntil > now
        ? h(
            'div',
            { className: 'hub-row' },
            h(
              'output',
              null,
              text('免打扰 ', 'Quiet ') + formatDuration(Math.ceil((p.quietUntil - now) / 1000)),
            ),
            button(text('结束免打扰', 'End quiet mode'), () => prefs({ quietUntil: 0 })),
          )
        : button(
            text('全部免打扰30分钟', 'Quiet for 30m'),
            () => prefs({ quietUntil: Date.now() + 1800000 }),
            false,
            { className: 'owc-secondary' },
          ),
      check(text('下班前提醒收尾', 'Remind me to wrap up'), p.wrapEnabled, (value) =>
        prefs({ wrapEnabled: value }),
      ),
      p.wrapEnabled &&
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
      h(
        'details',
        null,
        h('summary', null, text('高级设置', 'Advanced settings')),
        button(text('测试页面提示', 'Test in-page reminder'), () => {
          setTestReminder(true);
          setScreen(null);
        }),
        check(
          text(
            '输入时暂缓休息与收尾提示（最多2分钟）',
            'Defer rest/wrap-up while typing (up to 2 min)',
          ),
          p.deferTyping,
          (value) => prefs({ deferTyping: value }),
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
              h('option', { key: id, value: id }, input.sessionTitles?.[id] || id.slice(0, 24)),
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
            '默认关闭。开启后，工具返回的数据可能进入会话记录。',
            'Off by default. Tool results may enter conversation history.',
          ),
        ),
      ),
    );
  }
  function appearancePanel() {
    const p = appearanceDraft || state.preferences;
    return h(
      React.Fragment,
      null,
      h(
        'details',
        { className: 'owc-appearance-colors' },
        h('summary', null, text('配色与卡片', 'Color and card size')),
        h(
          'label',
          null,
          text('主题色', 'Accent theme'),
          h(
            'select',
            {
              'aria-label': text('主题色', 'Accent theme'),
              value: p.theme,
              onChange: (e) => changeAppearance({ theme: e.target.value }),
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
              onChange: (e) => changeAppearance({ cardScale: Number(e.target.value) }),
            },
            [0.9, 1, 1.1, 1.2].map((v) =>
              h('option', { key: v, value: v }, Math.round(v * 100) + '%'),
            ),
          ),
        ),
      ),
      h(
        'details',
        { className: 'owc-appearance-custom', open: photo ? true : undefined },
        h('summary', null, text('自定义人物', 'Custom character')),
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
                latest.current.enableCharacter?.();
              });
            },
          }),
        ),
        photo &&
          photoPreview &&
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
              button(text('取消预览', 'Cancel preview'), () => setPhoto(null)),
            ),
          ),
        p.image &&
          check(text('使用自定义人物', 'Use custom character'), p.customEnabled, (v) =>
            changeAppearance({ customEnabled: v }),
          ),
      ),
      button(text('恢复内置外观和默认主题', 'Restore built-in appearance and theme'), () =>
        changeAppearance({ customEnabled: false, theme: 'host', cardScale: 1 }),
      ),
      h(
        'small',
        null,
        text(
          '调整后点击下方“应用外观”。取消会保留原来的形象和配色。',
          'Choose Apply appearance below to save. Cancel keeps your previous image and colors.',
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
  function render(page) {
    if (!ready)
      return h(
        'div',
        { className: 'owc-extra' },
        feedback(),
        h('p', null, text('读取中…', 'Loading…')),
      );
    let content;
    if (page === 'timers') content = timerPanel();
    else if (page === 'wrap') content = wrapPanel();
    else if (page === 'settings') content = settingsPanel();
    else if (page === 'appearance') content = appearancePanel();
    else if (page === 'data') content = dataPanel();
    else if (page === 'alert') content = active && reminderCard(active, true);
    else if (page === 'wrap-entry') {
      const entry = wrapDraft();
      content = h(
        'div',
        { className: 'owc-wrap-entry' },
        button(
          state.journal[entry.date]?.endedAt
            ? text('查看今日收尾', 'View today’s wrap-up')
            : input.shift?.status === 'done'
              ? text('收尾今天', 'Wrap up today')
              : text('记下明天第一件事', 'Leave a next step for tomorrow'),
          (e) => open('wrap', e),
          false,
          { 'data-wrap-entry': true },
        ),
      );
    } else if (page === 'reminders')
      content = h(
        React.Fragment,
        null,
        pending.length
          ? pending.map((e) => reminderCard(e))
          : h('p', null, text('目前没有待处理提醒', 'No pending reminders')),
        events
          .filter((e) => !pending.includes(e))
          .map((e) =>
            h(
              'article',
              { key: e.id },
              h('strong', null, e.label),
              button(text('查看计时', 'View timer'), (ev) =>
                open(e.kind === 'water' ? 'home' : e.kind === 'wrap' ? 'wrap' : 'smoking', ev),
              ),
            ),
          ),
      );
    return h('div', { className: 'owc-extra', 'data-companion-content': page }, content);
  }
  function feedback() {
    return h(
      'div',
      { className: 'owc-extra owc-extra-feedback' },
      error && h('p', { className: 'hub-error', role: 'alert' }, error),
      error && button(text('重试读取', 'Retry loading'), () => runtime.current?.retry()),
      notice && h('p', { role: 'status' }, notice),
    );
  }
  const appearanceDirty =
    !!photo ||
    !!(
      appearanceDraft &&
      appearanceBase.current &&
      JSON.stringify(appearanceDraft) !== JSON.stringify(appearanceBase.current)
    );
  const activeTimers = state.timers
    .filter((t) => ['running', 'paused'].includes(countdownView(t.clock, now).phase))
    .sort((a, b) => (a.clock.deadline || Infinity) - (b.clock.deadline || Infinity));
  const activeTimer = activeTimers[0]
    ? {
        name: activeTimers[0].name,
        ...countdownView(activeTimers[0].clock, now),
        count: activeTimers.length,
      }
    : null;
  return {
    state,
    ready,
    screen,
    render,
    feedback,
    busy,
    activeTimer,
    previewPreferences: appearanceDraft,
    dirty: dirty || appearanceDirty,
    discardDrafts,
    beginAppearance,
    applyAppearance,
    saveNotes,
    useBuiltin: () => {
      setPhoto(null);
      changeAppearance({ customEnabled: false });
    },
    previewImage:
      photoPreview ||
      ((appearanceDraft || state.preferences).customEnabled
        ? (appearanceDraft || state.preferences).image
        : null),
    hasCustom: !!(state.preferences.image || photo),
    selectCustom: () => changeAppearance({ customEnabled: true }),
    cropping: !!photo,
    alert: showAlert,
    alertTitle: active?.label,
    pendingCount: pending.length,
    dismissAlert: () => active && handleReminder(active, 'dismiss'),
    snoozeWater: () =>
      act({ type: 'snooze', id: 'water:' + hydrationView(input.water, now).eventId }),
    waterCanSnooze: !!state.deliveries['water:' + hydrationView(input.water, now).eventId],
    waterSnoozedUntil: input.waterReady
      ? state.deliveries['water:' + hydrationView(input.water, now).eventId]?.snoozeUntil || 0
      : 0,
    smokingSnoozedUntil: state.deliveries['smoking:' + input.smoking?.deadline]?.snoozeUntil || 0,
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
