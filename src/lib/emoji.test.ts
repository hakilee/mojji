import { createCanvas } from "@napi-rs/canvas";
import { decode, decodeFrames } from "modern-gif";
import { describe, expect, test } from "vitest";
import {
  constrainText,
  drawEmoji,
  exportGif,
  initialSettings,
  motions,
  textCharacters,
  validateText,
} from "~/lib/emoji";

describe("emoji editor [E1 E2 E3 E4]", () => {
  test.each(["", "   ", "a".repeat(10), "a\nb\nc\nd"])("rejects invalid text %j", async (text) => {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    expect(validateText(text)).not.toBeNull();
    await expect(exportGif(ctx, { ...initialSettings, text })).rejects.toThrow();
  });

  test("accepts Unicode characters and three lines", () => {
    expect(validateText("안녕\n반가워\n🎉".repeat(1))).toBeNull();
    expect(validateText("🎉".repeat(9))).toBeNull();
  });

  test.each(Object.keys(motions) as (keyof typeof motions)[])(
    "exports decodable %s GIF with dimensions, timing and transparent pixels",
    async (motion) => {
      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
      const blob = await exportGif(ctx, {
        ...initialSettings,
        text: "YES",
        motion,
      });
      const buffer = await blob.arrayBuffer();
      const gif = decode(buffer);
      const frames = decodeFrames(buffer);
      expect(gif.version).toBe("89a");
      expect([gif.width, gif.height]).toEqual([128, 128]);
      expect(frames).toHaveLength(motion === "none" ? 1 : 20);
      expect(gif.loopCount).toBe(0);
      expect(blob.size).toBeLessThanOrEqual(128 * 1024);
      expect(frames.every((frame) => frame.delay === 60)).toBe(true);
      expect(gif.frames.every((frame) => frame.disposal === 2)).toBe(true);
      expect(frames[0].data[3]).toBe(0);
      expect(frames[0].data.some((value, index) => index % 4 === 3 && value === 255)).toBe(true);
      if (motion !== "none") expect(frames[0].data).not.toEqual(frames[3].data);
    },
  );

  test.each([
    { speed: 0.5, delay: 0, frameDelay: 120 },
    { speed: 1, delay: 500, frameDelay: 60 },
    { speed: 1.5, delay: 1000, frameDelay: 40 },
    { speed: 2, delay: 2000, frameDelay: 30 },
  ] as const)(
    "exports $speed× with a $delay ms hold before each loop",
    async ({ speed, delay, frameDelay }) => {
      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
      const settings = { ...initialSettings, text: "YES", speed, delay };
      const gif = decodeFrames(await (await exportGif(ctx, settings)).arrayBuffer());
      const baseline = decodeFrames(
        await (await exportGif(ctx, { ...settings, speed: 1, delay: 0 })).arrayBuffer(),
      );
      expect(gif).toHaveLength(20);
      expect(gif[0].delay).toBe(frameDelay + delay);
      expect(gif.slice(1).every((frame) => frame.delay === frameDelay)).toBe(true);
      expect(gif.reduce((total, frame) => total + frame.delay, 0)).toBe(frameDelay * 20 + delay);
      expect(gif.map((frame) => frame.data)).toEqual(baseline.map((frame) => frame.data));
    },
  );

  test("ignores timing settings for static output", async () => {
    const canvas = createCanvas(128, 128);
    const gif = decodeFrames(
      await (
        await exportGif(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, {
          ...initialSettings,
          text: "YES",
          motion: "none",
          speed: 2,
          delay: 2000,
        })
      ).arrayBuffer(),
    );
    expect(gif).toHaveLength(1);
    expect(gif[0].delay).toBe(60);
  });

  test.each(["I", "YES", "안녕", "안녕\n반가워", "A\nB\nC"])(
    "fills the static GIF with centered visible text %j",
    async (text) => {
      const canvas = createCanvas(128, 128);
      const blob = await exportGif(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, {
        ...initialSettings,
        text,
        motion: "none",
      });
      const pixels = decodeFrames(await blob.arrayBuffer())[0].data;
      const xs: number[] = [];
      const ys: number[] = [];
      for (let y = 0; y < 128; y += 1) {
        for (let x = 0; x < 128; x += 1) {
          if (pixels[(y * 128 + x) * 4 + 3]) {
            xs.push(x);
            ys.push(y);
          }
        }
      }
      const left = Math.min(...xs);
      const right = Math.max(...xs);
      const top = Math.min(...ys);
      const bottom = Math.max(...ys);
      expect(Math.max(right - left + 1, bottom - top + 1)).toBeGreaterThanOrEqual(124);
      expect(Math.abs(left - (127 - right))).toBeLessThanOrEqual(2);
      expect(Math.abs(top - (127 - bottom))).toBeLessThanOrEqual(2);
    },
  );

  test.each(Object.keys(motions) as (keyof typeof motions)[])(
    "keeps 반가워요 inside the canvas throughout %s motion",
    (motion) => {
      const canvas = createCanvas(256, 256);
      const ctx = canvas.getContext("2d");
      for (let frame = 0; frame < 120; frame += 1) {
        ctx.resetTransform();
        ctx.clearRect(0, 0, 256, 256);
        ctx.translate(64, 64);
        drawEmoji(
          ctx as unknown as CanvasRenderingContext2D,
          {
            ...initialSettings,
            text: "반가워요",
            motion,
            characterColors: { 0: "#ff0000", 2: "#00ff00" },
          },
          frame / 120,
        );
        const pixels = ctx.getImageData(0, 0, 256, 256).data;
        let outside = 0;
        let inside = 0;
        for (let y = 0; y < 256; y += 1) {
          for (let x = 0; x < 256; x += 1) {
            if (pixels[(y * 256 + x) * 4 + 3]) {
              if (x < 64 || x >= 192 || y < 64 || y >= 192) outside += 1;
              else inside += 1;
            }
          }
        }
        expect(outside, `${motion} frame ${frame}`).toBe(0);
        expect(inside).toBeGreaterThan(0);
      }
    },
  );

  test("constrains pasted text by grapheme and line count without splitting emoji", () => {
    expect(constrainText("👨‍👩‍👧‍👦".repeat(10))).toBe("👨‍👩‍👧‍👦".repeat(9));
    expect(validateText("👨‍👩‍👧‍👦".repeat(9))).toBeNull();
    expect(constrainText("가\r\n나\r다\n라")).toBe("가\n나\n다");
  });

  test.each(["horizontal", "vertical"] as const)(
    "exports %s gradient with multiple colors and transparency",
    async (direction) => {
      const canvas = createCanvas(128, 128);
      const blob = await exportGif(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, {
        ...initialSettings,
        text: "HH",
        motion: "none",
        color: "#ff0000",
        gradient: { end: "#0000ff", direction },
      });
      const pixels = decodeFrames(await blob.arrayBuffer())[0].data;
      let red = 0;
      let blue = 0;
      const colors = new Set<string>();
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 255) {
          colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
          if (pixels[i] > pixels[i + 2] + 50) red += 1;
          if (pixels[i + 2] > pixels[i] + 50) blue += 1;
        }
      }
      expect(colors.size).toBeGreaterThan(10);
      expect(red).toBeGreaterThan(0);
      expect(blue).toBeGreaterThan(0);
      expect(pixels[3]).toBe(0);
    },
  );

  test("keeps combined characters together for color selection", () => {
    expect(textCharacters("가👨‍👩‍👧‍👦e\u0301\n나")).toEqual(["가", "👨‍👩‍👧‍👦", "e\u0301", "\n", "나"]);
  });

  test("exports individual colors across lines with foreground fallback", async () => {
    const canvas = createCanvas(128, 128);
    const blob = await exportGif(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, {
      ...initialSettings,
      text: "AA\nA",
      motion: "none",
      color: "#0000ff",
      characterColors: { 0: "#ff0000", 3: "#00ff00" },
    });
    const pixels = decodeFrames(await blob.arrayBuffer())[0].data;
    for (const color of [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ]) {
      expect(
        Array.from({ length: pixels.length / 4 }, (_, index) => index * 4).some(
          (offset) =>
            pixels[offset] === color[0] &&
            pixels[offset + 1] === color[1] &&
            pixels[offset + 2] === color[2] &&
            pixels[offset + 3] === 255,
        ),
      ).toBe(true);
    }
  });

  test("uses selected opaque background and replaces earlier canvas contents", async () => {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(ctx, { ...initialSettings, transparent: false, background: "#ff0000" }, 0);
    expect(Array.from(ctx.getImageData(0, 0, 1, 1).data)).toEqual([255, 0, 0, 255]);
    const blob = await exportGif(ctx, {
      ...initialSettings,
      text: "OK",
      transparent: false,
      background: "#00ff00",
      motion: "none",
    });
    expect(Array.from(decodeFrames(await blob.arrayBuffer())[0].data.slice(0, 4))).toEqual([
      0, 255, 0, 255,
    ]);
    drawEmoji(ctx, initialSettings, 0);
    expect(ctx.getImageData(0, 0, 1, 1).data[3]).toBe(0);
  });
});
