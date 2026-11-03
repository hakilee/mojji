import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { cn } from "./cn";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends ComponentProps<"hr"> {
  orientation?: DividerOrientation;
}

const renderDivider = (
  { className, orientation = "horizontal", ...props }: DividerProps,
  ref: React.Ref<HTMLHRElement>,
) => (
  <hr
    className={cn(
      "border-0 bg-divider",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    ref={ref}
    {...props}
  />
);

export const Divider = forwardRef<HTMLHRElement, DividerProps>(renderDivider);
Divider.displayName = "Divider";
