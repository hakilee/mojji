import { useEffect, useRef, useState } from "react";
import { ChoiceButton, HelpBubble, Input, Spinner } from "~/components/design-system";
import type { ImageLayer } from "~/lib/emoji";
import { loadImage } from "~/lib/image-upload";

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
        <div className="flex items-center gap-text">
          <label htmlFor="image-upload" className="text-label font-semibold">
            이미지 업로드
          </label>
          <HelpBubble label="이미지 업로드">
            <p>PNG · JPG · WebP · GIF, 최대 12개 · 파일당 5MB. GIF는 첫 프레임을 사용해요.</p>
            <p className="mt-control">레이어 목록은 위쪽 항목이 앞에 표시돼요.</p>
          </HelpBubble>
        </div>
        <Input
          id="image-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={loading || images.length >= 12}
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
        {[
          ...images.filter((image) => !image.behindText).toReversed(),
          "text" as const,
          ...images.filter((image) => image.behindText).toReversed(),
        ].map((image) =>
          image === "text" ? (
            <ChoiceButton
              key="text"
              className="w-full text-left"
              selected={selectedId === "text"}
              onClick={() => onSelect(selectedId === "text" ? null : "text")}
            >
              텍스트
            </ChoiceButton>
          ) : (
            <ChoiceButton
              key={image.id}
              title={image.name}
              className="flex w-full items-center justify-between gap-control text-left"
              selected={selectedId === image.id}
              onClick={() => onSelect(selectedId === image.id ? null : image.id)}
            >
              <span className="min-w-0 truncate">
                {images.indexOf(image) + 1}. {image.name}
              </span>
              <span className="shrink-0 text-caption text-fg-neutral-muted">
                {image.behindText ? "텍스트 뒤" : "텍스트 앞"}
              </span>
            </ChoiceButton>
          ),
        )}
      </div>
    </div>
  );
}
