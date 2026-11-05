// Ephemeral UI navigation only. Business data stays in its existing stores.
export const PET_EDITOR_SCREENS = ['water', 'schedule', 'appearance'];
export const initialPetUI = { screen: null, back: null, menu: null, pending: null };
export function petUIReducer(state, action) {
  switch (action.type) {
    case 'menu':
      return { ...state, menu: action.position };
    case 'dismiss-menu':
      return { ...state, menu: null };
    case 'stay':
      return { ...state, pending: null };
    case 'navigate': {
      if (![null, 'home', 'income', 'earnings', ...PET_EDITOR_SCREENS].includes(action.screen))
        return state;
      if (state.screen === action.screen)
        return { ...state, back: action.root ? null : state.back, menu: null, pending: null };
      if (action.dirty && !action.discard)
        return {
          ...state,
          menu: null,
          pending: { screen: action.screen, ...(action.root ? { root: true } : {}) },
        };
      const back = action.root
        ? null
        : PET_EDITOR_SCREENS.includes(action.screen)
          ? PET_EDITOR_SCREENS.includes(state.screen)
            ? state.back
            : state.screen
          : state.back;
      return { screen: action.screen, back, menu: null, pending: null };
    }
    default:
      return state;
  }
}
export function appearanceValues(view) {
  return {
    companion: view.companion,
    companionMotion: view.companionMotion,
    petSize: view.petSize,
    petModel: view.petModel,
    opacity: view.opacity,
  };
}
export const PET_INTERACTION_MESSAGES = {
  zh: {
    petHome: '喝水',
    petWaterCard: '喝水',
    petCountdownCard: '下班倒计时',
    petEarningsCard: '收入',
    petWaterAlert: '喝水提醒已到，可从右键菜单打开喝水卡片',
    petPausedHint: '本班已暂停，可手动恢复。',
    petMenu: '宠物菜单',
    petBack: '返回',
    petCloseAll: '关闭面板',
    petWorkSettings: '作息与薪资',
    petWaterSettings: '提醒设置',
    petAppearance: '外观',
    petRecord: '喝了一杯',
    petQuiet30: '免打扰 30 分钟',
    petQuiet60: '免打扰 1 小时',
    petUnsaved: '有未保存的修改',
    petUnsavedHint: '保存后继续，或放弃这次修改。',
    petSaveContinue: '保存并继续',
    petDiscard: '放弃修改',
    petKeepEditing: '继续编辑',
    petApplyAppearance: '应用外观',
    petAppearanceHint: '大小和透明度可实时预览。应用后保存；取消会还原。',
    petQuietActive: '喝水提醒已静音',
    petHomeHint: '喝水、歇一会儿，都在这里。',
    petQuietHint: '按自然时间，到期自动恢复。',
    petResume: '恢复本班提醒',
    petDismissReminder: '稍后处理',
  },
  en: {
    petHome: 'Water',
    petWaterCard: 'Water',
    petCountdownCard: 'Shift countdown',
    petEarningsCard: 'Earnings',
    petWaterAlert: 'Water is due; open Water from the context menu',
    petPausedHint: 'Paused for this shift. Resume when ready.',
    petMenu: 'Pet menu',
    petBack: 'Back',
    petCloseAll: 'Close panel',
    petWorkSettings: 'Schedule and pay',
    petWaterSettings: 'Reminders',
    petAppearance: 'Appearance',
    petRecord: 'Had a glass',
    petQuiet30: 'Quiet for 30 minutes',
    petQuiet60: 'Quiet for 1 hour',
    petUnsaved: 'Unsaved changes',
    petUnsavedHint: 'Save to continue, or discard these changes.',
    petSaveContinue: 'Save and continue',
    petDiscard: 'Discard changes',
    petKeepEditing: 'Keep editing',
    petApplyAppearance: 'Apply appearance',
    petAppearanceHint:
      'Preview size and opacity now. Apply to save; Cancel restores the previous appearance.',
    petQuietActive: 'Water reminders are muted',
    petHomeHint: 'A drink or a little break, right here.',
    petQuietHint: 'Uses clock time and resumes automatically.',
    petResume: 'Resume reminders',
    petDismissReminder: 'Handle later',
  },
};
export const PET_INTERACTION_STYLE = `
.owc-pet-workspace .owc-glass{opacity:var(--owc-alpha)}
.owc-pet-water-card.owc-water-due{border-radius:14px}
.owc-pet-water-alert{display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:12px;cursor:default;position:fixed!important;width:140px;box-sizing:border-box;min-height:30px!important;border:1px solid var(--owc-accent)!important;background:var(--dsw-alias-bg-overlay)!important;box-shadow:0 4px 12px #18354b18;font-size:11px!important;z-index:2}
.owc-pet-panel.owc-pet-workspace{display:flex;flex-direction:column;overflow:hidden}
.owc-pet-workspace>.owc-head{position:relative;flex:none;min-height:46px;padding:8px 12px;box-sizing:border-box}
.owc-pet-workspace>.owc-pet-scroll{position:relative;min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;scrollbar-width:none}
.owc-pet-scroll::-webkit-scrollbar{display:none}
.owc-pet-scroll .owc-save{position:sticky;bottom:0;background:var(--dsw-alias-bg-overlay);padding:10px 0;margin-bottom:0;z-index:2}
.owc-pet-scroll .owc-appearance legend{display:none}
.owc-pet-home{padding:14px}
.owc-pet-home-clock{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:12px}
.owc-pet-home-clock strong{font-size:24px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}
.owc-pet-water-card{padding:12px;border:1px solid color-mix(in srgb,var(--owc-accent) 16%,transparent);border-radius:14px;background:color-mix(in srgb,var(--owc-accent) 4%,transparent)}
.owc-pet-water-card .owc-water-status{font-size:12px;font-variant-numeric:tabular-nums;height:34px;display:flex;align-items:center;overflow:hidden;margin:0 0 9px}
.owc-pet-water-row{display:flex;align-items:center;justify-content:space-between;font-size:11px;gap:10px}
.owc-pet-water-row .owc-primary{flex:1;min-height:40px}
.owc-pet-quiet-row{display:flex;gap:6px;margin-top:12px}
.owc-pet-quiet-row button{flex:1;border:1px solid color-mix(in srgb,var(--owc-accent) 18%,transparent);font-size:11px;min-height:34px}
.owc-pet-quiet-status{min-height:32px;display:flex;align-items:center;justify-content:space-between;font-size:10.5px;gap:5px;color:var(--dsw-alias-label-secondary)}
.owc-pet-feedback{height:32px;overflow:hidden;display:flex;align-items:center;margin:6px 0 4px;font-size:11px;line-height:1.5;color:var(--owc-accent)}
.owc-pet-home-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}
.owc-pet-home-links button{font-size:11px;min-height:32px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent)}
.owc-pet-context{position:fixed;z-index:3;padding:6px;border:1px solid color-mix(in srgb,var(--owc-accent) 18%,transparent);background:var(--dsw-alias-bg-overlay);border-radius:12px;box-shadow:0 10px 28px #132c4626;box-sizing:border-box;overflow:auto;cursor:default;touch-action:manipulation}
.owc-pet-context button{display:flex;width:100%;justify-content:flex-start;min-height:34px;font-size:12px;padding:7px 10px}
.owc-pet-context button:focus-visible{outline-offset:-2px}
.owc-pet-context hr{border:0;border-top:1px solid color-mix(in srgb,var(--owc-accent) 12%,transparent);margin:5px 3px}
.owc-pet-unsaved{padding:20px 16px;line-height:1.6}
.owc-pet-unsaved h3{font-size:15px;margin:0 0 8px}
.owc-pet-unsaved p{font-size:12px;color:var(--dsw-alias-label-secondary)}
.owc-pet-unsaved button{width:100%;margin-top:8px;min-height:36px}
.owc-pet-toast{position:fixed;width:208px;padding:9px 12px;box-sizing:border-box;border-radius:12px;background:var(--dsw-alias-bg-overlay);border:1px solid color-mix(in srgb,var(--owc-accent) 18%,transparent);font-size:11px;line-height:1.5;box-shadow:0 5px 16px #18354b18;pointer-events:none}
`;
