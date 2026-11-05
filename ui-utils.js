// Small pure helpers shared by the browser artifact and its tests.
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--:--';
  const n = Math.ceil(seconds);
  return [Math.floor(n / 3600), Math.floor((n % 3600) / 60), n % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export function clampPosition(position, viewport, size) {
  const width = Math.max(0, viewport.width),
    height = Math.max(0, viewport.height);
  const edge = Math.min(12, width / 2, height / 2);
  const left = viewport.left ?? 0,
    top = viewport.top ?? 0;
  const maxX = Math.max(left + edge, left + width - size.width - edge);
  const maxY = Math.max(top + edge, top + height - size.height - edge);
  return {
    x: Math.max(left + edge, Math.min(Number.isFinite(position?.x) ? position.x : maxX, maxX)),
    y: Math.max(top + edge, Math.min(Number.isFinite(position?.y) ? position.y : top + 88, maxY)),
  };
}

export function clampOpacity(value, fallback = 0.82) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0.3, number));
}

export function normalizeView(value) {
  return {
    mini: value?.mini !== false,
    masked: value?.masked !== false,
    companion: value?.companion !== false,
    companionMotion: value?.companionMotion !== false,
    petModel: ['whale-dress', 'whale-ornate', 'whale-actions', 'xiaoxie-original'].includes(
      value?.petModel,
    )
      ? value.petModel
      : 'whale-dress',
    petSize: Math.min(180, Math.max(80, Number.isFinite(value?.petSize) ? value.petSize : 132)),
    petPosition:
      Number.isFinite(value?.petPosition?.x) && Number.isFinite(value?.petPosition?.y)
        ? { x: value.petPosition.x, y: value.petPosition.y }
        : null,
    opacity: clampOpacity(value?.opacity),
    position:
      Number.isFinite(value?.position?.x) && Number.isFinite(value?.position?.y)
        ? { x: value.position.x, y: value.position.y }
        : null,
  };
}

export function decodeCommand(rpc) {
  if (!rpc || rpc.ok !== true) throw new Error(rpc?.error?.message || 'RPC unavailable');
  const result = rpc.value?.result;
  if (!result || typeof result.text !== 'string') throw new Error('Command unavailable');
  let data;
  try {
    data = JSON.parse(result.text);
  } catch {
    throw new Error('Invalid command response');
  }
  if (result.kind !== 'success' || data?.ok !== true)
    throw new Error(data?.error || 'Request failed');
  if (!data.settings || typeof data.settings !== 'object') throw new Error('Missing settings');
  return data;
}

export function changedSettings(original, draft) {
  return Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(original[key]),
    ),
  );
}
