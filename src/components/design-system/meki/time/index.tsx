"use client";

import { formatTime } from "./format-time";
import type { ComponentProps } from "react";

import { ClientOnly } from "../client-only";

interface TimeProps extends ComponentProps<"time"> {
  format?: string;
  time: string | Date;
}

const TimeContent = ({ time, format, ...props }: TimeProps) => (
  <time {...props}>{formatTime(time, { format })}</time>
);

export const Time = ({ time, format = "YYYY.MM.DD", ...props }: TimeProps) => (
  <ClientOnly fallback={<TimeContent format={format} time={time} {...props} />}>
    <TimeContent format={format} time={time} {...props} />
  </ClientOnly>
);
