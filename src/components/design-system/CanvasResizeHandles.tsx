import type { CSSProperties } from "react";

export function CanvasResizeHandles({
  layerId,
  rotation,
  style,
}: {
  layerId: string;
  rotation: number;
  style: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      data-layer={layerId}
      className="pointer-events-none absolute z-20"
      style={style}
    >
      {[
        { corner: "nw", x: 0, y: 0 },
        { corner: "ne", x: 100, y: 0 },
        { corner: "sw", x: 0, y: 100 },
        { corner: "se", x: 100, y: 100 },
      ].map(({ corner, x, y }) => (
        <span
          key={corner}
          data-resize-corner={corner}
          className="pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            cursor: ["ew-resize", "nwse-resize", "ns-resize", "nesw-resize"][
              ((Math.round((rotation + (x === y ? 45 : 135)) / 45) % 4) + 4) % 4
            ],
          }}
        >
          <span className="pointer-events-none size-2 rounded-[2px] border border-stroke-guide bg-white" />
        </span>
      ))}
    </div>
  );
}
