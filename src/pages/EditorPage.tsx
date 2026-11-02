import { useEffect, useRef, useState } from "react";
import {
  drawEmoji,
  exportGif,
  constrainText,
  initialSettings,
  motions,
  maxTextCharacters,
  textCharacters,
  validateText,
} from "../lib/emoji";
import type { Settings } from "../lib/emoji";
import { SettingGroup } from "../components/ui/SettingGroup";
import { Spinner } from "../components/ui/Spinner";
import { FontPicker } from "../components/editor/FontPicker";

export function EditorPage() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [settings, setSettings] = useState(initialSettings);
  const [fontLoading, setFontLoading] = useState(false);
  const [draft, setDraft] = useState(initialSettings.text);
  const [reacted, setReacted] = useState(false);
  const composing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const smallCanvas = useRef<HTMLCanvasElement>(null);
  const invalid = validateText(settings.text);
  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }));
    setStatus("");
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", onChange);
    onChange();
    return () => preference.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let active = true;
    let frame = 0;
    async function start() {
      await document.fonts.load(`40px "${settings.font}"`, settings.text);
      if (!active) return;
      function render(time: number) {
        const ctx = canvas.current?.getContext("2d");
        const small = smallCanvas.current?.getContext("2d");
        if (ctx && small) {
          drawEmoji(ctx, settings, reducedMotion ? 0 : (time % 1200) / 1200);
          small.clearRect(0, 0, 128, 128);
          small.drawImage(ctx.canvas, 0, 0);
        }
        if (!reducedMotion && settings.motion !== "none") frame = requestAnimationFrame(render);
      }
      frame = requestAnimationFrame(render);
    }
    void start().catch(() => {
      if (active) setStatus("폰트를 불러오지 못했어요. 페이지를 새로고침해 주세요.");
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [settings, reducedMotion]);

  async function download() {
    setBusy(true);
    setStatus("GIF를 만들고 있어요…");
    try {
      await document.fonts.load(`40px "${settings.font}"`, settings.text);
      const output = document.createElement("canvas");
      output.width = 128;
      output.height = 128;
      const ctx = output.getContext("2d");
      if (!ctx) throw new Error("이 브라우저에서는 이미지를 만들 수 없어요.");
      const blob = await exportGif(ctx, settings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "slackmoji.gif";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setStatus(`다운로드 완료 · ${(blob.size / 1024).toFixed(1)} KB`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "GIF 생성에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px] px-8 max-[760px]:px-4">
      <a
        className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation fixed top-2 left-2 z-10 -translate-y-[200%] rounded-control bg-bg-layer-default p-3 text-fg-brand focus:translate-y-0"
        href="#editor-main"
      >
        편집기로 건너뛰기
      </a>
      <header className="flex h-24 items-center max-[760px]:h-[76px]">
        <a
          className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation inline-flex rounded-control [&_img]:max-[760px]:h-[42px] [&_img]:max-[760px]:w-12"
          href="/"
        >
          <img src="/logo.svg" width="64" height="56" alt="슬랙모찌 홈" />
        </a>
      </header>
      <main id="editor-main" tabIndex={-1}>
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-6 max-[760px]:grid-cols-1 max-[760px]:gap-4">
          <section
            className="min-w-0 rounded-panel border border-stroke-neutral bg-bg-layer-default p-6 max-[760px]:p-4"
            aria-label="이모지 편집"
          >
            <div className="mb-6">
              <h1 className="text-lg font-bold tracking-[-0.5px] text-balance scroll-mt-6">
                이모지 에디터
              </h1>
            </div>
            <div className="overflow-hidden rounded-control border border-stroke-neutral-strong bg-bg-neutral-weak focus-within:border-stroke-brand">
              <textarea
                className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-[-3px] [-webkit-tap-highlight-color:transparent] block min-h-36 w-full resize-y border-0 bg-transparent p-4 text-[30px] leading-normal"
                id="text"
                name="emoji-text"
                autoComplete="off"
                aria-label="이모지 텍스트"
                aria-describedby={invalid ? "text-error text-count" : "text-count"}
                aria-invalid={!!invalid}
                value={draft}
                style={{ fontFamily: settings.font }}
                onCompositionStart={() => {
                  composing.current = true;
                }}
                onCompositionEnd={(event) => {
                  composing.current = false;
                  const text = constrainText(event.currentTarget.value);
                  setDraft(text);
                  update({ text, characterColors: undefined });
                  if (text !== event.currentTarget.value)
                    setStatus(`최대 ${maxTextCharacters}자, 3줄까지 입력할 수 있어요.`);
                }}
                onChange={(event) => {
                  if (composing.current) {
                    setDraft(event.target.value);
                    return;
                  }
                  const text = constrainText(event.target.value);
                  setDraft(text);
                  update({ text, characterColors: undefined });
                  if (text !== event.target.value)
                    setStatus(`최대 ${maxTextCharacters}자, 3줄까지 입력할 수 있어요.`);
                }}
                rows={3}
                spellCheck={false}
              />
              <div
                className="flex justify-between gap-2 px-4 py-3 text-xs text-fg-neutral-muted tabular-nums [&>span:first-child]:truncate [&>span:last-child]:shrink-0"
                id="text-count"
              >
                <span>{settings.font}</span>
                <span>
                  {textCharacters(settings.text).length}/{maxTextCharacters} ·{" "}
                  {settings.text.split("\n").length}/3줄
                </span>
              </div>
            </div>
            {invalid && (
              <p id="text-error" className="mt-2 text-xs text-fg-critical">
                {invalid}
              </p>
            )}
            <FontPicker
              font={settings.font}
              onChange={(font) => update({ font })}
              onLoading={setFontLoading}
            />
            <SettingGroup title="색상">
              <div
                className="mb-4 flex gap-1 rounded-control bg-bg-neutral-weak p-1 [&>button]:min-h-9 [&>button]:flex-1 [&>button]:rounded-[7px] [&>button]:border [&>button]:border-transparent [&>button]:bg-transparent [&>button]:text-xs [&>button]:aria-pressed:border-stroke-neutral [&>button]:aria-pressed:bg-bg-layer-default [&>button]:aria-pressed:font-bold"
                aria-label="색상 방식"
              >
                <button
                  className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                  type="button"
                  aria-pressed={!settings.gradient}
                  onClick={() => update({ gradient: undefined })}
                >
                  단색 · 글자별
                </button>
                <button
                  className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                  type="button"
                  aria-pressed={!!settings.gradient}
                  onClick={() =>
                    update({
                      gradient: { end: "#fc6a66", direction: "horizontal" },
                      characterColors: undefined,
                    })
                  }
                >
                  그라데이션
                </button>
              </div>
              <div className="flex flex-wrap gap-4 [&>label]:flex [&>label]:items-center [&>label]:gap-2 [&>label]:text-xs">
                <label>
                  <input
                    className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-[30px] cursor-pointer rounded-md border-0 bg-transparent p-0"
                    type="color"
                    value={settings.color}
                    onChange={(event) =>
                      update({ color: event.target.value, characterColors: undefined })
                    }
                  />
                  {settings.gradient ? "시작색" : "글자색"}
                </label>
                {settings.gradient && (
                  <label>
                    <input
                      className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-[30px] cursor-pointer rounded-md border-0 bg-transparent p-0"
                      type="color"
                      aria-label="그라데이션 끝색"
                      value={settings.gradient.end}
                      onChange={(event) =>
                        update({ gradient: { ...settings.gradient!, end: event.target.value } })
                      }
                    />
                    끝색
                  </label>
                )}
                <label>
                  <input
                    className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-[30px] cursor-pointer rounded-md border-0 bg-transparent p-0"
                    type="color"
                    value={settings.background}
                    disabled={settings.transparent}
                    onChange={(event) => update({ background: event.target.value })}
                  />
                  배경색
                </label>
              </div>
              {settings.gradient && (
                <label className="mt-4 flex items-center gap-3 text-xs [&>select]:w-auto [&>select]:flex-1">
                  방향
                  <select
                    className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation min-h-[42px] w-full rounded-control border border-stroke-neutral-strong bg-bg-layer-default px-3 py-2"
                    value={settings.gradient.direction}
                    onChange={(event) =>
                      update({
                        gradient: {
                          ...settings.gradient!,
                          direction: event.target.value as "horizontal" | "vertical",
                        },
                      })
                    }
                  >
                    <option value="horizontal">가로 →</option>
                    <option value="vertical">세로 ↓</option>
                  </select>
                </label>
              )}
              {!settings.gradient && (
                <div
                  className="mt-4 flex flex-wrap gap-2 [&>label]:flex [&>label]:items-center [&>label]:gap-2 [&>label]:rounded-control [&>label]:border [&>label]:border-stroke-neutral [&>label]:px-2 [&>label]:py-1 [&_input]:size-6"
                  aria-label="글자별 색상"
                >
                  {textCharacters(settings.text).map(
                    (character, index) =>
                      character.trim() && (
                        <label key={index}>
                          <span>{character}</span>
                          <input
                            className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-[30px] cursor-pointer rounded-md border-0 bg-transparent p-0"
                            type="color"
                            aria-label={`${index + 1}번째 글자 ${character} 색상`}
                            value={settings.characterColors?.[index] ?? settings.color}
                            onChange={(event) =>
                              update({
                                characterColors: {
                                  ...settings.characterColors,
                                  [index]: event.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      ),
                  )}
                </div>
              )}
              <label className="mt-4 flex items-center gap-2 rounded-control bg-bg-neutral-weak p-3 text-xs">
                <input
                  className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-4 accent-fg-brand"
                  type="checkbox"
                  checked={settings.transparent}
                  onChange={(event) => update({ transparent: event.target.checked })}
                />
                투명 배경으로 만들기
              </label>
            </SettingGroup>
            <SettingGroup title="모션 효과">
              <div className="grid grid-cols-3 gap-2 [&>button]:flex [&>button]:flex-col [&>button]:items-center [&>button]:gap-1 [&>button]:rounded-control [&>button]:border [&>button]:border-stroke-neutral [&>button]:bg-bg-layer-default [&>button]:px-1 [&>button]:py-3 [&>button]:text-xs [&>button]:hover:border-stroke-brand [&>button]:aria-pressed:border-stroke-brand [&>button]:aria-pressed:bg-bg-brand-weak [&>button>span]:text-[22px] [&>button>span]:leading-[1.2]">
                {Object.entries(motions).map(([motion, label], index) => (
                  <button
                    className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                    key={motion}
                    type="button"
                    aria-pressed={settings.motion === motion}
                    onClick={() => update({ motion: motion as Settings["motion"] })}
                  >
                    <span aria-hidden="true">
                      {["—", "↗", "↕", "↔", "〰", "↻", "◌", "⌁", "≈"][index]}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </SettingGroup>
          </section>
          <section
            className="min-w-0 rounded-panel border border-stroke-neutral bg-bg-layer-default p-6 max-[760px]:p-4 sticky top-6 max-[760px]:static"
            aria-label="미리보기"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-[-0.5px] text-balance scroll-mt-6">
                미리보기
              </h2>
            </div>
            <div className="overflow-hidden rounded-control border border-stroke-neutral">
              <div className="flex items-center gap-2 border-b border-stroke-neutral px-4 py-3 font-bold [&>span]:text-fg-neutral-muted">
                <span>#</span> 우리-팀
              </div>
              <div className="flex gap-3 px-4 py-6 text-[13px] [&_strong]:font-bold [&_strong_span]:ml-1 [&_strong_span]:text-[10px] [&_strong_span]:font-normal [&_strong_span]:text-fg-neutral-muted [&_p]:mt-1 [&_p]:mb-3 [&_p]:wrap-anywhere">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg-positive-weak font-bold text-fg-positive">
                  나
                </div>
                <div className="min-w-0">
                  <strong>
                    나 <span>오전 10:24</span>
                  </strong>
                  <p>오늘도 잘 부탁드려요!</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-transparent bg-bg-layer-basement px-2 py-1 text-sm leading-none tabular-nums"
                      aria-label="엄지 반응"
                    >
                      <span className="inline-flex size-[22px] items-center justify-center text-[22px]">
                        👍🏻
                      </span>{" "}
                      <span>1</span>
                    </span>
                    <button
                      className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed inline-flex h-8 items-center justify-center gap-1 rounded-full border border-transparent bg-bg-layer-basement px-2 py-1 text-sm leading-none tabular-nums hover:border-stroke-brand [&>canvas]:size-[22px]"
                      type="button"
                      aria-label={`내 이모지 반응 ${reacted ? 4 : 3}개`}
                      aria-pressed={reacted}
                      onClick={() => setReacted((value) => !value)}
                    >
                      <canvas
                        ref={smallCanvas}
                        width={128}
                        height={128}
                        aria-label="슬랙 반응 크기 미리보기"
                      />
                      <span>{reacted ? 4 : 3}</span>
                    </button>
                    <span
                      className="inline-flex h-8 items-center justify-center rounded-full bg-bg-layer-basement px-2 text-fg-neutral"
                      aria-hidden="true"
                    >
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 12a8 8 0 1 1-8-8h1M19 2v6m-3-3h6" />
                        <path d="M8.5 14a3.8 3.8 0 0 0 7 0" />
                        <circle cx="9" cy="10" r=".7" fill="currentColor" stroke="none" />
                        <circle cx="15" cy="10" r=".7" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 py-6">
              <div className="aspect-square w-32 rounded-control bg-bg-checker-base bg-[conic-gradient(var(--color-bg-checker-tile)_25%,transparent_0_50%,var(--color-bg-checker-tile)_0_75%,transparent_0)] bg-size-[16px_16px] [&>canvas]:h-auto [&>canvas]:w-full">
                <canvas ref={canvas} width={128} height={128} aria-label="이모지 확대 미리보기" />
              </div>
              <span className="mt-2 text-xs text-fg-neutral-muted">크게 보기</span>
            </div>
            <button
              className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-transparent bg-bg-brand-solid px-4 py-2 font-semibold text-fg-on-brand-solid enabled:hover:bg-bg-brand-solid-pressed enabled:active:bg-bg-brand-solid-pressed disabled:bg-bg-disabled disabled:text-fg-disabled"
              aria-busy={busy}
              disabled={!!invalid || busy || fontLoading}
              onClick={() => void download()}
            >
              {busy && <Spinner />}
              {busy ? "만드는 중…" : "GIF 다운로드"}
            </button>
            <p role="status" className="text-center text-xs text-fg-neutral-muted not-empty:mt-3">
              {status}
            </p>
          </section>
        </div>
      </main>
      <footer className="py-8">
        <img className="block" src="/logo.svg" width="32" height="28" alt="슬랙모찌" />
      </footer>
    </div>
  );
}
