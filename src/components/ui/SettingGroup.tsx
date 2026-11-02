import type { ReactNode } from "react";

export function SettingGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 min-w-0 border-0 p-0">
      <legend className="mb-3 p-0 font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}
