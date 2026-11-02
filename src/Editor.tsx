import { useEffect, useRef, useState } from "react";
import {
  drawEmoji,
  exportGif,
  constrainText,
  initialSettings,
  motions,
  textCharacters,
  validateText,
} from "./emoji";
import type { Settings } from "./emoji";
import { SettingGroup } from "./SettingGroup";
import { FontPicker } from "./FontPicker";

export function Editor() {
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
    <div className="shell">
      <a className="skip-link" href="#editor-main">
        편집기로 건너뛰기
      </a>
      <header className="flex items-center">
        <a className="brand" href="/">
          <img src="/logo.svg" width="64" height="56" alt="슬랙모찌 홈" />
        </a>
      </header>
      <main id="editor-main" tabIndex={-1}>
        <div className="workspace">
          <section className="panel controls" aria-label="이모지 편집">
            <div className="section-title">
              <h1>이모지 에디터</h1>
            </div>
            <div className="text-editor">
              <textarea
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
                    setStatus("40자, 3줄까지만 입력할 수 있어요.");
                }}
                onChange={(event) => {
                  if (composing.current) {
                    setDraft(event.target.value);
                    return;
                  }
                  const text = constrainText(event.target.value);
                  setDraft(text);
                  update({ text, characterColors: undefined });
                  if (text !== event.target.value) setStatus("40자, 3줄까지만 입력할 수 있어요.");
                }}
                rows={3}
                spellCheck={false}
              />
              <div className="editor-meta" id="text-count">
                <span>{settings.font}</span>
                <span>
                  {textCharacters(settings.text).length}/40 · {settings.text.split("\n").length}/3줄
                </span>
              </div>
            </div>
            {invalid && (
              <p id="text-error" className="error">
                {invalid}
              </p>
            )}
            <FontPicker
              font={settings.font}
              onChange={(font) => update({ font })}
              onLoading={setFontLoading}
            />
            <SettingGroup title="색상">
              <div className="segmented" aria-label="색상 방식">
                <button
                  type="button"
                  aria-pressed={!settings.gradient}
                  onClick={() => update({ gradient: undefined })}
                >
                  단색 · 글자별
                </button>
                <button
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
              <div className="colors">
                <label>
                  <input
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
                    type="color"
                    value={settings.background}
                    disabled={settings.transparent}
                    onChange={(event) => update({ background: event.target.value })}
                  />
                  배경색
                </label>
              </div>
              {settings.gradient && (
                <label className="select-field">
                  방향
                  <select
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
                <div className="character-colors" aria-label="글자별 색상">
                  {textCharacters(settings.text).map(
                    (character, index) =>
                      character.trim() && (
                        <label key={index}>
                          <span>{character}</span>
                          <input
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
              <label className="check">
                <input
                  type="checkbox"
                  checked={settings.transparent}
                  onChange={(event) => update({ transparent: event.target.checked })}
                />
                투명 배경으로 만들기
              </label>
            </SettingGroup>
            <SettingGroup title="모션 효과">
              <div className="motion-options">
                {Object.entries(motions).map(([motion, label], index) => (
                  <button
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
          <section className="panel preview" aria-label="미리보기">
            <div className="section-title">
              <h2>미리보기</h2>
            </div>
            <div className="slack-preview">
              <div className="channel-name">
                <span>#</span> 우리-팀
              </div>
              <div className="message">
                <div className="avatar">나</div>
                <div className="message-body">
                  <strong>
                    나 <span>오전 10:24</span>
                  </strong>
                  <p>오늘도 잘 부탁드려요!</p>
                  <div className="reactions">
                    <span className="reaction" aria-label="박수 반응">
                      👏 <span>2</span>
                    </span>
                    <button
                      className="reaction custom-reaction"
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
                    <span className="add-reaction" aria-hidden="true">
                      ☺ +
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="detail-preview">
              <div className="checker">
                <canvas ref={canvas} width={128} height={128} aria-label="이모지 확대 미리보기" />
              </div>
              <span className="field-hint">크게 보기</span>
            </div>
            <button
              className="button download"
              disabled={!!invalid || busy || fontLoading}
              onClick={() => void download()}
            >
              {busy ? "만드는 중…" : "GIF 다운로드"}
            </button>
            <p role="status" className="status">
              {status}
            </p>
          </section>
        </div>
      </main>
      <footer>
        <img className="footer-logo" src="/logo.svg" width="32" height="28" alt="슬랙모찌" />
      </footer>
    </div>
  );
}
