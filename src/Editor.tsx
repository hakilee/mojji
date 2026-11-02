import { useEffect, useRef, useState } from "react";
import { drawEmoji, exportGif, fonts, initialSettings, motions, validateText } from "./emoji";
import type { Settings } from "./emoji";

export function Editor() {
  const [settings, setSettings] = useState(initialSettings);
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
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
    let active = true;
    let frame = 0;
    async function start() {
      await document.fonts.load(`40px "${settings.font}"`, settings.text);
      if (!active) return;
      function render(time: number) {
        const ctx = canvas.current?.getContext("2d");
        const small = smallCanvas.current?.getContext("2d");
        if (ctx && small) {
          drawEmoji(ctx, settings, paused ? 0 : (time % 1200) / 1200);
          small.clearRect(0, 0, 128, 128);
          small.drawImage(ctx.canvas, 0, 0);
        }
        if (!paused) frame = requestAnimationFrame(render);
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
  }, [settings, paused]);

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
      <header className="flex items-center justify-between">
        <a className="brand" href="/">
          <img src="/logo.svg" width="64" height="64" alt="슬랙모찌 홈" />
        </a>
        <span className="badge">작은 글자, 큰 리액션</span>
      </header>
      <main>
        <div className="intro">
          <p className="eyebrow">YOUR WORDS, WITH A LITTLE WIGGLE</p>
          <h1>
            말로 다 못한 마음,
            <br />
            <span>이모지로 움직여요.</span>
          </h1>
          <p>나만의 텍스트 GIF를 만들고, 슬랙에 즐거움을 더해 보세요.</p>
        </div>
        <div className="workspace">
          <section className="panel controls" aria-label="이모지 편집">
            <div className="section-title">
              <h2>내 이모지 만들기</h2>
              <span>01 — EDIT</span>
            </div>
            <label className="field-label" htmlFor="text">
              어떤 말을 전할까요?
              <span>{Array.from(settings.text).length}/40</span>
            </label>
            <textarea
              id="text"
              value={settings.text}
              onChange={(event) => update({ text: event.target.value })}
              rows={3}
              aria-describedby={invalid ? "text-error" : undefined}
            />
            {invalid && (
              <p id="text-error" className="error">
                {invalid}
              </p>
            )}
            <fieldset>
              <legend>글꼴</legend>
              <div className="font-options">
                {Object.entries(fonts).map(([font, label]) => (
                  <button
                    key={font}
                    type="button"
                    aria-pressed={settings.font === font}
                    style={{ fontFamily: font }}
                    onClick={() => update({ font: font as Settings["font"] })}
                  >
                    {label}
                    <small>{font}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>컬러</legend>
              <div className="colors">
                <label>
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(event) => update({ color: event.target.value })}
                  />
                  글자색 <span>{settings.color}</span>
                </label>
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
              <label className="check">
                <input
                  type="checkbox"
                  checked={settings.transparent}
                  onChange={(event) => update({ transparent: event.target.checked })}
                />
                투명 배경으로 만들기<span>어디에나 자연스럽게</span>
              </label>
            </fieldset>
            <fieldset>
              <legend>
                모션 효과<span>움직이면 더 재밌죠</span>
              </legend>
              <div className="motion-options">
                {Object.entries(motions).map(([motion, label], index) => (
                  <button
                    key={motion}
                    type="button"
                    aria-pressed={settings.motion === motion}
                    onClick={() => update({ motion: motion as Settings["motion"] })}
                  >
                    <span>{["—", "↗", "↕", "↔", "〰", "↻"][index]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>
          <section className="panel preview" aria-label="미리보기">
            <div className="section-title">
              <h2>미리보기</h2>
              <span className="live">● LIVE</span>
            </div>
            <div className="checker">
              <span className="canvas-note">마음을 담는 128 × 128</span>
              <canvas ref={canvas} width={128} height={128} aria-label="이모지 미리보기" />
              <button className="pause" onClick={() => setPaused(!paused)}>
                {paused ? "▶ 재생" : "Ⅱ 일시정지"}
              </button>
            </div>
            <div className="slack-preview">
              <p>슬랙에서는 이렇게 보여요</p>
              <div className="message">
                <div className="avatar">S</div>
                <div>
                  <strong>
                    나 <span>지금</span>
                  </strong>
                  <p>오늘도 함께해 줘서 고마워요!</p>
                  <canvas
                    ref={smallCanvas}
                    width={128}
                    height={128}
                    aria-label="슬랙 실제 크기 미리보기"
                  />
                </div>
              </div>
            </div>
            <button
              className="download"
              disabled={!!invalid || busy}
              onClick={() => void download()}
            >
              {busy ? "만드는 중…" : "↓ GIF 다운로드"}
              <span>128 × 128 · Slack에 바로 사용</span>
            </button>
            <p role="status" className="status">
              {status || "가입 없이 무료로, 내 브라우저에서 안전하게."}
            </p>
          </section>
        </div>
        <aside className="tip">
          <span>✦</span>
          <div>
            <strong>슬랙에 내 이모지를 추가하는 방법</strong>
            <p>다운로드한 GIF를 슬랙의 이모지 메뉴 → 이모지 추가에서 업로드하세요.</p>
          </div>
          <span className="tip-end">이제 내 마음을 보내요 ↗</span>
        </aside>
      </main>
      <footer>
        <img className="footer-logo" src="/logo.svg" width="32" height="32" alt="슬랙모찌" />
        <span>Made for your everyday reactions.</span>
        <span>텍스트는 서버에 저장되지 않아요.</span>
      </footer>
    </div>
  );
}
