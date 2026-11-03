import {
  Accordion,
  AccordionItem,
  Checkbox,
  ColorPicker,
  MotionIcon,
  SegmentedControl,
  Spinner,
} from "~/components/design-system";
import { useEffect, useRef, useState } from "react";
import {
  drawEmoji,
  exportGif,
  constrainText,
  initialSettings,
  motions,
  motionFrameDelays,
  maxTextCharacters,
  textCharacters,
  validateText,
} from "../lib/emoji";
import type { Settings } from "../lib/emoji";
import { FontPicker } from "~/components/editor/FontPicker";

export function EditorPage() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [settings, setSettings] = useState(initialSettings);
  const [fontLoading, setFontLoading] = useState(false);
  const [draft, setDraft] = useState(initialSettings.text);
  const [reacted, setReacted] = useState(true);
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
      const startedAt = performance.now();
      const duration = motionFrameDelays[settings.speed] * 20;
      function render(time: number) {
        const ctx = canvas.current?.getContext("2d");
        const small = smallCanvas.current?.getContext("2d");
        if (ctx && small) {
          drawEmoji(
            ctx,
            settings,
            reducedMotion
              ? 0
              : Math.max(0, ((time - startedAt) % (duration + settings.delay)) - settings.delay) /
                  duration,
          );
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
    <div className="mx-auto max-w-[1200px] px-page py-section max-[760px]:px-3 max-[760px]:py-3">
      <a
        className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation fixed top-2 left-2 z-10 -translate-y-[200%] rounded-control bg-bg-layer-default p-3 text-fg-brand focus:translate-y-0"
        href="#editor-main"
      >
        편집기로 건너뛰기
      </a>
      <main
        id="editor-main"
        tabIndex={-1}
        className="rounded-panel border border-stroke-neutral bg-bg-layer-default"
      >
        <header className="flex items-center gap-control border-b border-stroke-neutral p-panel">
          <a
            className="inline-flex shrink-0 rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stroke-focus"
            href="/"
            aria-label="슬랙모찌 홈"
          >
            <img src="/logo.svg" width="48" height="42" alt="" />
          </a>
          <h1 className="text-title font-semibold tracking-[-0.5px]">슬랙모찌</h1>
        </header>
        <div className="grid grid-cols-3 items-start gap-section p-panel max-[1000px]:grid-cols-1">
          <section className="min-w-0" aria-label="이모지 편집">
            <h2 className="mb-section text-body font-semibold">텍스트 편집</h2>
            <div className="min-w-0">
              <div className="overflow-hidden rounded-control border border-stroke-neutral-strong bg-bg-neutral-weak transition-shadow focus-within:border-stroke-brand focus-within:ring-2 focus-within:ring-stroke-focus/20 motion-reduce:transition-none">
                <div className="@container relative aspect-square">
                  <textarea
                    className="focus-visible:outline-none [-webkit-tap-highlight-color:transparent] absolute inset-0 size-full resize-none overflow-hidden border-0 bg-transparent px-4 text-center text-[min(30px,8cqw)] leading-[1.5]"
                    id="text"
                    name="emoji-text"
                    autoComplete="off"
                    aria-label="이모지 텍스트"
                    aria-describedby={invalid ? "text-error text-count" : "text-count"}
                    aria-invalid={!!invalid}
                    value={draft}
                    style={{
                      fontFamily: `"${settings.font}"`,
                      paddingBlock: `max(1rem, calc((100cqw - ${draft.split("\n").length} * 1.5em) / 2))`,
                    }}
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
                    rows={Math.max(1, draft.split("\n").length)}
                    wrap="off"
                    spellCheck={false}
                  />
                </div>
              </div>
              <div
                className="mt-control flex justify-between gap-control px-1 text-caption text-fg-neutral-muted tabular-nums [&>span:first-child]:truncate [&>span:last-child]:shrink-0"
                id="text-count"
              >
                <span>{settings.font}</span>
                <span>
                  {textCharacters(settings.text).length}/{maxTextCharacters} ·{" "}
                  {settings.text.split("\n").length}/3줄
                </span>
              </div>
              {invalid && (
                <p id="text-error" className="mt-2 text-caption text-fg-critical">
                  {invalid}
                </p>
              )}
            </div>
          </section>
          <section aria-label="이모지 설정" className="min-w-0 pt-10 max-[1000px]:pt-0">
            <Accordion className="space-y-control" multiple keepMounted defaultValue={["motion"]}>
              <AccordionItem value="font" title="글꼴">
                <FontPicker
                  font={settings.font}
                  onChange={(font) => update({ font })}
                  onLoading={setFontLoading}
                />
              </AccordionItem>
              <AccordionItem value="color" title="색상">
                <div className="mb-4">
                  <SegmentedControl
                    label="색상 방식"
                    value={settings.gradient ? "gradient" : "solid"}
                    options={[
                      { value: "solid", label: "단색 · 글자별" },
                      { value: "gradient", label: "그라데이션" },
                    ]}
                    onChange={(value) =>
                      update(
                        value === "gradient"
                          ? {
                              gradient: { end: "#fc6a66", direction: "horizontal" },
                              characterColors: undefined,
                            }
                          : { gradient: undefined },
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-control">
                  <ColorPicker
                    label={settings.gradient ? "시작색" : "글자색"}
                    value={settings.color}
                    onChange={(color) => update({ color, characterColors: undefined })}
                  />
                  {settings.gradient && (
                    <ColorPicker
                      label="끝색"
                      value={settings.gradient.end}
                      onChange={(end) => update({ gradient: { ...settings.gradient!, end } })}
                    />
                  )}
                  <ColorPicker
                    label="배경색"
                    value={settings.background}
                    disabled={settings.transparent}
                    onChange={(background) => update({ background })}
                  />
                </div>
                {settings.gradient && (
                  <label className="mt-4 flex items-center gap-3 text-caption [&>select]:w-auto [&>select]:flex-1">
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
                  <div className="mt-4 flex flex-wrap gap-control" aria-label="글자별 색상">
                    {textCharacters(settings.text).map(
                      (character, index) =>
                        character.trim() && (
                          <ColorPicker
                            key={index}
                            label={`${index + 1}번째 글자 ${character} 색상`}
                            displayLabel={character}
                            value={settings.characterColors?.[index] ?? settings.color}
                            onChange={(color) =>
                              update({
                                characterColors: { ...settings.characterColors, [index]: color },
                              })
                            }
                          />
                        ),
                    )}
                  </div>
                )}
                <div className="mt-4 rounded-control bg-bg-neutral-weak px-3">
                  <Checkbox
                    label="투명 배경으로 만들기"
                    checked={settings.transparent}
                    onCheckedChange={(transparent) => update({ transparent })}
                  />
                </div>
              </AccordionItem>
              <AccordionItem value="motion" title="효과">
                <div className="grid grid-cols-3 gap-2 [&>button]:flex [&>button]:flex-col [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-control [&>button]:border [&>button]:border-stroke-neutral [&>button]:bg-bg-layer-default [&>button]:px-1 [&>button]:min-h-20 [&>button]:py-4 [&>button]:text-caption [&>button]:hover:border-stroke-brand [&>button]:aria-pressed:border-stroke-brand [&>button]:aria-pressed:bg-bg-brand-weak">
                  {Object.entries(motions).map(([motion, label]) => (
                    <button
                      className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                      key={motion}
                      type="button"
                      aria-pressed={settings.motion === motion}
                      onClick={() => update({ motion: motion as Settings["motion"] })}
                    >
                      <MotionIcon motion={motion as Settings["motion"]} />
                      {label}
                    </button>
                  ))}
                </div>
                <fieldset
                  disabled={settings.motion === "none"}
                  className="mt-4 space-y-4 border-0 p-0 disabled:opacity-50"
                >
                  <legend className="sr-only">모션 타이밍</legend>
                  <label className="flex items-center justify-between gap-control text-label">
                    속도
                    <select
                      className="min-h-10 rounded-control border border-stroke-neutral bg-bg-layer-default px-3 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed"
                      value={settings.speed}
                      onChange={(event) =>
                        update({ speed: Number(event.target.value) as Settings["speed"] })
                      }
                    >
                      {Object.keys(motionFrameDelays)
                        .sort((a, b) => Number(a) - Number(b))
                        .map((speed) => (
                          <option key={speed} value={speed}>
                            {speed}×
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="space-y-control">
                    <div className="flex items-center justify-between gap-control text-label">
                      <label htmlFor="motion-delay">반복 딜레이</label>
                      <output htmlFor="motion-delay" className="tabular-nums text-fg-neutral-muted">
                        {(settings.delay / 1000).toFixed(1)}초
                      </output>
                    </div>
                    <input
                      id="motion-delay"
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={settings.delay}
                      aria-valuetext={`${(settings.delay / 1000).toFixed(1)}초`}
                      className="block h-6 w-full cursor-pointer accent-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed"
                      onChange={(event) => update({ delay: event.target.valueAsNumber })}
                    />
                  </div>
                </fieldset>
              </AccordionItem>
            </Accordion>
          </section>
          <section className="flex min-w-0 flex-col" aria-label="미리보기">
            <h2 className="mb-section text-body font-semibold">미리보기</h2>
            <div className="grid flex-1 grid-rows-2 divide-y divide-stroke-neutral">
              <section
                aria-label="슬랙 메시지 미리보기"
                className="flex min-h-48 items-center justify-center py-8"
              >
                <div className="flex items-start gap-2 text-[15px]">
                  <img
                    src="/profile-flower.svg"
                    alt=""
                    width="36"
                    height="36"
                    className="size-9 shrink-0 rounded-lg bg-bg-neutral-weak"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 leading-5">
                      <strong className="font-semibold">Haki (하키)</strong>
                      <time className="text-caption text-fg-neutral-muted" dateTime="00:54">
                        오전 12:54
                      </time>
                    </div>
                    <p className="mb-px text-base leading-[22px] wrap-anywhere">안녕하세요.</p>
                    <div className="flex flex-wrap items-center gap-0.5">
                      <span
                        className="inline-flex h-[26px] items-center justify-center gap-1 rounded-full border border-stroke-reaction bg-bg-reaction px-2 py-0.5 text-caption font-semibold leading-none text-fg-reaction tabular-nums"
                        aria-label="엄지 반응"
                      >
                        <span className="inline-flex size-4 items-center justify-center text-base">
                          👍🏻
                        </span>{" "}
                        <span>1</span>
                      </span>
                      <button
                        className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-reaction aria-pressed:bg-bg-reaction aria-pressed:text-fg-reaction inline-flex h-[26px] items-center justify-center gap-1 rounded-full border border-transparent bg-bg-layer-basement px-2 py-0.5 text-caption font-semibold leading-none tabular-nums hover:border-stroke-reaction [&>canvas]:size-4"
                        type="button"
                        aria-label={`내 이모지 반응 ${reacted ? 1 : 0}개`}
                        aria-pressed={reacted}
                        onClick={() => setReacted((value) => !value)}
                      >
                        <canvas
                          ref={smallCanvas}
                          width={128}
                          height={128}
                          aria-label="슬랙 반응 크기 미리보기"
                        />
                        <span>{reacted ? 1 : 0}</span>
                      </button>
                      <span
                        className="inline-flex h-6 items-center justify-center rounded-full bg-bg-layer-basement px-2 text-fg-neutral"
                        aria-hidden="true"
                      >
                        <svg
                          className="size-5"
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
              </section>
              <section
                aria-label="확대 미리보기"
                className="flex min-h-48 items-center justify-center py-8"
              >
                <div className="aspect-square w-32 rounded-control bg-bg-checker-base bg-[conic-gradient(var(--color-bg-checker-tile)_25%,transparent_0_50%,var(--color-bg-checker-tile)_0_75%,transparent_0)] bg-size-[16px_16px] [&>canvas]:h-auto [&>canvas]:w-full">
                  <canvas ref={canvas} width={128} height={128} aria-label="이모지 확대 미리보기" />
                </div>
              </section>
            </div>
            <footer className="flex flex-col items-center gap-3 border-t border-stroke-neutral pt-4">
              <p role="status" className="text-caption text-fg-neutral-muted empty:hidden">
                {status}
              </p>
              <button
                className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand flex min-h-11 min-w-40 max-[760px]:w-full items-center justify-center gap-2 rounded-control border border-transparent bg-bg-brand-solid px-4 py-2 font-semibold text-fg-on-brand-solid enabled:hover:bg-bg-brand-solid-pressed enabled:active:bg-bg-brand-solid-pressed disabled:bg-bg-disabled disabled:text-fg-disabled"
                aria-busy={busy}
                disabled={!!invalid || busy || fontLoading}
                onClick={() => void download()}
              >
                {busy && <Spinner />}
                {busy ? "만드는 중…" : "GIF 다운로드"}
              </button>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}
