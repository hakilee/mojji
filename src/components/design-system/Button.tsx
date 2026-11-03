import type { ComponentProps } from "react";

export function Button({
  variant = "black",
  size = "medium",
  svgOnly = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  variant?: "black" | "white" | "neutral";
  size?: "medium" | "small" | "x-small";
  svgOnly?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex cursor-pointer touch-manipulation items-center justify-center gap-control leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] ${
        {
          black:
            "bg-bg-brand-solid text-fg-on-brand-solid enabled:hover:bg-bg-brand-solid-hover enabled:active:bg-bg-brand-solid-pressed disabled:bg-bg-brand-disabled disabled:text-fg-on-disabled-brand",
          white:
            "border border-stroke-neutral bg-bg-layer-default text-fg-brand enabled:hover:bg-bg-neutral-weak enabled:active:bg-bg-neutral-weak-pressed disabled:text-fg-disabled",
          neutral:
            "bg-bg-brand-weak text-fg-brand enabled:hover:bg-bg-neutral-weak-pressed enabled:active:bg-bg-brand-weak-pressed disabled:text-fg-disabled",
        }[variant]
      } ${
        {
          medium: "min-h-control-size min-w-control-size rounded-action text-label font-semibold",
          small:
            "min-h-control-small min-w-control-small rounded-action-small text-label font-medium",
          "x-small":
            "min-h-control-mini min-w-control-mini rounded-action-mini text-compact font-medium shadow-control",
        }[size]
      } ${svgOnly ? "aspect-square p-0" : { medium: "px-6 py-control", small: "px-inset py-1", "x-small": "px-control py-1" }[size]} ${className}`}
      {...props}
    />
  );
}
