import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { cn } from "./cn";

export type GridFlow = "row" | "column" | "dense" | "row-dense" | "column-dense";

export interface GridProps extends ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  columns?: number | string;
  flow?: GridFlow;
  gap?: number;
  gapX?: number;
  gapY?: number;
  rows?: number | string;
}

const flowMap: Record<GridFlow, string> = {
  column: "grid-flow-col",
  "column-dense": "grid-flow-col-dense",
  dense: "grid-flow-dense",
  row: "grid-flow-row",
  "row-dense": "grid-flow-row-dense",
};

const renderGrid = (
  { asChild, className, columns, rows, gap, gapX, gapY, flow, style: _style, ...props }: GridProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const classes = cn("grid", flow && flowMap[flow], className);
  const style = {
    ...(columns !== undefined && {
      gridTemplateColumns:
        typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns,
    }),
    ...(rows !== undefined && {
      gridTemplateRows: typeof rows === "number" ? `repeat(${rows}, minmax(0, 1fr))` : rows,
    }),
    ...(gap !== undefined && { gap: `${gap}px` }),
    ...(gapX !== undefined && { columnGap: `${gapX}px` }),
    ...(gapY !== undefined && { rowGap: `${gapY}px` }),
    ..._style,
  };
  const Comp = asChild === true ? Slot : "div";
  return <Comp className={classes} ref={ref} style={style} {...props} />;
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(renderGrid);

Grid.displayName = "Grid";
