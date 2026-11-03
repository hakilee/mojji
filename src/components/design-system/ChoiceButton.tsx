import type { ComponentProps } from "react";

export function ChoiceButton({
  selected,
  className = "",
  ...props
}: Omit<ComponentProps<"button">, "aria-pressed" | "type"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`min-h-control-size min-w-0 cursor-pointer touch-manipulation rounded-action-small border border-stroke-neutral bg-bg-layer-default p-inset text-label text-fg-neutral-secondary transition-colors duration-150 enabled:hover:border-stroke-neutral-strong enabled:hover:bg-bg-neutral-weak enabled:active:bg-bg-brand-weak-pressed aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed disabled:text-fg-disabled motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] ${className}`}
      {...props}
    />
  );
}
