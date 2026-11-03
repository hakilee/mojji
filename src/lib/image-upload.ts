import type { ImageLayer } from "~/lib/emoji";

export async function loadImage(file: File): Promise<ImageLayer> {
  if (!/^image\/(?:png|jpeg|webp|gif)$/.test(file.type))
    throw new Error("PNG, JPG, WebP, GIF 파일을 선택해 주세요.");
  if (file.size > 5 * 1024 * 1024) throw new Error("이미지는 5MB까지 올릴 수 있어요.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("이미지를 읽지 못했어요. 다른 파일을 선택해 주세요.");
  }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width > 4096 || bitmap.height > 4096)
      throw new Error("이미지 가로·세로는 4096px 이하여야 해요.");
    const source = document.createElement("canvas");
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    source.width = Math.max(1, Math.round(bitmap.width * scale));
    source.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = source.getContext("2d");
    if (!ctx) throw new Error("이 브라우저에서 이미지를 불러올 수 없어요.");
    ctx.drawImage(bitmap, 0, 0, source.width, source.height);
    return {
      type: "image",
      id: crypto.randomUUID(),
      name: file.name,
      source,
      aspectRatio: bitmap.width / bitmap.height,
      x: 64,
      y: 32,
      size: 48,
      rotation: 0,
      fit: "contain",
    };
  } finally {
    bitmap.close();
  }
}
