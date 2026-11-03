import type { ComponentProps } from "react";

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`h-field-size min-w-0 cursor-pointer touch-manipulation rounded-control border border-stroke-neutral bg-bg-layer-default px-inset text-body text-fg-neutral transition-colors duration-150 enabled:hover:border-stroke-neutral-strong focus:border-stroke-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus aria-invalid:border-fg-critical disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled motion-reduce:transition-none ${className}`}
      {...props}
    />
  );
}
