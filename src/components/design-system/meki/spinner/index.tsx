import type { ComponentPropsWithoutRef, CSSProperties, Ref } from "react";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import styles from "./Spinner.module.css";

export type SpinnerSize = "x-small" | "small" | "medium" | "large";

export interface SpinnerProps extends ComponentPropsWithoutRef<"output"> {
  label?: string;
  size?: SpinnerSize;
}

const blades = Array.from({ length: 12 }, (_, i) => ({
  delay: (11 - i) * 0.083,
  rotation: i * 30,
}));

const sizeConfig = {
  large: {
    blade: { height: 8, left: 13, originY: -7, radius: 2, width: 3 },
    container: 28,
  },
  medium: {
    blade: { height: 7, left: 11, originY: -6, radius: 2, width: 2 },
    container: 24,
  },
  small: {
    blade: { height: 6, left: 9, originY: -5, radius: 1, width: 2 },
    container: 20,
  },
  "x-small": {
    blade: { height: 5, left: 7, originY: -4, radius: 1, width: 1.5 },
    container: 16,
  },
} as const;

const renderSpinner = (
  { size = "medium", className, style: _style, label, ...props }: SpinnerProps,
  ref: Ref<HTMLOutputElement>,
) => {
  const config = sizeConfig[size];

  const style = {
    height: `${config.container}px`,
    width: `${config.container}px`,
    ..._style,
  } as CSSProperties;

  return (
    <output
      aria-label={label}
      aria-live={label ? "polite" : undefined}
      aria-hidden={label ? undefined : true}
      className={twMerge("relative inline-block shrink-0 align-middle", className)}
      ref={ref}
      style={style}
      {...props}
    >
      {blades.map(({ rotation, delay }) => (
        <div
          className={twMerge("absolute bottom-0", styles["spinner-blade"])}
          key={rotation}
          style={{
            animationDelay: `${-delay}s`,
            backgroundColor: "currentColor",
            borderRadius: `${config.blade.radius}px`,
            height: `${config.blade.height}px`,
            left: `${config.blade.left}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `center ${config.blade.originY}px`,
            width: `${config.blade.width}px`,
          }}
        />
      ))}
    </output>
  );
};

export const Spinner = forwardRef<HTMLOutputElement, SpinnerProps>(renderSpinner);

Spinner.displayName = "Spinner";
