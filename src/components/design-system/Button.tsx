import type { ComponentProps } from "react";

export function Button({
  variant = "secondary",
  type = "button",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "subtle" | "critical";
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-control-size min-w-control-size cursor-pointer touch-manipulation items-center justify-center gap-control rounded-control border px-inset py-control text-label font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] ${
        {
          primary:
            "border-transparent bg-bg-brand-solid text-fg-on-brand-solid shadow-control enabled:hover:bg-bg-brand-solid-hover enabled:active:bg-bg-brand-solid-pressed disabled:bg-bg-disabled disabled:text-fg-disabled",
          secondary:
            "border-stroke-neutral bg-bg-layer-default text-fg-neutral-secondary shadow-control enabled:hover:border-stroke-neutral-strong enabled:hover:bg-bg-neutral-weak enabled:active:bg-bg-neutral-weak-pressed disabled:bg-bg-disabled disabled:text-fg-disabled",
          subtle:
            "border-transparent bg-bg-neutral-weak text-fg-neutral-secondary enabled:hover:bg-bg-neutral-weak-hover enabled:active:bg-bg-neutral-weak-pressed disabled:bg-bg-disabled disabled:text-fg-disabled",
          critical:
            "border-stroke-neutral bg-bg-layer-default text-fg-critical enabled:hover:bg-bg-critical-weak enabled:active:bg-bg-critical-weak-pressed disabled:bg-bg-disabled disabled:text-fg-disabled",
        }[variant]
      } ${className}`}
      {...props}
    />
  );
}
