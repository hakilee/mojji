import type { ReactNode } from "react";
import { Accordion } from "./meki/accordion";
import { ChevronDownIcon } from "./icons";

export function EditorAccordionItem({
  id,
  title,
  value,
  children,
}: {
  id?: string;
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <Accordion.Item id={id} value={value} className="min-w-0">
      <Accordion.Trigger className="group w-full gap-control px-group text-left focus-visible:-outline-offset-2">
        {title}
        <ChevronDownIcon
          size={16}
          className="shrink-0 text-text-tertiary transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </Accordion.Trigger>
      <Accordion.Content forceMount className="data-[state=closed]:hidden">
        <fieldset className="min-w-0 border-0 px-group pt-control">
          <legend className="sr-only">{title}</legend>
          {children}
        </fieldset>
      </Accordion.Content>
    </Accordion.Item>
  );
}
