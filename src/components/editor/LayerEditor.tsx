import { useEffect, useRef, useState } from "react";
import { Button, ChoiceButton, HelpBubble, Input, Spinner } from "~/components/design-system";
import type { ImageLayer, Layer } from "~/lib/emoji";
import { loadImage } from "~/lib/image-upload";

export function LayerEditor({
  layers,
  onAddText,
  selectedId,
  onSelect,
  onAdd,
}: {
  layers: Layer[];
  onAddText: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (images: ImageLayer[]) => void;
}) {
  const images = layers.filter((layer) => layer.type === "image");
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
    <div id="layer-stack" className="mt-group space-y-inset">
      <div className="grid grid-cols-2 gap-control">
        <Button variant="white" size="small" onClick={onAddText}>
          텍스트 추가
        </Button>
        <Button
          variant="white"
          size="small"
          disabled={loading || images.length >= 12}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          이미지 추가
        </Button>
      </div>
      <div className="space-y-control">
        <div className="flex items-center gap-1">
          <h3 className="text-label font-semibold">레이어</h3>
          <HelpBubble label="레이어">
            <p>
              위쪽 레이어가 앞에 표시돼요. 레이어를 선택해 내용과 스타일, 순서를 바꿀 수 있어요.
            </p>
            <p className="mt-control">
              이미지는 PNG · JPG · WebP · GIF, 최대 12개 · 파일당 5MB. GIF는 첫 프레임을 사용해요.
            </p>
          </HelpBubble>
        </div>
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          aria-label="이미지 업로드"
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
        {layers.toReversed().map((layer) => (
          <ChoiceButton
            key={layer.id}
            aria-label={`${layer.type === "text" ? "텍스트" : "이미지"} 레이어 선택: ${layer.type === "text" ? layer.text.trim() || "빈 텍스트" : layer.name}`}
            className="flex w-full items-center gap-inset text-left"
            selected={selectedId === layer.id}
            onClick={(event) => {
              onSelect(layer.id);
              if (event.detail === 0)
                requestAnimationFrame(() => document.getElementById("layer-controls")?.focus());
            }}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-control-inset bg-bg-neutral-weak text-label font-semibold"
            >
              {layer.type === "text" ? "T" : "▧"}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block truncate text-label"
                style={layer.type === "text" ? { fontFamily: `"${layer.font}"` } : undefined}
              >
                {layer.type === "text" ? layer.text.trim() || "빈 텍스트" : layer.name}
              </span>
              <span className="block truncate text-caption text-fg-neutral-muted">
                {layer.type === "text" ? (layer.fontLabel ?? layer.font) : "이미지"}
              </span>
            </span>
          </ChoiceButton>
        ))}
        {!layers.length && (
          <p className="px-inset py-group text-caption text-fg-neutral-muted">
            텍스트나 이미지를 추가해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
