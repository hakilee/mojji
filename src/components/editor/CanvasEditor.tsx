import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { drawEmoji, measureEmojiText } from "~/lib/emoji";
import type { ImageLayer, Settings } from "~/lib/emoji";
import { LayerControls } from "./LayerControls";
import { Button } from "~/components/design-system";

export function CanvasEditor({
  settings,
  selectedId,
  onSelect,
  onMove,
  onDelete,
  onEditText,
  onAddImage,
  onImagesChange,
  onTextLayoutChange,
  onDismiss,
}: {
  settings: Settings;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onEditText: () => void;
  onAddImage: () => void;
  onImagesChange: (images: ImageLayer[]) => void;
  onTextLayoutChange: (layout: Settings["textLayout"]) => void;
  onDismiss: (id: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const selectedAnchor = useRef<HTMLButtonElement | null>(null);
  const dragging = useRef<{
    id: string;
    active: boolean;
    clientX: number;
    clientY: number;
    x: number;
    y: number;
  } | null>(null);
  const [geometry, setGeometry] = useState({ width: 0, height: 0 });
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function render() {
      await document.fonts.load(`100px "${settings.font}"`, settings.text);
      if (!active) return;
      const ctx = canvas.current?.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.scale(6, 6);
      drawEmoji(ctx, { ...settings, motion: "none" }, 0);
      ctx.restore();
      if (settings.text.trim()) {
        const { width, height } = measureEmojiText(ctx, settings);
        const fit = Math.min(126 / width, 126 / height) * (settings.textLayout?.scale ?? 1);
        setGeometry((previous) =>
          previous.width === width * fit && previous.height === height * fit
            ? previous
            : { width: width * fit, height: height * fit },
        );
      } else setGeometry((previous) => (previous.width ? { width: 0, height: 0 } : previous));
      setError("");
    }
    void render().catch(() => {
      if (active) setError("캔버스를 그리지 못했어요. 글꼴을 다시 선택해 주세요.");
    });
    return () => {
      active = false;
    };
  }, [settings]);
  function move(id: string, x: number, y: number) {
    onMove(
      id,
      Math.round(Math.max(0, Math.min(128, x))),
      Math.round(Math.max(0, Math.min(128, y))),
    );
  }
  const layers: (ImageLayer | "text")[] = [
    ...(settings.images ?? []).filter((image) => image.behindText),
    ...(settings.text.trim() ? ["text" as const] : []),
    ...(settings.images ?? []).filter((image) => !image.behindText),
  ];
  return (
    <div className="space-y-inset">
      <div
        role="group"
        aria-label="작업 캔버스"
        aria-describedby="canvas-instructions"
        className="relative aspect-square overflow-hidden rounded-panel border border-stroke-neutral-strong bg-bg-checker-base bg-[conic-gradient(var(--color-bg-checker-tile)_25%,transparent_0_50%,var(--color-bg-checker-tile)_0_75%,transparent_0)] bg-size-[16px_16px]"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-layer]");
          const id = button?.dataset.layer;
          if (!id || !button) {
            onSelect(null);
            return;
          }
          const layer =
            id === "text"
              ? (settings.textLayout ?? { x: 64, y: 64 })
              : settings.images?.find((image) => image.id === id);
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
            const image = settings.images?.find((item) => item.id === id);
            if (id === "text")
              return {
                x: settings.textLayout?.x ?? 64,
                y: settings.textLayout?.y ?? 64,
                width: geometry.width,
                height: geometry.height,
              };
            if (!image) return { x: 64, y: 64, width: 0, height: 0 };
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
            ...layers
              .filter((layer) => (layer === "text" ? "text" : layer.id) !== drag.id)
              .map((layer) => bounds(layer === "text" ? "text" : layer.id)),
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
          if (event.key === "Delete" && id !== "text") {
            event.preventDefault();
            onDelete(id);
            return;
          }
          const layer =
            id === "text"
              ? (settings.textLayout ?? { x: 64, y: 64 })
              : settings.images?.find((image) => image.id === id);
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
          const text = layer === "text";
          const id = text ? "text" : layer.id;
          const x = text ? (settings.textLayout?.x ?? 64) : layer.x;
          const y = text ? (settings.textLayout?.y ?? 64) : layer.y;
          const width = text
            ? geometry.width
            : layer.size * (layer.fit === "cover" ? 1 : Math.min(1, layer.aspectRatio));
          const height = text
            ? geometry.height
            : layer.size * (layer.fit === "cover" ? 1 : Math.min(1, 1 / layer.aspectRatio));
          const style: CSSProperties = {
            left: `${(x / 128) * 100}%`,
            top: `${(y / 128) * 100}%`,
            width: `${(width / 128) * 100}%`,
            height: `${(height / 128) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${text ? 0 : layer.rotation}deg)`,
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
                text
                  ? "텍스트 레이어"
                  : `이미지 레이어 ${(settings.images ?? []).indexOf(layer) + 1}: ${layer.name}`
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
              onDoubleClick={text ? onEditText : undefined}
              className="absolute touch-none cursor-grab border-0 bg-transparent p-0 hover:outline hover:-outline-offset-1 hover:outline-stroke-guide/35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-guide aria-pressed:outline aria-pressed:-outline-offset-1 aria-pressed:outline-stroke-guide/75 active:cursor-grabbing"
            />
          );
        })}
      </div>
      {selectedId && (
        <LayerControls
          key={selectedId}
          anchor={selectedAnchor}
          images={settings.images ?? []}
          textLayout={settings.textLayout}
          selectedId={selectedId}
          onClose={() => onDismiss(selectedId)}
          onImagesChange={onImagesChange}
          onTextLayoutChange={onTextLayoutChange}
        />
      )}
      <p id="canvas-instructions" className="text-caption text-fg-neutral-muted">
        클릭해 선택하고 드래그로 이동하세요. 방향키로 미세 조절하고, Alt 키로 자석 정렬을
        해제하세요.
      </p>
      {error && (
        <p role="alert" className="text-caption text-fg-critical">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-control">
        <Button variant="white" size="small" onClick={onEditText}>
          텍스트 편집
        </Button>
        <Button
          variant="white"
          size="small"
          onClick={onAddImage}
          disabled={(settings.images?.length ?? 0) >= 12}
        >
          이미지 추가
        </Button>
      </div>
    </div>
  );
}
