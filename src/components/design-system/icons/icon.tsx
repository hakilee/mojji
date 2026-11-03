import { isValidElement } from "react";
import type { SVGProps } from "react";

import type { IconProps } from "./types";

const DEFAULT_ICON_SIZE = 16;

/**
 * Applies shared size and accessibility props to an SVG icon.
 */
const Icon = ({ children, width, height, size = DEFAULT_ICON_SIZE, ...props }: IconProps) => {
  if (!isValidElement<SVGProps<SVGSVGElement>>(children)) {
    return null;
  }

  const { children: svgChildren, ...svgProps } = children.props;
  const hasAccessibleName = [props["aria-label"], props["aria-labelledby"]].some(Boolean);

  return (
    <svg
      {...svgProps}
      aria-hidden={props["aria-hidden"] ?? !hasAccessibleName}
      height={height ?? size}
      width={width ?? size}
      {...props}
    >
      {svgChildren}
    </svg>
  );
};

export default Icon;
