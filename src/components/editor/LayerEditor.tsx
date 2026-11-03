import { useEffect, useRef, useState } from "react";
import { Spinner } from "~/components/design-system";
import type { ImageLayer } from "~/lib/emoji";
import { loadImage } from "~/lib/image-upload";

const actionClass =
  "min-h-control-size cursor-pointer rounded-control border border-stroke-neutral px-inset text-label hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed disabled:text-fg-disabled";

export function LayerEditor({
  images,
  selectedId,
  onSelect,
  onAdd,
}: {
  images: ImageLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (images: ImageLayer[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <div className="space-y-group">
      <div className="space-y-control">
        <label htmlFor="image-upload" className="block text-label font-semibold">
          이미지 업로드
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={loading || images.length >= 12}
          className="block w-full min-w-0 rounded-control border border-stroke-neutral p-inset text-caption file:mr-control file:rounded-control file:border-0 file:bg-bg-neutral-weak file:p-control file:font-semibold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-stroke-focus"
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (!files.length) return;
            setLoading(true);
            setError("");
            const added: ImageLayer[] = [];
            const errors: string[] = [];
            for (const file of files.slice(0, Math.max(0, 12 - images.length))) {
              try {
                added.push(await loadImage(file));
              } catch (error) {
                errors.push(error instanceof Error ? error.message : "이미지를 불러오지 못했어요.");
              }
              if (!mounted.current) return;
            }
            if (added.length) onAdd(added);
            if (files.length > 12 - images.length)
              errors.push("이미지는 최대 12개까지 추가할 수 있어요.");
            setError(errors.join(" "));
            setLoading(false);
          }}
        />
        <p className="text-caption text-fg-neutral-muted">
          PNG · JPG · WebP · GIF, 최대 12개 · 파일당 5MB. GIF는 첫 프레임을 사용해요.
        </p>
        {loading && (
          <p role="status" className="flex items-center gap-control text-caption">
            <Spinner />
            이미지 불러오는 중…
          </p>
        )}
        {error && (
          <p role="alert" className="text-caption text-fg-critical">
            {error}
          </p>
        )}
      </div>
      <div className="space-y-control" role="group" aria-label="레이어 선택">
        <p className="text-caption text-fg-neutral-muted">위쪽 레이어가 앞에 표시돼요.</p>
        {[
          ...images.filter((image) => !image.behindText).toReversed(),
          "text" as const,
          ...images.filter((image) => image.behindText).toReversed(),
        ].map((image) =>
          image === "text" ? (
            <button
              key="text"
              type="button"
              className={`${actionClass} w-full text-left aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak`}
              aria-pressed={selectedId === "text"}
              onClick={() => onSelect(selectedId === "text" ? null : "text")}
            >
              텍스트
            </button>
          ) : (
            <button
              key={image.id}
              type="button"
              title={image.name}
              className={`${actionClass} flex w-full items-center justify-between gap-control text-left aria-pressed:border-stroke-brand aria-pressed:bg-bg-brand-weak`}
              aria-pressed={selectedId === image.id}
              onClick={() => onSelect(selectedId === image.id ? null : image.id)}
            >
              <span className="min-w-0 truncate">
                {images.indexOf(image) + 1}. {image.name}
              </span>
              <span className="shrink-0 text-caption text-fg-neutral-muted">
                {image.behindText ? "텍스트 뒤" : "텍스트 앞"}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
