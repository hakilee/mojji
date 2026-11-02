import type { ReactNode } from "react";

export function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group min-w-0 overflow-hidden rounded-control border border-stroke-neutral bg-bg-layer-default"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold select-none hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-stroke-focus group-open:bg-bg-brand-weak [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          className="size-4 shrink-0 text-fg-neutral-muted group-open:rotate-180"
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
      </summary>
      <fieldset className="min-w-0 border-0 border-t border-solid border-stroke-neutral p-3">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}
