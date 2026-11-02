import { readFile, writeFile } from "node:fs/promises";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const source = await loadImage(await readFile(new URL("../public/logo.svg", import.meta.url)));
for (const [filename, size, inset, opaque] of [
  ["favicon-16x16.png", 16, 0, false],
  ["favicon-32x32.png", 32, 0, false],
  ["apple-touch-icon.png", 180, 0.07, true],
  ["android-chrome-192x192.png", 192, 0.07, true],
  ["android-chrome-512x512.png", 512, 0.07, true],
  ["android-chrome-maskable-512x512.png", 512, 0.14, true],
]) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (opaque) {
    ctx.fillStyle = "#f5f4ed";
    ctx.fillRect(0, 0, size, size);
  }
  ctx.drawImage(source, size * inset, size * inset, size * (1 - inset * 2), size * (1 - inset * 2));
  await writeFile(new URL(`../public/${filename}`, import.meta.url), canvas.toBuffer("image/png"));
}
