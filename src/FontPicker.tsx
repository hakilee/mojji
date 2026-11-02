import { startTransition, useDeferredValue, useState, ViewTransition } from "react";
import { fonts } from "./emoji";
import { SettingGroup } from "./SettingGroup";

export function FontPicker({
  font,
  onChange,
  onLoading,
}: {
  font: string;
  onChange: (font: string) => void;
  onLoading: (loading: boolean) => void;
}) {
  const [catalog, setCatalog] = useState<{ family: string; korean: boolean }[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [koreanOnly, setKoreanOnly] = useState(true);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const search = useDeferredValue(query.trim().toLowerCase());
  const results = (catalog ?? []).filter(
    (item) => (!koreanOnly || item.korean) && item.family.toLowerCase().includes(search),
  );

  async function selectFont(family: string) {
    setLoading(family);
    setError("");
    onLoading(true);
    const link = document.createElement("link");
    try {
      if (!(family in fonts)) {
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?${new URLSearchParams({ family, display: "swap" })}`;
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            link.remove();
            reject(new Error("timeout"));
          }, 15000);
          link.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          link.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("network"));
          };
          document.head.append(link);
        });
      }
      let fontTimeout: ReturnType<typeof setTimeout> | undefined;
      const loaded = await Promise.race([
        document.fonts.load(`40px "${family}"`, "가나다Aa"),
        new Promise<never>((_, reject) => {
          fontTimeout = setTimeout(() => reject(new Error("timeout")), 15000);
        }),
      ]).finally(() => clearTimeout(fontTimeout));
      if (!loaded.length) throw new Error("font unavailable");
      onChange(family);
    } catch {
      link.remove();
      setError("글꼴을 불러오지 못했어요. 연결을 확인하거나 기본 글꼴을 선택해 주세요.");
    } finally {
      setLoading("");
      onLoading(false);
    }
  }

  return (
    <SettingGroup title="글꼴">
      <div className="font-options">
        {Object.entries(fonts).map(([family, label]) => (
          <button
            className="font-card"
            key={family}
            type="button"
            disabled={!!loading}
            aria-pressed={font === family}
            onClick={() => {
              setError("");
              onChange(family);
            }}
          >
            <span className="font-specimen" style={{ fontFamily: family }}>
              가나다 Aa
            </span>
            <span>{label}</span>
            <small>{family}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="button button-subtle font-disclosure"
        aria-expanded={expanded}
        aria-controls="font-search-panel"
        onClick={async () => {
          startTransition(() => setExpanded((value) => !value));
          if (catalog || catalogLoading || expanded) return;
          setCatalogLoading(true);
          setError("");
          try {
            const { default: families } = await import("./google-fonts.json");
            startTransition(() => setCatalog(families));
          } catch {
            setError("글꼴 목록을 불러오지 못했어요. Google Fonts를 닫았다가 다시 열어 주세요.");
          } finally {
            setCatalogLoading(false);
          }
        }}
      >
        Google Fonts <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <ViewTransition default="none" enter="font-reveal" exit="font-hide">
          <div className="font-search" id="font-search-panel" aria-busy={catalogLoading}>
            <label className="sr-only" htmlFor="font-search">
              Google Fonts 검색
            </label>
            <input
              id="font-search"
              type="search"
              name="font-search"
              autoComplete="off"
              spellCheck={false}
              placeholder="예: Gaegu…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <label className="check-inline">
              <input
                type="checkbox"
                checked={koreanOnly}
                onChange={(event) => startTransition(() => setKoreanOnly(event.target.checked))}
              />
              한글 지원
            </label>
            <p className="field-hint">선택한 글꼴만 Google에서 불러옵니다.</p>
            <div className="font-results" aria-label="검색 결과">
              {results.slice(0, 40).map(({ family }) => (
                <button
                  key={family}
                  type="button"
                  disabled={!!loading}
                  aria-pressed={font === family}
                  onClick={() => void selectFont(family)}
                >
                  <ViewTransition default="none" update="auto">
                    <span>{family}</span>
                  </ViewTransition>
                  <span>
                    {loading === family ? "불러오는 중…" : font === family ? "선택됨" : "+"}
                  </span>
                </button>
              ))}
              {catalog && !results.length && <p className="field-hint">일치하는 글꼴이 없어요.</p>}
            </div>
            <p className="field-hint" role="status">
              {catalogLoading
                ? "글꼴 목록 불러오는 중…"
                : !catalog
                  ? ""
                  : results.length > 40
                    ? `${results.length}개 중 40개 표시 · 검색어를 더 입력해 주세요.`
                    : `${results.length}개 글꼴`}
            </p>
          </div>
        </ViewTransition>
      )}
      {!(font in fonts) && <p className="field-hint">선택한 글꼴 · {font}</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </SettingGroup>
  );
}
