import { useEffect, useRef, useState } from "react";
import { RangeField, SegmentedControl, Spinner } from "~/components/design-system";
import type { ImageLayer, Settings } from "~/lib/emoji";
import { loadImage } from "~/lib/image-upload";

const actionClass =
  "min-h-control-size cursor-pointer rounded-control border border-stroke-neutral px-inset text-label hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed disabled:text-fg-disabled";

export function LayerEditor({
  images,
  textLayout,
  selectedId,
  onSelect,
  onImagesChange,
  onAdd,
  onTextLayoutChange,
}: {
  images: ImageLayer[];
  textLayout: Settings["textLayout"];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onImagesChange: (images: ImageLayer[]) => void;
  onAdd: (images: ImageLayer[]) => void;
  onTextLayoutChange: (layout: Settings["textLayout"]) => void;
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
  const selected = images.find((image) => image.id === selectedId);
  function changeImage(patch: Partial<ImageLayer>) {
    onImagesChange(
      images.map((image) => (image.id === selectedId ? { ...image, ...patch } : image)),
    );
  }
  const layout = textLayout ?? { x: 64, y: 64, scale: 1 };
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
      {(selected || selectedId === "text") && (
        <div className="space-y-group">
          <p className="text-caption text-fg-neutral-muted">
            선택한 레이어는 왼쪽 작업 캔버스에서 드래그할 수 있어요.
          </p>
          <div className="grid grid-cols-3 gap-control">
            {[
              { label: "상단", y: 24 },
              { label: "중앙", y: 64 },
              { label: "하단", y: 104 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={actionClass}
                onClick={() =>
                  selected
                    ? changeImage({ x: 64, y: preset.y })
                    : onTextLayoutChange({ ...layout, x: 64, y: preset.y })
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
          <RangeField
            label="가로 위치"
            min={0}
            max={128}
            value={selected?.x ?? layout.x}
            onChange={(x) => (selected ? changeImage({ x }) : onTextLayoutChange({ ...layout, x }))}
          />
          <RangeField
            label="세로 위치"
            min={0}
            max={128}
            value={selected?.y ?? layout.y}
            onChange={(y) => (selected ? changeImage({ y }) : onTextLayoutChange({ ...layout, y }))}
          />
          {selected ? (
            <>
              <RangeField
                label="이미지 크기"
                min={8}
                max={256}
                value={selected.size}
                suffix="px"
                onChange={(size) => changeImage({ size })}
              />
              <RangeField
                label="회전"
                min={-180}
                max={180}
                value={selected.rotation}
                suffix="°"
                onChange={(rotation) => changeImage({ rotation })}
              />
              <SegmentedControl
                label="이미지 맞춤"
                value={selected.fit}
                options={[
                  { value: "contain", label: "비율 유지" },
                  { value: "cover", label: "정사각 채우기" },
                ]}
                onChange={(fit) => changeImage({ fit })}
              />
              <SegmentedControl
                label="텍스트와의 순서"
                value={selected.behindText ? "behind" : "front"}
                options={[
                  { value: "behind", label: "텍스트 뒤" },
                  { value: "front", label: "텍스트 앞" },
                ]}
                onChange={(value) => changeImage({ behindText: value === "behind" })}
              />
              <div className="grid grid-cols-2 gap-control">
                {[
                  { label: "이미지 앞으로", direction: 1 },
                  { label: "이미지 뒤로", direction: -1 },
                ].map(({ label, direction }) => {
                  const siblings = images.filter(
                    (image) => image.behindText === selected.behindText,
                  );
                  const index = siblings.indexOf(selected);
                  const target = siblings[index + direction];
                  return (
                    <button
                      key={label}
                      type="button"
                      className={actionClass}
                      disabled={!target}
                      onClick={() => {
                        const reordered = [...images];
                        const from = images.indexOf(selected);
                        const to = images.indexOf(target);
                        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
                        onImagesChange(reordered);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className={`${actionClass} w-full`}
                onClick={() =>
                  changeImage({
                    x: 64,
                    y: 64,
                    size: 128,
                    rotation: 0,
                    behindText: true,
                    fit: "cover",
                  })
                }
              >
                배경 채우기
              </button>
              <button
                type="button"
                className={`${actionClass} w-full text-fg-critical`}
                onClick={() => {
                  onImagesChange(images.filter((image) => image.id !== selectedId));
                  onSelect(null);
                }}
              >
                선택 이미지 삭제
              </button>
            </>
          ) : (
            <>
              <RangeField
                label="텍스트 크기"
                min={10}
                max={150}
                suffix="%"
                value={Math.round(layout.scale * 100)}
                onChange={(scale) => onTextLayoutChange({ ...layout, scale: scale / 100 })}
              />
              <button
                type="button"
                className={`${actionClass} w-full`}
                onClick={() => onTextLayoutChange(undefined)}
              >
                텍스트 배치 초기화
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
