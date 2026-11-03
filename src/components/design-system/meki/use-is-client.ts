"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {
  /* empty */
};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export const useIsClient = () =>
  useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
