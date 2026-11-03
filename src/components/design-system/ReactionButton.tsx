import type { ComponentProps } from "react";
export function ReactionButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-reaction aria-pressed:bg-bg-reaction aria-pressed:text-fg-reaction inline-flex h-[26px] items-center justify-center gap-1 rounded-full border border-transparent bg-background px-2 py-0.5 text-xs font-semibold leading-none tabular-nums hover:border-stroke-reaction [&>canvas]:size-4"
      {...props}
    />
  );
}
