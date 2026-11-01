import { createCanvas } from "@napi-rs/canvas";
import { decode, decodeFrames } from "modern-gif";
import { describe, expect, test } from "vitest";
import {
  drawEmoji,
  exportGif,
  initialSettings,
  motions,
  validateText,
} from "./emoji";

describe("emoji editor [E1 E2 E3 E4]", () => {
  test.each(["", "   ", "a".repeat(41), "a\nb\nc\nd"])(
    "rejects invalid text %j",
    async (text) => {
      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as CanvasRenderingContext2D;
      expect(validateText(text)).not.toBeNull();
      await expect(
        exportGif(ctx, { ...initialSettings, text }),
      ).rejects.toThrow();
    },
  );

  test("accepts Unicode characters and three lines", () => {
    expect(validateText("안녕\n반가워\n🎉".repeat(1))).toBeNull();
    expect(validateText("🎉".repeat(40))).toBeNull();
  });

  test.each(Object.keys(motions) as (keyof typeof motions)[])(
    "exports decodable %s GIF with dimensions, timing and transparent pixels",
    async (motion) => {
      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext(
        "2d",
      ) as unknown as CanvasRenderingContext2D;
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
      expect(
        frames[0].data.some((value, index) => index % 4 === 3 && value === 255),
      ).toBe(true);
      if (motion !== "none") expect(frames[0].data).not.toEqual(frames[3].data);
    },
  );

  test("uses selected opaque background and replaces earlier canvas contents", async () => {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(
      ctx,
      { ...initialSettings, transparent: false, background: "#ff0000" },
      0,
    );
    expect(Array.from(ctx.getImageData(0, 0, 1, 1).data)).toEqual([
      255, 0, 0, 255,
    ]);
    const blob = await exportGif(ctx, {
      ...initialSettings,
      text: "OK",
      transparent: false,
      background: "#00ff00",
      motion: "none",
    });
    expect(
      Array.from(decodeFrames(await blob.arrayBuffer())[0].data.slice(0, 4)),
    ).toEqual([0, 255, 0, 255]);
    drawEmoji(ctx, initialSettings, 0);
    expect(ctx.getImageData(0, 0, 1, 1).data[3]).toBe(0);
  });
});
