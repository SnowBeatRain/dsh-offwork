// Browser-only image intake: rasterize before persistence so imported SVG/URLs
// never execute and backups contain a bounded, self-contained PNG.
export async function loadCompanionImage(file, scope = window) {
  if (
    !file ||
    !['image/png', 'image/webp', 'image/jpeg'].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error('请选择5MB以内的PNG、WebP或JPEG / Choose a PNG, WebP or JPEG under 5MB');
  const magic = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  const signature =
    file.type === 'image/png'
      ? magic.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => magic[i] === v)
      : file.type === 'image/webp'
        ? String.fromCharCode(...magic.slice(0, 4)) === 'RIFF' &&
          String.fromCharCode(...magic.slice(8, 12)) === 'WEBP'
        : magic[0] === 255 && magic[1] === 216 && magic[2] === 255;
  if (!signature) throw new Error('图片内容与格式不符 / Image signature does not match its format');
  if (file.type === 'image/png') {
    const header = new DataView(magic.buffer);
    if (header.getUint32(16) * header.getUint32(20) > 24e6)
      throw new Error('图片尺寸过大 / Image dimensions too large');
  }
  const url = scope.URL.createObjectURL(file);
  try {
    const image = new scope.Image();
    image.src = url;
    await image.decode();
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 24e6
    )
      throw new Error('图片尺寸过大 / Image dimensions too large');
    return image;
  } finally {
    scope.URL.revokeObjectURL(url);
  }
}
export function cropCompanionImage(image, { zoom = 1, x = 50, y = 50 } = {}, doc = document) {
  const canvas = doc.createElement('canvas');
  canvas.width = 384;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const base = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const scale = base * Math.max(1, Math.min(3, zoom));
  const width = image.naturalWidth * scale,
    height = image.naturalHeight * scale;
  ctx.drawImage(
    image,
    (-(width - canvas.width) * Math.max(0, Math.min(100, x))) / 100,
    (-(height - canvas.height) * Math.max(0, Math.min(100, y))) / 100,
    width,
    height,
  );
  const data = canvas.toDataURL('image/png');
  if (data.length > 1500000) throw new Error('图片过大，请缩小后重试 / Image is too large');
  return data;
}
