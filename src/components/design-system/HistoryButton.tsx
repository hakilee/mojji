import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "./meki/button";

export function HistoryButton({
  direction,
  disabled,
  onRestore,
}: {
  direction: "undo" | "redo";
  disabled: boolean;
  onRestore: () => void;
}) {
  const pressed = useRef<{ pointerId: number; button: HTMLButtonElement } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);
  const restore = useRef(onRestore);
  const stop = useCallback((cancel = false) => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    const pointer = pressed.current;
    pressed.current = null;
    if (!pointer) return;
    if (cancel) suppressClick.current = true;
    if (pointer.button.hasPointerCapture(pointer.pointerId))
      pointer.button.releasePointerCapture(pointer.pointerId);
  }, []);

  useLayoutEffect(() => {
    restore.current = onRestore;
    if (disabled) stop(true);
  }, [disabled, onRestore, stop]);

  useEffect(() => {
    const cancel = () => stop(true);
    const visibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", visibility);
      cancel();
    };
  }, [stop]);

  return (
    <Button
      variant="white"
      size="small"
      svgOnly
      className="select-none"
      aria-label={direction === "undo" ? "실행 취소" : "다시 실행"}
      aria-description="길게 누르면 여러 단계를 연속으로 이동해요."
      aria-keyshortcuts={
        direction === "undo" ? "Meta+Z Control+Z" : "Meta+Shift+Z Control+Shift+Z Control+Y"
      }
      title={
        direction === "undo"
          ? "실행 취소 (⌘/Ctrl+Z) · 길게 누르면 연속 취소"
          : "다시 실행 (⌘/Ctrl+Shift+Z, Ctrl+Y) · 길게 누르면 연속 실행"
      }
      disabled={disabled}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0 || !event.isPrimary || pressed.current) return;
        suppressClick.current = false;
        pressed.current = { pointerId: event.pointerId, button: event.currentTarget };
        event.currentTarget.setPointerCapture(event.pointerId);
        timer.current = setTimeout(function repeat() {
          const pointer = pressed.current;
          if (
            !pointer ||
            pointer.button.disabled ||
            !pointer.button.isConnected ||
            !pointer.button.hasPointerCapture(pointer.pointerId) ||
            document.hidden
          ) {
            stop(true);
            return;
          }
          suppressClick.current = true;
          restore.current();
          timer.current = setTimeout(repeat, 150);
        }, 450);
      }}
      onPointerMove={(event) => {
        if (pressed.current?.pointerId !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX >= rect.right ||
          event.clientY < rect.top ||
          event.clientY >= rect.bottom
        )
          stop(true);
      }}
      onPointerUp={(event) => {
        if (pressed.current?.pointerId !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        stop(
          event.clientX < rect.left ||
            event.clientX >= rect.right ||
            event.clientY < rect.top ||
            event.clientY >= rect.bottom,
        );
      }}
      onPointerCancel={(event) => {
        if (pressed.current?.pointerId === event.pointerId) stop(true);
      }}
      onLostPointerCapture={(event) => {
        if (pressed.current?.pointerId === event.pointerId) stop(true);
      }}
      onBlur={() => stop(true)}
      onKeyDown={() => stop(true)}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        stop();
        if (event.detail === 0 || !suppressClick.current) onRestore();
        suppressClick.current = false;
      }}
    >
      <svg
        aria-hidden="true"
        className="size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={
            direction === "undo"
              ? "m9 5-5 5 5 5M4 10h10a6 6 0 0 1 0 12"
              : "m15 5 5 5-5 5m5-5H10a6 6 0 0 0 0 12"
          }
          transform="translate(0 -2)"
        />
      </svg>
    </Button>
  );
}
