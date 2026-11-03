import { useId } from "react";
import { Popover } from "./meki/popover";
import { CrossIcon } from "./icons";
import type { ReactNode } from "react";

export function HelpBubble({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <Popover>
      <Popover.Trigger
        type="button"
        aria-label={`${label} 도움말`}
        className="inline-flex size-6 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full text-fg-neutral-muted transition-colors duration-150 hover:bg-bg-brand-weak hover:text-fg-neutral data-[state=open]:bg-bg-brand-weak data-[state=open]:text-fg-neutral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" />
        </svg>
      </Popover.Trigger>
      <Popover.Provider>
        <Popover.Content
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          side="top"
          sideOffset={12}
          collisionPadding={16}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="w-70 max-w-[calc(100vw-32px)] origin-[var(--radix-popover-content-transform-origin)] border-0 p-0 rounded-panel bg-bg-brand-solid text-label text-fg-on-brand-solid outline-none transition-[opacity,scale] duration-150 data-[state=closed]:scale-90 data-[state=closed]:opacity-0 motion-reduce:transition-none motion-reduce:data-[state=closed]:scale-100"
        >
          <Popover.Arrow width={12} height={8} className="fill-bg-brand-solid" />
          <div className="flex max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain rounded-[inherit] px-inset py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 break-keep wrap-anywhere">
              <span id={`${id}-title`} className="font-semibold">
                {label}
              </span>
              <div id={`${id}-description`} className="font-normal">
                {children}
              </div>
            </div>
            <Popover.Close
              aria-label={`${label} 도움말 닫기`}
              className="-my-2.5 -mr-3 -ml-2 inline-flex size-[38px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-panel transition-colors duration-150 hover:bg-fg-on-brand-solid/10 active:bg-fg-on-brand-solid/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg-on-brand-solid motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]"
            >
              <CrossIcon size={14} />
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Provider>
    </Popover>
  );
}
