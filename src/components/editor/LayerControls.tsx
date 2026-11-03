import { FloatingPanel, RangeField, SegmentedControl } from "~/components/design-system";
import type { ImageLayer, Settings } from "~/lib/emoji";
const actionClass =
  "min-h-control-size cursor-pointer rounded-control border border-stroke-neutral px-inset text-label hover:bg-bg-neutral-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus disabled:cursor-not-allowed disabled:text-fg-disabled";
export function LayerControls({
  images,
  textLayout,
  selectedId,
  onSelect,
  onImagesChange,
  onTextLayoutChange,
}: {
  images: ImageLayer[];
  textLayout: Settings["textLayout"];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onImagesChange: (images: ImageLayer[]) => void;
  onTextLayoutChange: (layout: Settings["textLayout"]) => void;
}) {
  const selected = images.find((image) => image.id === selectedId);
  function changeImage(patch: Partial<ImageLayer>) {
    onImagesChange(
      images.map((image) => (image.id === selectedId ? { ...image, ...patch } : image)),
    );
  }
  const layout = textLayout ?? { x: 64, y: 64, scale: 1 };
  if (!selected && selectedId !== "text") return null;
  return (
    <FloatingPanel key={selectedId} label={selected ? "이미지 레이어 편집" : "텍스트 레이어 편집"}>
      <div className="space-y-group">
        <p className="text-caption text-fg-neutral-muted">
          드래그로 배치하거나 아래에서 정확하게 조절하세요.
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
                const siblings = images.filter((image) => image.behindText === selected.behindText);
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
    </FloatingPanel>
  );
}
