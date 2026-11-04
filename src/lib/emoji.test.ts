import { createCanvas } from "@napi-rs/canvas";
import { decode, decodeFrames } from "modern-gif";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import {
  constrainText,
  drawEmoji,
  exportGif,
  initialSettings,
  initialTextLayer,
  type ImageLayer,
  type Settings,
  motions,
  textCharacters,
  validateText,
} from "~/lib/emoji";

describe("emoji editor [E1 E2 E3 E4]", () => {
  test.each(["text", "image"] as const)(
    "recovers correct pixels after a failed %s paint [E2d]",
    (layer) => {
      const source = createCanvas(16, 16);
      source.getContext("2d").fillRect(0, 0, 16, 16);
      const settings: Settings = {
        ...initialSettings,
        layers: [
          { ...initialTextLayer },
          {
            type: "image",
            id: "image",
            name: "image",
            source: source as unknown as HTMLCanvasElement,
            aspectRatio: 1,
            x: 30,
            y: 40,
            size: 20,
            rotation: 25,
            fit: "contain",
          },
        ],
      };
      const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
      ctx.scale(1.1, 1.1);
      const transform = ctx.getTransform();
      const paint = layer === "text" ? vi.spyOn(ctx, "fillText") : vi.spyOn(ctx, "drawImage");
      onTestFinished(() => paint.mockRestore());
      paint.mockImplementationOnce(() => {
        throw new Error("paint unavailable");
      });

      expect(() => drawEmoji(ctx, settings, 0)).toThrow("paint unavailable");
      expect(ctx.getTransform()).toEqual(transform);
      drawEmoji(ctx, settings, 0);

      const expected = createCanvas(128, 128).getContext(
        "2d",
      ) as unknown as CanvasRenderingContext2D;
      expected.setTransform(transform);
      drawEmoji(expected, settings, 0);
      expect(ctx.getImageData(0, 0, 128, 128).data).toEqual(
        expected.getImageData(0, 0, 128, 128).data,
      );
    },
  );
  test.each(["", "   ", "a".repeat(41), "a\nb\nc\nd"])("rejects invalid text %j", async (text) => {
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    expect(validateText(text)).not.toBeNull();
    await expect(
      exportGif(ctx, { ...initialSettings, layers: [{ ...initialTextLayer, text }] }),
    ).rejects.toThrow();
  });

  test("reduces oversized image animation palettes without losing timing or frames", async () => {
    const source = createCanvas(128, 128);
    const sourceContext = source.getContext("2d");
    const pixels = sourceContext.createImageData(128, 128);
    let seed = 75;
    for (let index = 0; index < pixels.data.length; index += 4) {
      for (let channel = 0; channel < 3; channel += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        pixels.data[index + channel] = seed >>> 24;
      }
      pixels.data[index + 3] = 255;
    }
    sourceContext.putImageData(pixels, 0, 0);
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    const blob = await exportGif(ctx, {
      ...initialSettings,
      layers: [
        {
          type: "image",
          id: "noise",
          name: "noise",
          source: source as unknown as HTMLCanvasElement,
          aspectRatio: 1,
          x: 64,
          y: 64,
          size: 80,
          rotation: 0,
          fit: "contain",
        },
        { ...initialTextLayer, text: "Hi" },
      ],
    });
    expect(blob.size).toBeLessThanOrEqual(128 * 1024);
    const frames = decodeFrames(await blob.arrayBuffer());
    expect(frames).toHaveLength(20);
    expect(frames.every((frame) => frame.delay === 60)).toBe(true);
    expect(frames[0].data[3]).toBe(0);
  });

  test.each(Object.keys(motions) as (keyof typeof motions)[])(
    "animates image-only %s exports without changing layer placement",
    async (motion) => {
      const source = createCanvas(24, 12);
      const sourceContext = source.getContext("2d");
      sourceContext.fillStyle = "#ff0000";
      sourceContext.fillRect(0, 0, 24, 12);
      sourceContext.fillStyle = "#0000ff";
      sourceContext.fillRect(0, 0, 6, 12);
      const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
      const blob = await exportGif(ctx, {
        ...initialSettings,
        motion,
        layers: [
          { ...initialTextLayer, text: "" },
          {
            type: "image",
            id: "image",
            name: "image",
            source: source as unknown as HTMLCanvasElement,
            aspectRatio: 2,
            x: 64,
            y: 64,
            size: 48,
            rotation: 15,
            fit: "contain",
          },
        ],
      });
      const frames = decodeFrames(await blob.arrayBuffer());
      expect(frames).toHaveLength(motion === "none" ? 1 : 20);
      if (motion !== "none") expect(frames[0].data).not.toEqual(frames[3].data);
      expect(frames.every((frame) => frame.delay === 60)).toBe(true);
      expect(frames[0].data[3]).toBe(0);
    },
  );

  test("accepts Unicode characters and three lines", () => {
    expect(validateText("안녕\n반가워\n🎉".repeat(1))).toBeNull();
    expect(validateText("🎉".repeat(40))).toBeNull();
  });

  test.each(["👩🏽‍💻", "(╯°□°)╯︵ ┻━┻"])(
    "exports a complete inserted %s as an animated GIF [E5ak]",
    async (text) => {
      const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;

      const blob = await exportGif(ctx, {
        ...initialSettings,
        layers: [{ ...initialTextLayer, text, font: "Noto Sans KR" }],
      });
      const decoded = decode(await blob.arrayBuffer());
      const frames = decodeFrames(await blob.arrayBuffer());

      expect(decoded.width).toBe(128);
      expect(decoded.height).toBe(128);
      expect(frames).toHaveLength(20);
      expect(frames.every((frame) => frame.delay === 60)).toBe(true);
      expect(frames[0].data.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
      expect(blob.size).toBeLessThanOrEqual(128 * 1024);
    },
  );

  test.each(Object.keys(motions) as (keyof typeof motions)[])(
    "exports decodable %s GIF with dimensions, timing and transparent pixels",
    async (motion) => {
      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
      const blob = await exportGif(ctx, {
        ...initialSettings,
        motion,
        layers: [{ ...initialTextLayer, text: "YES" }],
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
      const settings = {
        ...initialSettings,
        speed,
        delay,
        layers: [{ ...initialTextLayer, text: "YES" }],
      };
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
          motion: "none",
          speed: 2,
          delay: 2000,
          layers: [{ ...initialTextLayer, text: "YES" }],
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
        motion: "none",
        layers: [{ ...initialTextLayer, text }],
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
    "uses a full-size base fit and permits animated edge overflow for %s",
    (motion) => {
      const canvas = createCanvas(256, 256);
      const ctx = canvas.getContext("2d");
      let overflowFrames = 0;
      for (const text of ["반가워요", "반가\n워요", "반\n가\n워"]) {
        const dimensions: { width: number; height: number }[] = [];
        for (const effect of ["none", motion] as const) {
          ctx.resetTransform();
          ctx.clearRect(0, 0, 256, 256);
          ctx.translate(64, 64);
          drawEmoji(
            ctx as unknown as CanvasRenderingContext2D,
            { ...initialSettings, motion: effect, layers: [{ ...initialTextLayer, text }] },
            0,
          );
          const pixels = ctx.getImageData(0, 0, 256, 256).data;
          const xs: number[] = [];
          const ys: number[] = [];
          for (let y = 0; y < 256; y += 1) {
            for (let x = 0; x < 256; x += 1) {
              if (pixels[(y * 256 + x) * 4 + 3]) {
                xs.push(x);
                ys.push(y);
              }
            }
          }
          dimensions.push({
            width: Math.max(...xs) - Math.min(...xs) + 1,
            height: Math.max(...ys) - Math.min(...ys) + 1,
          });
        }
        const factor = motion === "scale" ? 0.85 : motion === "jelly" ? 0.88 : 1;
        expect(Math.abs(dimensions[1].width - dimensions[0].width * factor)).toBeLessThanOrEqual(2);
        expect(Math.abs(dimensions[1].height - dimensions[0].height * factor)).toBeLessThanOrEqual(
          2,
        );
        for (let frame = 0; frame < 120; frame += 1) {
          ctx.resetTransform();
          ctx.clearRect(0, 0, 256, 256);
          ctx.translate(64, 64);
          drawEmoji(
            ctx as unknown as CanvasRenderingContext2D,
            {
              ...initialSettings,
              motion,
              layers: [
                { ...initialTextLayer, text, characterColors: { 0: "#ff0000", 2: "#00ff00" } },
              ],
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
          if (outside) overflowFrames += 1;
          expect(inside, `${motion} frame ${frame}`).toBeGreaterThan(0);
        }
      }
      if (["bounce", "slide", "shake", "roll", "orbit", "swing"].includes(motion))
        expect(overflowFrames).toBeGreaterThan(0);
      else expect(overflowFrames).toBe(0);
    },
  );

  test("constrains pasted text by grapheme and line count without splitting emoji", () => {
    expect(constrainText("👨‍👩‍👧‍👦".repeat(41))).toBe("👨‍👩‍👧‍👦".repeat(40));
    expect(validateText("👨‍👩‍👧‍👦".repeat(40))).toBeNull();
    expect(constrainText("가\r\n나\r다\n라")).toBe("가\n나\n다");
  });

  test.each(["horizontal", "vertical"] as const)(
    "exports %s gradient with multiple colors and transparency",
    async (direction) => {
      const canvas = createCanvas(128, 128);
      const blob = await exportGif(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, {
        ...initialSettings,
        motion: "none",
        layers: [
          {
            ...initialTextLayer,
            text: "HH",
            color: "#ff0000",
            gradient: { end: "#0000ff", direction },
          },
        ],
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
      motion: "none",
      layers: [
        {
          ...initialTextLayer,
          text: "AA\nA",
          color: "#0000ff",
          characterColors: { 0: "#ff0000", 3: "#00ff00" },
        },
      ],
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
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        transparent: false,
        background: "#ff0000",
        layers: [{ ...initialTextLayer }],
      },
      0,
    );
    expect(Array.from(ctx.getImageData(0, 0, 1, 1).data)).toEqual([255, 0, 0, 255]);
    const blob = await exportGif(ctx, {
      ...initialSettings,
      transparent: false,
      background: "#00ff00",
      motion: "none",
      layers: [{ ...initialTextLayer, text: "OK" }],
    });
    expect(Array.from(decodeFrames(await blob.arrayBuffer())[0].data.slice(0, 4))).toEqual([
      0, 255, 0, 255,
    ]);
    drawEmoji(ctx, initialSettings, 0);
    expect(ctx.getImageData(0, 0, 1, 1).data[3]).toBe(0);
  });

  test("exports image-only composition and respects front-to-back image ordering", async () => {
    const red = createCanvas(4, 2);
    red.getContext("2d").fillStyle = "#ff0000";
    red.getContext("2d").fillRect(0, 0, 4, 2);
    const blue = createCanvas(4, 2);
    blue.getContext("2d").fillStyle = "#0000ff";
    blue.getContext("2d").fillRect(0, 0, 4, 2);
    const first: ImageLayer = {
      type: "image",
      id: "red",
      name: "red.png",
      source: red as unknown as HTMLCanvasElement,
      aspectRatio: 2,
      x: 64,
      y: 64,
      size: 128,
      rotation: 0,
      fit: "cover",
    };
    const second: ImageLayer = {
      ...first,
      id: "blue",
      source: blue as unknown as HTMLCanvasElement,
      size: 32,
    };
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    const output = decodeFrames(
      await (
        await exportGif(ctx, {
          ...initialSettings,
          motion: "none",
          layers: [{ ...initialTextLayer, text: "" }, first, second],
        })
      ).arrayBuffer(),
    );
    expect(output).toHaveLength(1);
    expect(Array.from(output[0].data.slice(0, 4))).toEqual([255, 0, 0, 255]);
    expect(Array.from(output[0].data.slice((64 * 128 + 64) * 4, (64 * 128 + 64) * 4 + 4))).toEqual([
      0, 0, 255, 255,
    ]);
    drawEmoji(
      ctx,
      { ...initialSettings, layers: [{ ...second }, { ...initialTextLayer, text: "" }, first] },
      0,
    );
    expect(Array.from(ctx.getImageData(64, 64, 1, 1).data)).toEqual([255, 0, 0, 255]);
  });

  test("keeps image proportions, crops cover mode and rotates around the selected center", () => {
    const source = createCanvas(4, 2);
    source.getContext("2d").fillStyle = "#ff0000";
    source.getContext("2d").fillRect(0, 0, 4, 2);
    const image: ImageLayer = {
      type: "image",
      id: "image",
      name: "image.png",
      source: source as unknown as HTMLCanvasElement,
      aspectRatio: 2,
      x: 64,
      y: 64,
      size: 64,
      rotation: 0,
      fit: "contain",
    };
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(ctx, { ...initialSettings, layers: [{ ...initialTextLayer, text: "" }, image] }, 0);
    expect(ctx.getImageData(40, 40, 1, 1).data[3]).toBe(0);
    expect(ctx.getImageData(40, 56, 1, 1).data[3]).toBe(255);
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        layers: [
          { ...initialTextLayer, text: "" },
          { ...image, fit: "cover" },
        ],
      },
      0,
    );
    expect(ctx.getImageData(40, 40, 1, 1).data[3]).toBe(255);
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        layers: [
          { ...initialTextLayer, text: "" },
          { ...image, x: 80, y: 48, rotation: 90 },
        ],
      },
      0,
    );
    expect(ctx.getImageData(80, 24, 1, 1).data[3]).toBe(255);
    expect(ctx.getImageData(56, 48, 1, 1).data[3]).toBe(0);
  });

  test("draws text above or below images according to the shared layer order", () => {
    const source = createCanvas(128, 128);
    source.getContext("2d").fillStyle = "#ff0000";
    source.getContext("2d").fillRect(0, 0, 128, 128);
    const image: ImageLayer = {
      type: "image",
      id: "image",
      name: "image.png",
      source: source as unknown as HTMLCanvasElement,
      aspectRatio: 1,
      x: 64,
      y: 64,
      size: 128,
      rotation: 0,
      fit: "cover",
    };
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        motion: "none",
        layers: [image, { ...initialTextLayer, color: "#0000ff", text: "HH" }],
      },
      0,
    );
    expect(
      ctx
        .getImageData(0, 0, 128, 128)
        .data.some((value, index) => index % 4 === 2 && value === 255),
    ).toBe(true);
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        motion: "none",
        layers: [{ ...initialTextLayer, color: "#0000ff", text: "HH" }, { ...image }],
      },
      0,
    );
    expect(
      ctx.getImageData(0, 0, 128, 128).data.some((value, index) => index % 4 === 2 && value > 0),
    ).toBe(false);
  });

  test("exports independent text styles and placements while skipping blank layers [E5y]", async () => {
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    const blob = await exportGif(ctx, {
      ...initialSettings,
      motion: "none",
      layers: [
        { ...initialTextLayer, text: "HH", color: "#ff0000", x: 32, y: 32, scale: 0.35 },
        { ...initialTextLayer, id: "blank", text: "  \n" },
        {
          ...initialTextLayer,
          id: "second",
          text: "Hi",
          font: "Jua",
          color: "#0000ff",
          x: 96,
          y: 96,
          scale: 0.3,
        },
      ],
    });
    const [frame] = decodeFrames(await blob.arrayBuffer());
    let red = 0;
    let blue = 0;
    for (let y = 0; y < 128; y++)
      for (let x = 0; x < 128; x++) {
        const index = (y * 128 + x) * 4;
        if (frame.data[index + 3] !== 255) continue;
        if (frame.data[index] > 200 && frame.data[index + 2] < 50) {
          red++;
          expect(x).toBeLessThan(64);
          expect(y).toBeLessThan(64);
        }
        if (frame.data[index + 2] > 200 && frame.data[index] < 50) {
          blue++;
          expect(x).toBeGreaterThan(64);
          expect(y).toBeGreaterThan(64);
        }
      }
    expect(red).toBeGreaterThan(50);
    expect(blue).toBeGreaterThan(50);
    expect(frame.data[3]).toBe(0);
  });

  test("paints every text layer in order without leaking character colors [E5y]", () => {
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        motion: "none",
        layers: [
          { ...initialTextLayer, text: "HH", characterColors: { 0: "#ff0000" } },
          { ...initialTextLayer, id: "front", text: "HH", color: "#0000ff" },
        ],
      },
      0,
    );
    const pixels = ctx.getImageData(0, 0, 128, 128).data;
    expect(pixels.some((value, index) => index % 4 === 2 && value === 255)).toBe(true);
    expect(pixels.some((value, index) => index % 4 === 0 && value === 255)).toBe(false);
  });

  test("rejects documents with no visible layers [E5y]", async () => {
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    for (const layers of [
      [],
      [
        { ...initialTextLayer, text: "" },
        { ...initialTextLayer, id: "second", text: " \n " },
      ],
    ])
      await expect(exportGif(ctx, { ...initialSettings, layers })).rejects.toThrow(
        "텍스트나 이미지를 추가해 주세요.",
      );
  });

  test("positions and scales text without changing the default tight fit", () => {
    const ctx = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(
      ctx,
      {
        ...initialSettings,
        motion: "none",
        layers: [{ ...initialTextLayer, text: "HH", x: 32, y: 96, scale: 0.4 }],
      },
      0,
    );
    const pixels = ctx.getImageData(0, 0, 128, 128).data;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let y = 0; y < 128; y += 1)
      for (let x = 0; x < 128; x += 1)
        if (pixels[(y * 128 + x) * 4 + 3]) {
          xs.push(x);
          ys.push(y);
        }
    expect(Math.abs((Math.min(...xs) + Math.max(...xs)) / 2 - 32)).toBeLessThan(2);
    expect(Math.abs((Math.min(...ys) + Math.max(...ys)) / 2 - 96)).toBeLessThan(2);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(54);
  });
});
