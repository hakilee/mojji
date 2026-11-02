import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import type { ReactNode } from "react";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className="min-w-0 overflow-hidden rounded-control border border-stroke-neutral bg-bg-layer-default"
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full min-h-12 cursor-pointer text-left items-center justify-between gap-3 px-4 py-3 text-sm font-semibold select-none hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus data-panel-open:bg-bg-brand-weak">
          {title}
          <svg
            className="size-4 shrink-0 text-fg-neutral-muted group-data-panel-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Panel>
        <fieldset className="min-w-0 border-0 border-t border-solid border-stroke-neutral p-3">
          <legend className="sr-only">{title}</legend>
          {children}
        </fieldset>
      </AccordionPrimitive.Panel>
    </AccordionPrimitive.Item>
  );
}
