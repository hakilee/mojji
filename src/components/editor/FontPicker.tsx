import { Spinner } from "~/components/design-system";
import { startTransition, useDeferredValue, useState, ViewTransition } from "react";
import { fonts } from "../../lib/emoji";

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
      if (!fonts.includes(family)) {
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
    <>
      <div className="grid grid-cols-3 gap-2">
        {fonts.map((family) => (
          <button
            className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed flex flex-col items-start gap-1 overflow-hidden rounded-control border border-stroke-neutral bg-bg-layer-default p-3 text-left enabled:hover:border-stroke-brand max-[760px]:p-2 [&_small]:text-[10px] [&_small]:text-fg-neutral-muted [&_small]:wrap-anywhere"
            key={family}
            type="button"
            disabled={!!loading}
            aria-pressed={font === family}
            onClick={() => {
              setError("");
              onChange(family);
            }}
          >
            <span
              className="mb-2 text-[22px] whitespace-nowrap max-[760px]:text-lg"
              style={{ fontFamily: family }}
            >
              가나다 Aa
            </span>
            <small>{family}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed mt-3 flex min-h-[42px] w-full items-center justify-between rounded-control border border-stroke-neutral bg-bg-neutral-weak px-4 py-2 font-semibold hover:border-stroke-brand"
        aria-expanded={expanded}
        aria-controls="font-search-panel"
        onClick={async () => {
          startTransition(() => setExpanded((value) => !value));
          if (catalog || catalogLoading || expanded) return;
          setCatalogLoading(true);
          setError("");
          try {
            const { default: families } = await import("../../data/google-fonts.json");
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
          <div className="mt-3" id="font-search-panel" aria-busy={catalogLoading}>
            <label className="sr-only" htmlFor="font-search">
              Google Fonts 검색
            </label>
            <input
              className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 min-h-[42px] w-full rounded-control border border-stroke-neutral-strong bg-bg-layer-default px-3 py-2"
              id="font-search"
              type="search"
              name="font-search"
              autoComplete="off"
              spellCheck={false}
              placeholder="예: Gaegu…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <label className="mt-3 flex items-center gap-2 text-xs">
              <input
                className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:cursor-not-allowed disabled:opacity-40 size-4 accent-fg-brand"
                type="checkbox"
                checked={koreanOnly}
                onChange={(event) => startTransition(() => setKoreanOnly(event.target.checked))}
              />
              한글 지원
            </label>
            <p className="mt-2 text-xs text-fg-neutral-muted">
              선택한 글꼴만 Google에서 불러옵니다.
            </p>
            <div
              className="mt-3 max-h-60 overflow-y-auto overscroll-contain rounded-control border border-stroke-neutral [&>button]:flex [&>button]:min-h-[42px] [&>button]:w-full [&>button]:items-center [&>button]:justify-between [&>button]:gap-3 [&>button]:border [&>button]:border-transparent [&>button]:bg-bg-layer-default [&>button]:p-3 [&>button]:text-left [&>button]:wrap-anywhere [&>button]:enabled:hover:border-stroke-brand [&>button]:aria-pressed:border-stroke-brand [&>button]:aria-pressed:bg-bg-brand-weak [&>button>span]:text-xs"
              aria-label="검색 결과"
            >
              {results.slice(0, 40).map(({ family }) => (
                <button
                  className="focus-visible:outline-3 focus-visible:outline-stroke-focus focus-visible:outline-offset-3 [-webkit-tap-highlight-color:transparent] cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:bg-bg-disabled disabled:text-fg-disabled aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak aria-pressed:text-fg-brand enabled:active:bg-bg-brand-weak-pressed"
                  key={family}
                  type="button"
                  disabled={!!loading}
                  aria-pressed={font === family}
                  onClick={() => void selectFont(family)}
                >
                  <ViewTransition default="none" update="auto">
                    <span>{family}</span>
                  </ViewTransition>
                  <span className="inline-flex shrink-0 items-center gap-2">
                    {loading === family && <Spinner />}
                    {loading === family ? "불러오는 중…" : font === family ? "선택됨" : "+"}
                  </span>
                </button>
              ))}
              {catalog && !results.length && (
                <p className="mt-2 text-xs text-fg-neutral-muted">일치하는 글꼴이 없어요.</p>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-xs text-fg-neutral-muted" role="status">
              {catalogLoading && <Spinner />}
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
      {!fonts.includes(font) && (
        <p className="mt-2 text-xs text-fg-neutral-muted">선택한 글꼴 · {font}</p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-fg-critical">
          {error}
        </p>
      )}
    </>
  );
}
