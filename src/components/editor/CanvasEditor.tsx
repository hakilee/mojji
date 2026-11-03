import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { drawEmoji, measureEmojiText } from "~/lib/emoji";
import { LayerFontError, loadLayerFonts } from "~/lib/font-loading";
import type { Settings } from "~/lib/emoji";
import { Button, Spinner } from "~/components/design-system";

export function CanvasEditor({
  settings,
  selectedId,
  selectedAnchor,
  onSelect,
  onMove,
  onEditText,
  onChooseFont,
  renderAttempt,
  onRetry,
}: {
  settings: Settings;
  selectedId: string | null;
  selectedAnchor: RefObject<HTMLButtonElement | null>;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onEditText: (id: string) => void;
  onChooseFont: (id: string) => void;
  renderAttempt: number;
  onRetry: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<{
    id: string;
    active: boolean;
    clientX: number;
    clientY: number;
    x: number;
    y: number;
  } | null>(null);
  const [geometry, setGeometry] = useState<Record<string, { width: number; height: number }>>({});
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [error, setError] = useState<{ message: string; fontId: string | null } | null>(null);
  const [completedRender, setCompletedRender] = useState<{
    settings: Settings;
    attempt: number;
  } | null>(null);
  const rendering =
    completedRender?.settings !== settings || completedRender?.attempt !== renderAttempt;
  useEffect(() => {
    let active = true;
    async function render() {
      await loadLayerFonts(settings.layers);
      if (!active) return;
      const ctx = canvas.current?.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.save();
      try {
        ctx.scale(6, 6);
        drawEmoji(ctx, { ...settings, motion: "none" }, 0);
      } finally {
        ctx.restore();
      }
      const nextGeometry: Record<string, { width: number; height: number }> = {};
      for (const layer of settings.layers) {
        if (layer.type !== "text") continue;
        if (!layer.text.trim()) {
          nextGeometry[layer.id] = { width: 48, height: 24 };
          continue;
        }
        const { width, height } = measureEmojiText(ctx, layer);
        const fit = Math.min(126 / width, 126 / height) * layer.scale;
        nextGeometry[layer.id] = { width: width * fit, height: height * fit };
      }
      setGeometry((previous) =>
        Object.keys(previous).length === Object.keys(nextGeometry).length &&
        Object.entries(nextGeometry).every(
          ([id, size]) =>
            previous[id]?.width === size.width && previous[id]?.height === size.height,
        )
          ? previous
          : nextGeometry,
      );
      setError(null);
    }
    void render()
      .catch((cause) => {
        if (active)
          setError({
            fontId: cause instanceof LayerFontError ? cause.layerId : null,
            message:
              cause instanceof LayerFontError
                ? cause.message
                : "캔버스를 그리지 못했어요. 다시 그리기를 눌러 주세요.",
          });
      })
      .finally(() => {
        if (active) setCompletedRender({ settings, attempt: renderAttempt });
      });
    return () => {
      active = false;
    };
  }, [settings, renderAttempt]);
  function move(id: string, x: number, y: number) {
    onMove(
      id,
      Math.round(Math.max(0, Math.min(128, x))),
      Math.round(Math.max(0, Math.min(128, y))),
    );
  }
  const layers = settings.layers;
  return (
    <div className="space-y-inset">
      <div
        role="group"
        id="work-canvas"
        tabIndex={0}
        aria-label="작업 캔버스"
        aria-busy={rendering}
        className="relative aspect-square overflow-hidden rounded-panel border border-stroke-neutral-strong bg-bg-checker-base bg-[conic-gradient(var(--color-bg-checker-tile)_25%,transparent_0_50%,var(--color-bg-checker-tile)_0_75%,transparent_0)] bg-size-[16px_16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-guide"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-layer]");
          const id = button?.dataset.layer;
          if (!id || !button) {
            onSelect(null);
            return;
          }
          const layer = layers.find((item) => item.id === id);
          if (!layer) return;
          onSelect(id);
          dragging.current = {
            id,
            active: false,
            clientX: event.clientX,
            clientY: event.clientY,
            x: layer.x,
            y: layer.y,
          };
          button.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current || dragging.current.id !== selectedId) return;
          const rect = canvas.current?.getBoundingClientRect();
          if (!rect) return;
          const drag = dragging.current;
          if (!drag.active) {
            if (Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) <= 3) return;
            drag.active = true;
          }
          const bounds = (id: string) => {
            const image = layers.find((item) => item.id === id);
            if (!image) return { x: 64, y: 64, width: 0, height: 0 };
            if (image.type === "text")
              return {
                x: image.x,
                y: image.y,
                width: geometry[id]?.width ?? 48,
                height: geometry[id]?.height ?? 24,
              };
            const width = image.size * (image.fit === "cover" ? 1 : Math.min(1, image.aspectRatio));
            const height =
              image.size * (image.fit === "cover" ? 1 : Math.min(1, 1 / image.aspectRatio));
            const angle = (image.rotation * Math.PI) / 180;
            return {
              x: image.x,
              y: image.y,
              width: Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle)),
              height: Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle)),
            };
          };
          const moving = bounds(drag.id);
          const targets = [
            { x: 64, y: 64, width: 128, height: 128 },
            ...layers.filter((layer) => layer.id !== drag.id).map((layer) => bounds(layer.id)),
          ];
          const next = {
            x: drag.x + ((event.clientX - drag.clientX) * 128) / rect.width,
            y: drag.y + ((event.clientY - drag.clientY) * 128) / rect.height,
          };
          const lines: { x?: number; y?: number } = {};
          if (!event.altKey)
            for (const axis of ["x", "y"] as const) {
              const size = axis === "x" ? "width" : "height";
              let distance = (5 * 128) / rect.width;
              for (const target of targets) {
                if (Math.abs(target[axis] - next[axis]) < distance) {
                  distance = Math.abs(target[axis] - next[axis]);
                  lines[axis] = target[axis];
                  moving[axis] = target[axis];
                }
              }
              if (lines[axis] === undefined)
                for (const target of targets)
                  for (const anchor of [-0.5, 0, 0.5])
                    for (const offset of [-0.5, 0, 0.5]) {
                      const line = target[axis] + target[size] * anchor;
                      const correction = line - (next[axis] + moving[size] * offset);
                      const position = next[axis] + correction;
                      if (Math.abs(correction) < distance && position >= 0 && position <= 128) {
                        distance = Math.abs(correction);
                        lines[axis] = line;
                        moving[axis] = position;
                      }
                    }
              if (lines[axis] !== undefined) next[axis] = moving[axis];
            }
          setGuides(lines);
          move(drag.id, next.x, next.y);
        }}
        onPointerUp={(event) => {
          dragging.current = null;
          setGuides({});
          if ((event.target as HTMLElement).hasPointerCapture(event.pointerId))
            (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        }}
        onLostPointerCapture={() => {
          dragging.current = null;
          setGuides({});
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            dragging.current = null;
            setGuides({});
            onSelect(null);
            return;
          }
          const id = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-layer]")
            ?.dataset.layer;
          if (!id) return;
          const layer = layers.find((item) => item.id === id);
          if (!layer || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
            return;
          event.preventDefault();
          onSelect(id);
          const step = event.shiftKey ? 10 : 1;
          move(
            id,
            layer.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0),
            layer.y + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0),
          );
        }}
      >
        <canvas
          ref={canvas}
          width={768}
          height={768}
          aria-label="이모지 작업 캔버스"
          className="absolute inset-0 size-full"
        />
        {guides.x !== undefined && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 border-l border-stroke-guide"
            style={{ left: `${(guides.x / 128) * 100}%` }}
          />
        )}
        {guides.y !== undefined && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-stroke-guide"
            style={{ top: `${(guides.y / 128) * 100}%` }}
          />
        )}
        {layers.map((layer) => {
          const id = layer.id;
          const x = layer.x;
          const y = layer.y;
          const width =
            layer.type === "text"
              ? (geometry[id]?.width ?? 48)
              : layer.size * (layer.fit === "cover" ? 1 : Math.min(1, layer.aspectRatio));
          const height =
            layer.type === "text"
              ? (geometry[id]?.height ?? 24)
              : layer.size * (layer.fit === "cover" ? 1 : Math.min(1, 1 / layer.aspectRatio));
          const style: CSSProperties = {
            left: `${(x / 128) * 100}%`,
            top: `${(y / 128) * 100}%`,
            width: `${(width / 128) * 100}%`,
            height: `${(height / 128) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${layer.type === "text" ? 0 : layer.rotation}deg)`,
          };
          return (
            <button
              key={id}
              ref={(element) => {
                if (element && selectedId === id) selectedAnchor.current = element;
              }}
              type="button"
              data-layer={id}
              style={style}
              aria-label={
                layer.type === "text"
                  ? `텍스트 레이어: ${layer.text.trim() || "빈 텍스트"}`
                  : `이미지 레이어: ${layer.name}`
              }
              aria-pressed={selectedId === id}
              aria-haspopup="dialog"
              aria-expanded={selectedId === id}
              aria-controls={selectedId === id ? "layer-controls" : undefined}
              onClick={(event) => {
                if (event.detail === 0) {
                  onSelect(id);
                  requestAnimationFrame(() => document.getElementById("layer-controls")?.focus());
                }
              }}
              onDoubleClick={layer.type === "text" ? () => onEditText(id) : undefined}
              className="absolute touch-none cursor-grab border-0 bg-transparent p-0 hover:outline hover:-outline-offset-1 hover:outline-stroke-guide/35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-guide aria-pressed:outline aria-pressed:-outline-offset-1 aria-pressed:outline-stroke-guide/75 active:cursor-grabbing"
            />
          );
        })}
      </div>
      {error && (
        <div className="space-y-control">
          <p role="alert" className="text-caption text-fg-critical">
            {error.message}
          </p>
          <div className="flex flex-wrap gap-control">
            <Button
              variant="white"
              size="small"
              disabled={rendering}
              aria-busy={rendering}
              onClick={onRetry}
            >
              {rendering && <Spinner />}
              다시 그리기
            </Button>
            {error.fontId && (
              <Button variant="neutral" size="small" onClick={() => onChooseFont(error.fontId!)}>
                글꼴 설정 열기
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
