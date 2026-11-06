// Page-local presentation state. Never changes reminder deadlines or records.
export const initialPetReminder = Object.freeze({ eventId: null, armed: false, open: false });

export function nextPetReminder(state, { ready, eventId, phase, visible, available, ownsPrompt }) {
  let next;
  if (!ready || !visible || !eventId) next = initialPetReminder;
  else if (['countdown', 'break', 'quiet'].includes(phase))
    next = { eventId, armed: true, open: false };
  else if (phase !== 'due' || !available || state.eventId !== eventId)
    next = { eventId, armed: false, open: false };
  else if (state.open) next = { eventId, armed: false, open: !!ownsPrompt };
  else next = { eventId, armed: state.armed && !ownsPrompt, open: state.armed && !!ownsPrompt };
  return state.eventId === next.eventId && state.armed === next.armed && state.open === next.open
    ? state
    : next;
}

export function dismissPetReminder(state) {
  return state.open || state.armed ? { ...state, armed: false, open: false } : state;
}
