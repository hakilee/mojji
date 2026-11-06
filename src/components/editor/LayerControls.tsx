import type { RefObject } from "react";
import {
  Accordion,
  Dropdown,
  EditorAccordionItem,
  Button,
  FloatingPanel,
  RangeField,
  SegmentedControl,
} from "~/components/design-system";
import type { ImageLayer, Layer, TextLayer } from "~/lib/emoji";
import { TextLayerEditor } from "./TextLayerEditor";

export function LayerControls({
  layers,
  layer,
  anchor,
  uploadedFont,
  onUpload,
  onLoading,
  onComposingChange,
  onClose,
  onDelete,
  onTextChange,
  onImageChange,
  onReorder,
}: {
  layers: Layer[];
  layer: Layer;
  anchor: RefObject<HTMLElement | null>;
  uploadedFont: { family: string; label: string } | null;
  onUpload: (font: { family: string; label: string; face: FontFace }) => void;
  onLoading: (loading: boolean) => void;
  onComposingChange: (composing: boolean) => void;
  onClose: () => void;
  onDelete: () => void;
  onTextChange: (patch: Partial<Omit<TextLayer, "id" | "type">>) => void;
  onImageChange: (patch: Partial<Omit<ImageLayer, "id" | "type">>) => void;
  onReorder: (direction: -1 | 1) => void;
}) {
  return (
    <FloatingPanel
      id="layer-controls"
      label={layer.type === "text" ? "텍스트 레이어" : "이미지 레이어"}
      anchor={anchor}
      onClose={onClose}
    >
      {layer.type === "text" && (
        <TextLayerEditor
          layer={layer}
          uploadedFont={uploadedFont}
          onUpload={onUpload}
          onChange={onTextChange}
          onLoading={onLoading}
          onComposingChange={onComposingChange}
        />
      )}
      <Accordion type="multiple" defaultValue={layer.type === "image" ? ["layout"] : []}>
        <EditorAccordionItem
          value="layout"
          title="위치·크기"
          summary={`${Math.round(layer.x)}, ${Math.round(layer.y)} · ${layer.type === "text" ? `${Math.round(layer.scale * 100)}%` : `${layer.size}px`}`}
        >
          <div className="space-y-group">
            <div className="grid grid-cols-3 gap-control">
              {[
                { label: "상단", y: 24 },
                { label: "중앙", y: 64 },
                { label: "하단", y: 104 },
              ].map((preset) => (
                <Button
                  variant="white"
                  size="x-small"
                  key={preset.label}
                  onClick={() =>
                    layer.type === "text"
                      ? onTextChange({ x: 64, y: preset.y })
                      : onImageChange({ x: 64, y: preset.y })
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <RangeField
              label="가로 위치"
              min={0}
              max={128}
              value={layer.x}
              valueLabel={String(Math.round(layer.x))}
              onChange={(x) => (layer.type === "text" ? onTextChange({ x }) : onImageChange({ x }))}
            />
            <RangeField
              label="세로 위치"
              min={0}
              max={128}
              value={layer.y}
              valueLabel={String(Math.round(layer.y))}
              onChange={(y) => (layer.type === "text" ? onTextChange({ y }) : onImageChange({ y }))}
            />
            {layer.type === "text" ? (
              <>
                <RangeField
                  label="텍스트 크기"
                  min={10}
                  max={150}
                  suffix="%"
                  value={Math.round(layer.scale * 100)}
                  onChange={(scale) => onTextChange({ scale: scale / 100 })}
                />
                <Button
                  variant="white"
                  size="small"
                  className="w-full"
                  onClick={() => onTextChange({ x: 64, y: 64, scale: 1 })}
                >
                  텍스트 배치 초기화
                </Button>
              </>
            ) : (
              <>
                <RangeField
                  label="이미지 크기"
                  min={8}
                  max={256}
                  value={layer.size}
                  suffix="px"
                  onChange={(size) => onImageChange({ size })}
                />
                <SegmentedControl
                  label="이미지 맞춤"
                  value={layer.fit}
                  options={[
                    { value: "contain", label: "비율 유지" },
                    { value: "cover", label: "정사각 채우기" },
                  ]}
                  onChange={(fit) => onImageChange({ fit })}
                />
                <Button
                  variant="white"
                  size="small"
                  className="w-full"
                  onClick={() =>
                    onImageChange({ x: 64, y: 64, size: 128, rotation: 0, fit: "cover" })
                  }
                >
                  배경 채우기
                </Button>
              </>
            )}
          </div>
        </EditorAccordionItem>
        <EditorAccordionItem
          value="transform"
          title="회전·반전"
          summary={`${layer.rotation ?? 0}°${layer.flipX ? " · 좌우" : ""}${layer.flipY ? " · 상하" : ""}`}
        >
          <div className="space-y-group">
            <RangeField
              label="회전"
              min={-180}
              max={180}
              value={layer.rotation ?? 0}
              suffix="°"
              onChange={(rotation) =>
                layer.type === "text" ? onTextChange({ rotation }) : onImageChange({ rotation })
              }
            />
            <div className="grid grid-cols-[1fr_1fr_auto] gap-control">
              {(["flipX", "flipY"] as const).map((axis) => (
                <Button
                  key={axis}
                  variant="white"
                  size="small"
                  aria-pressed={!!layer[axis]}
                  onClick={() =>
                    layer.type === "text"
                      ? onTextChange({ [axis]: !layer[axis] })
                      : onImageChange({ [axis]: !layer[axis] })
                  }
                >
                  {axis === "flipX" ? "좌우 반전" : "상하 반전"}
                  {layer[axis] ? " ✓" : ""}
                </Button>
              ))}
              <Dropdown modal={false}>
                <Dropdown.Trigger asChild>
                  <Button
                    variant="white"
                    size="small"
                    className="aspect-square h-full px-0"
                    aria-label="회전·반전 더보기"
                  >
                    ⋯
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Content align="end">
                  <Dropdown.Item
                    onSelect={() =>
                      layer.type === "text"
                        ? onTextChange({ rotation: 0, flipX: false, flipY: false })
                        : onImageChange({ rotation: 0, flipX: false, flipY: false })
                    }
                  >
                    초기화
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </EditorAccordionItem>
      </Accordion>
      <div className="mt-inset grid grid-cols-2 gap-control">
        <Button
          variant="white"
          size="small"
          disabled={layers.at(-1)?.id === layer.id}
          onClick={() => onReorder(1)}
        >
          레이어 앞으로
        </Button>
        <Button
          variant="white"
          size="small"
          disabled={layers[0]?.id === layer.id}
          onClick={() => onReorder(-1)}
        >
          레이어 뒤로
        </Button>
      </div>
      <Button variant="white" size="small" className="mt-control w-full" onClick={onDelete}>
        <span className="text-fg-critical">
          {layer.type === "text" ? "선택 텍스트 삭제" : "선택 이미지 삭제"}
        </span>
      </Button>
    </FloatingPanel>
  );
}
