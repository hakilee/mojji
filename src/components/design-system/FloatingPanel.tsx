import { useEffect, useMemo, useRef, useState } from "react";
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
  const [viewport, setViewport] = useState<{
    x: number;
    bottom: number;
    height: number;
    width: number;
  } | null>(null);
  useEffect(() => {
    const visual = window.visualViewport;
    const update = () => {
      setViewport(
        window.innerWidth <= 760
          ? {
              x: (visual?.offsetLeft ?? 0) + (visual?.width ?? window.innerWidth) / 2,
              bottom: (visual?.offsetTop ?? 0) + (visual?.height ?? window.innerHeight) - 12,
              height: (visual?.height ?? window.innerHeight) - 24,
              width: (visual?.width ?? window.innerWidth) - 24,
            }
          : null,
      );
    };
    update();
    window.addEventListener("resize", update);
    visual?.addEventListener("resize", update);
    visual?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      visual?.removeEventListener("resize", update);
      visual?.removeEventListener("scroll", update);
    };
  }, []);
  const panelAnchor = useMemo(
    () =>
      viewport
        ? {
            current: {
              getBoundingClientRect: () => new DOMRect(viewport.x, viewport.bottom, 0, 0),
            },
          }
        : anchor,
    [anchor, viewport],
  );
  return (
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Popover.Anchor virtualRef={panelAnchor} />
      <Popover.Provider>
        <Popover.Content
          id={id}
          aria-label={label}
          side={viewport ? "top" : "bottom"}
          align="center"
          sideOffset={viewport ? 0 : 8}
          avoidCollisions={!viewport}
          updatePositionStrategy={viewport ? "always" : "optimized"}
          style={
            viewport
              ? { maxHeight: Math.max(0, viewport.height), maxWidth: Math.max(0, viewport.width) }
              : undefined
          }
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (
              restoreFocus.current &&
              anchor.current?.isConnected &&
              !document.activeElement?.closest("#editor-history")
            )
              anchor.current.focus();
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
                target.closest(
                  '#layer-stack, #editor-history, #work-canvas [data-resize-corner], [aria-modal="true"]',
                ))
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
