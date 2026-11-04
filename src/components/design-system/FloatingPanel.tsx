import { useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { Popover } from "./meki/popover";
import { Button } from "./meki/button";

export function FloatingPanel({
  id,
  label,
  anchor,
  onClose,
  children,
}: {
  id: string;
  label: string;
  anchor: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const restoreFocus = useRef(true);
  return (
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Popover.Anchor virtualRef={anchor} />
      <Popover.Provider>
        <Popover.Content
          id={id}
          aria-label={label}
          side="bottom"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (restoreFocus.current && anchor.current?.isConnected) anchor.current.focus();
          }}
          onFocusOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={() => {
            restoreFocus.current = true;
          }}
          onPointerDownOutside={(event) => {
            const target = event.detail.originalEvent.target;
            if (
              target instanceof Element &&
              (anchor.current?.contains(target) ||
                target.closest('#layer-stack, #editor-history, [aria-modal="true"]'))
            ) {
              event.preventDefault();
              return;
            }
            restoreFocus.current = false;
          }}
          className="flex w-80 max-w-[calc(100vw-24px)] max-h-[min(70dvh,var(--radix-popover-content-available-height))] flex-col overflow-hidden rounded-xl border-neutral-200 p-3 text-sm shadow-floating outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-stroke-focus"
        >
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h2 className="font-medium">{label}</h2>
            <Popover.Close asChild>
              <Button variant="neutral" size="x-small" aria-label="레이어 편집 닫기">
                닫기
              </Button>
            </Popover.Close>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
        </Popover.Content>
      </Popover.Provider>
    </Popover>
  );
}
