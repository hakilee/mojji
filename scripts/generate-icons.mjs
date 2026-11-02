import { readFile, writeFile } from "node:fs/promises";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const svg = await readFile(new URL("../public/logo.svg", import.meta.url), "utf8");
const source = await loadImage(Buffer.from(svg));
await writeFile(
  new URL("../public/favicon.svg", import.meta.url),
  svg
    .replace('viewBox="20 28 92 80"', 'viewBox="20 22 92 92"')
    .replace('width="920" height="800"', 'width="96" height="96"'),
);
for (const [filename, size, inset, opaque] of [
  ["favicon-16x16.png", 16, 0, false],
  ["favicon-32x32.png", 32, 0, false],
  ["favicon-96x96.png", 96, 0, false],
  ["apple-touch-icon.png", 180, 0.02, true],
  ["android-chrome-192x192.png", 192, 0.02, true],
  ["android-chrome-512x512.png", 512, 0.02, true],
  ["android-chrome-maskable-512x512.png", 512, 0.175, true],
]) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (opaque) {
    ctx.fillStyle = "#f5f4ed";
    ctx.fillRect(0, 0, size, size);
  }
  const width = size * (1 - inset * 2);
  const height = width * (source.height / source.width);
  ctx.drawImage(source, (size - width) / 2, (size - height) / 2, width, height);
  await writeFile(new URL(`../public/${filename}`, import.meta.url), canvas.toBuffer("image/png"));
}
