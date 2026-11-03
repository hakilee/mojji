import type { ComponentProps } from "react";
export function CanvasHitTarget(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="absolute touch-none cursor-grab border-0 bg-transparent p-0 hover:outline hover:-outline-offset-1 hover:outline-stroke-guide/35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-guide aria-pressed:outline aria-pressed:-outline-offset-1 aria-pressed:outline-stroke-guide/75 active:cursor-grabbing"
      {...props}
    />
  );
}
