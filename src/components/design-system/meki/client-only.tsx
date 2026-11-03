"use client";

import type { ReactNode } from "react";

import { useIsClient } from "./use-is-client";

export interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ClientOnly = ({ children, fallback }: ClientOnlyProps): ReactNode =>
  useIsClient() ? children : fallback;
