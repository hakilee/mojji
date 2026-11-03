import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { cn } from "./cn";

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "baseline" | "stretch";
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

export interface FlexProps extends ComponentPropsWithoutRef<"div"> {
  align?: FlexAlign;
  asChild?: boolean;
  direction?: FlexDirection;
  gap?: number;
  justify?: FlexJustify;
  wrap?: FlexWrap;
}

const directionMap: Record<FlexDirection, string> = {
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
};

const alignMap: Record<FlexAlign, string> = {
  baseline: "items-baseline",
  center: "items-center",
  end: "items-end",
  start: "items-start",
  stretch: "items-stretch",
};

const justifyMap: Record<FlexJustify, string> = {
  around: "justify-around",
  between: "justify-between",
  center: "justify-center",
  end: "justify-end",
  evenly: "justify-evenly",
  start: "justify-start",
};

const wrapMap: Record<FlexWrap, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
};

const renderFlex = (
  {
    asChild,
    className,
    direction = "row",
    align,
    justify,
    wrap,
    gap,
    style: _style,
    ...props
  }: FlexProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const classes = cn(
    "flex",
    directionMap[direction],
    align !== undefined && alignMap[align],
    justify !== undefined && justifyMap[justify],
    wrap !== undefined && wrapMap[wrap],
    className,
  );
  const style = {
    ...(gap !== undefined && { gap: `${gap}px` }),
    ..._style,
  };
  const Comp = asChild === true ? Slot : "div";
  return <Comp className={classes} ref={ref} style={style} {...props} />;
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(renderFlex);

Flex.displayName = "Flex";
