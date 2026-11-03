import { encode } from "modern-gif";

export const maxTextCharacters = 9;
export const motionFrameDelays = { 0.5: 120, 1: 60, 1.5: 40, 2: 30 } as const;

export const fonts: readonly string[] = ["Black Han Sans", "Jua", "Noto Sans KR"];
export const motions = {
  none: "없음",
  scale: "두근두근",
  bounce: "통통",
  slide: "슬라이드",
  shake: "흔들흔들",
  roll: "빙글빙글",
  orbit: "둥실둥실",
  swing: "갸우뚱",
  jelly: "말랑말랑",
};
export type ImageLayer = {
  id: string;
  name: string;
  source: HTMLCanvasElement;
  aspectRatio: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  behindText: boolean;
  fit: "contain" | "cover";
};
export type Settings = {
  text: string;
  images?: ImageLayer[];
  textLayout?: { x: number; y: number; scale: number };
  font: string;
  color: string;
  gradient?: { end: string; direction: "horizontal" | "vertical" };
  characterColors?: Record<number, string>;
  background: string;
  transparent: boolean;
  motion: keyof typeof motions;
  speed: keyof typeof motionFrameDelays;
  delay: number;
};
export const initialSettings: Settings = {
  text: "최고야!",
  font: "Black Han Sans",
  color: "#7555e8",
  background: "#ffffff",
  transparent: true,
  motion: "bounce",
  speed: 1,
  delay: 0,
};

export function textCharacters(text: string): string[] {
  return Array.from(
    new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(text),
    (part) => part.segment,
  );
}

export function constrainText(text: string): string {
  return textCharacters(text.replace(/\r\n?/g, "\n").split("\n").slice(0, 3).join("\n"))
    .slice(0, maxTextCharacters)
    .join("");
}

export function validateText(text: string): string | null {
  if (!text.trim()) return "이모지에 넣을 텍스트를 입력해 주세요.";
  if (textCharacters(text).length > maxTextCharacters)
    return `텍스트는 ${maxTextCharacters}자까지 입력할 수 있어요.`;
  if (text.split("\n").length > 3) return "줄은 3개까지 사용할 수 있어요.";
  return null;
}

export function measureEmojiText(ctx: CanvasRenderingContext2D, settings: Settings) {
  const lines = settings.text.split("\n");
  ctx.font = `100px "${settings.font}"`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let characterIndex = 0;
  const runs = lines.map((line) => {
    let advance = 0;
    const characters = textCharacters(line).map((character) => {
      const metric = ctx.measureText(character);
      const run = {
        character,
        metric,
        x: advance,
        color: settings.characterColors?.[characterIndex] ?? settings.color,
      };
      advance += metric.width;
      characterIndex += 1;
      return run;
    });
    characterIndex += 1;
    return characters;
  });
  const metrics = lines.map((line, index) =>
    settings.characterColors && !settings.gradient && runs[index].length
      ? {
          actualBoundingBoxLeft: -Math.min(
            ...runs[index].map((run) => run.x - run.metric.actualBoundingBoxLeft),
          ),
          actualBoundingBoxRight: Math.max(
            ...runs[index].map((run) => run.x + run.metric.actualBoundingBoxRight),
          ),
          actualBoundingBoxAscent: Math.max(
            ...runs[index].map((run) => run.metric.actualBoundingBoxAscent),
          ),
          actualBoundingBoxDescent: Math.max(
            ...runs[index].map((run) => run.metric.actualBoundingBoxDescent),
          ),
        }
      : ctx.measureText(line),
  );
  const width = Math.max(
    1,
    ...metrics.map((metric) => metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight),
  );
  const top = Math.min(
    ...metrics.map((metric, index) => index * 105 - metric.actualBoundingBoxAscent),
  );
  const bottom = Math.max(
    ...metrics.map((metric, index) => index * 105 + metric.actualBoundingBoxDescent),
  );
  const height = Math.max(1, bottom - top);
  return { lines, runs, metrics, width, height, top, bottom };
}

function drawImages(ctx: CanvasRenderingContext2D, images: ImageLayer[], behindText: boolean) {
  for (const image of images) {
    if (image.behindText !== behindText) continue;
    ctx.save();
    ctx.translate(image.x, image.y);
    ctx.rotate((image.rotation * Math.PI) / 180);
    if (image.fit === "cover") {
      const width = Number(image.source.width);
      const height = Number(image.source.height);
      const side = Math.min(width, height);
      ctx.drawImage(
        image.source,
        (width - side) / 2,
        (height - side) / 2,
        side,
        side,
        -image.size / 2,
        -image.size / 2,
        image.size,
        image.size,
      );
    } else {
      const width = image.size * Math.min(1, image.aspectRatio);
      const height = image.size * Math.min(1, 1 / image.aspectRatio);
      ctx.drawImage(image.source, -width / 2, -height / 2, width, height);
    }
    ctx.restore();
  }
}

export function drawEmoji(ctx: CanvasRenderingContext2D, settings: Settings, progress: number) {
  ctx.clearRect(0, 0, 128, 128);
  if (!settings.transparent) {
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, 128, 128);
  }
  drawImages(ctx, settings.images ?? [], true);
  if (!settings.text.trim()) {
    drawImages(ctx, settings.images ?? [], false);
    return;
  }
  ctx.save();
  ctx.translate(settings.textLayout?.x ?? 64, settings.textLayout?.y ?? 64);
  ctx.scale(settings.textLayout?.scale ?? 1, settings.textLayout?.scale ?? 1);
  const phase = progress * Math.PI * 2;
  switch (settings.motion) {
    case "scale": {
      const scale = 0.85 + Math.sin(phase) * 0.12;
      ctx.scale(scale, scale);
      break;
    }
    case "bounce":
      ctx.translate(0, -Math.abs(Math.sin(phase)) * 12 + 6);
      break;
    case "slide":
      ctx.translate(Math.sin(phase) * 14, 0);
      break;
    case "shake":
      ctx.rotate(Math.sin(phase * 3) * 0.12);
      break;
    case "roll":
      ctx.rotate(phase);
      break;
    case "orbit":
      ctx.translate(Math.cos(phase) * 8, Math.sin(phase) * 8);
      break;
    case "swing":
      ctx.rotate(Math.sin(phase) * 0.25);
      break;
    case "jelly":
      ctx.scale(0.88 + Math.sin(phase) * 0.1, 0.88 - Math.sin(phase) * 0.1);
      break;
  }
  const { lines, runs, metrics, width, height, top, bottom } = measureEmojiText(ctx, settings);
  ctx.scale(Math.min(126 / width, 126 / height), Math.min(126 / width, 126 / height));
  if (settings.gradient) {
    const gradient = ctx.createLinearGradient(
      settings.gradient.direction === "horizontal" ? -width / 2 : 0,
      settings.gradient.direction === "vertical" ? -height / 2 : 0,
      settings.gradient.direction === "horizontal" ? width / 2 : 0,
      settings.gradient.direction === "vertical" ? height / 2 : 0,
    );
    gradient.addColorStop(0, settings.color);
    gradient.addColorStop(1, settings.gradient.end);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = settings.color;
  }
  lines.forEach((line, index) => {
    const x = (metrics[index].actualBoundingBoxLeft - metrics[index].actualBoundingBoxRight) / 2;
    const y = index * 105 - (top + bottom) / 2;
    if (settings.characterColors && !settings.gradient) {
      runs[index].forEach((run) => {
        ctx.fillStyle = run.color;
        ctx.fillText(run.character, x + run.x, y);
      });
    } else {
      ctx.fillText(line, x, y);
    }
  });
  ctx.restore();
  drawImages(ctx, settings.images ?? [], false);
}

export async function exportGif(ctx: CanvasRenderingContext2D, settings: Settings): Promise<Blob> {
  const error =
    settings.images?.length && !settings.text.trim() ? null : validateText(settings.text);
  if (error) throw new Error(error);
  const frames = [];
  const count = settings.motion === "none" ? 1 : 20;
  for (let index = 0; index < count; index += 1) {
    drawEmoji(ctx, settings, index / count);
    frames.push({
      data: ctx.getImageData(0, 0, 128, 128).data,
      delay:
        settings.motion === "none"
          ? 60
          : motionFrameDelays[settings.speed] + (index === 0 ? settings.delay : 0),
      disposal: 2 as const,
    });
  }
  const blob = await encode({
    width: 128,
    height: 128,
    frames,
    looped: true,
    loopCount: 0,
    format: "blob",
  });
  if (blob.size > 128 * 1024)
    throw new Error("파일이 128KB를 넘었어요. 텍스트·이미지를 줄이거나 모션을 바꿔 주세요.");
  return blob;
}
