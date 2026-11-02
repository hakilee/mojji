import { encode } from "modern-gif";

export const fonts = {
  "Black Han Sans": "두껍게",
  Jua: "동글동글",
  "Noto Sans KR": "깔끔하게",
};
export const motions = {
  none: "없음",
  scale: "두근두근",
  bounce: "통통",
  slide: "슬라이드",
  shake: "흔들흔들",
  roll: "빙글빙글",
};
export type Settings = {
  text: string;
  font: keyof typeof fonts;
  color: string;
  characterColors?: Record<number, string>;
  background: string;
  transparent: boolean;
  motion: keyof typeof motions;
};
export const initialSettings: Settings = {
  text: "최고야!",
  font: "Black Han Sans",
  color: "#7555e8",
  background: "#ffffff",
  transparent: true,
  motion: "bounce",
};

export function textCharacters(text: string): string[] {
  return Array.from(
    new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(text),
    (part) => part.segment,
  );
}

export function validateText(text: string): string | null {
  if (!text.trim()) return "이모지에 넣을 텍스트를 입력해 주세요.";
  if (Array.from(text).length > 40) return "텍스트는 40자까지 입력할 수 있어요.";
  if (text.split("\n").length > 3) return "줄은 3개까지 사용할 수 있어요.";
  return null;
}

export function drawEmoji(ctx: CanvasRenderingContext2D, settings: Settings, progress: number) {
  ctx.clearRect(0, 0, 128, 128);
  if (!settings.transparent) {
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, 128, 128);
  }
  ctx.save();
  ctx.translate(64, 64);
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
  }
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
    settings.characterColors && runs[index].length
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
  let scale = Math.min(126 / width, 126 / height);
  switch (settings.motion) {
    case "bounce":
      scale = Math.min(126 / width, 114 / height);
      break;
    case "slide":
      scale = Math.min(98 / width, 126 / height);
      break;
    case "shake":
      scale = Math.min(
        126 / (width + height * Math.sin(0.12)),
        126 / (height + width * Math.sin(0.12)),
      );
      break;
    case "roll":
      scale = 126 / Math.hypot(width, height);
      break;
  }
  ctx.scale(scale, scale);
  ctx.fillStyle = settings.color;
  lines.forEach((line, index) => {
    const x = (metrics[index].actualBoundingBoxLeft - metrics[index].actualBoundingBoxRight) / 2;
    const y = index * 105 - (top + bottom) / 2;
    if (settings.characterColors) {
      runs[index].forEach((run) => {
        ctx.fillStyle = run.color;
        ctx.fillText(run.character, x + run.x, y);
      });
    } else {
      ctx.fillText(line, x, y);
    }
  });
  ctx.restore();
}

export async function exportGif(ctx: CanvasRenderingContext2D, settings: Settings): Promise<Blob> {
  const error = validateText(settings.text);
  if (error) throw new Error(error);
  const frames = [];
  const count = settings.motion === "none" ? 1 : 20;
  for (let index = 0; index < count; index += 1) {
    drawEmoji(ctx, settings, index / count);
    frames.push({
      data: ctx.getImageData(0, 0, 128, 128).data,
      delay: 60,
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
    throw new Error("파일이 128KB를 넘었어요. 텍스트를 줄이거나 모션을 바꿔 주세요.");
  return blob;
}
