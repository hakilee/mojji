import { createCanvas } from "@napi-rs/canvas";
import { describe, expect, test } from "vitest";
import { editorHistoryReducer, initialEditorHistory } from "./editor-history";
import { drawEmoji, initialSettings, type ImageLayer, type Settings } from "./emoji";

describe("editor history [E2b E5v]", () => {
  test("deletes text and restores its content, styling, placement and selection", () => {
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "change",
      patch: {
        text: "복구!",
        textLayout: { x: 30, y: 90, scale: 0.6 },
        characterColors: { 0: "#ff0000", 2: "#00ff00" },
      },
    });
    history = editorHistoryReducer(history, { type: "select", id: "text" });
    const before = history.present;

    history = editorHistoryReducer(history, { type: "delete", id: "text" });

    expect(history.present.settings).toEqual({
      ...before.settings,
      text: "",
      textLayout: undefined,
      characterColors: undefined,
    });
    expect(history.present.selectedLayer).toBeNull();
    history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present).toEqual(before);
    history = editorHistoryReducer(history, { type: "redo" });
    expect(history.present.settings.text).toBe("");
    expect(history.present.selectedLayer).toBeNull();
  });

  test("restores deleted image resources, stacking and exact rendered pixels", () => {
    const source = createCanvas(16, 8);
    source.getContext("2d").fillStyle = "#f43060";
    source.getContext("2d").fillRect(0, 0, 16, 8);
    const image: ImageLayer = {
      id: "front",
      name: "front.png",
      source: source as unknown as HTMLCanvasElement,
      aspectRatio: 2,
      x: 42,
      y: 77,
      size: 65,
      rotation: 27,
      behindText: false,
      fit: "contain",
    };
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "change",
      patch: { text: "", images: [{ ...image, id: "back", behindText: true, x: 80 }, image] },
    });
    history = editorHistoryReducer(history, { type: "select", id: image.id });
    const before = history.present;
    const expected = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(expected, before.settings, 0);

    history = editorHistoryReducer(history, { type: "delete", id: image.id });
    expect(history.present.settings.images?.map((layer) => layer.id)).toEqual(["back"]);
    history = editorHistoryReducer(history, { type: "undo" });
    const restored = createCanvas(128, 128).getContext("2d") as unknown as CanvasRenderingContext2D;
    drawEmoji(restored, history.present.settings, 0);

    expect(history.present).toEqual(before);
    expect(history.present.settings.images?.[1].source).toBe(source);
    expect(restored.getImageData(0, 0, 128, 128).data).toEqual(
      expected.getImageData(0, 0, 128, 128).data,
    );
    history = editorHistoryReducer(history, { type: "redo" });
    expect(history.present.settings.images?.map((layer) => layer.id)).toEqual(["back"]);
  });

  test.each(["pointer", "keyboard"] as const)(
    "undoes one %s gesture at a time, including repeated movement",
    (group) => {
      let history = editorHistoryReducer(initialEditorHistory, { type: "select", id: "text" });
      history = editorHistoryReducer(history, { type: "begin-group", group });
      for (const x of [65, 66, 69, 70]) {
        history = editorHistoryReducer(history, { type: "begin-group", group });
        history = editorHistoryReducer(history, { type: "move", id: "text", x, y: 64 });
      }
      history = editorHistoryReducer(history, { type: "end-group", group });
      history = editorHistoryReducer(history, { type: "begin-group", group });
      history = editorHistoryReducer(history, { type: "move", id: "text", x: 80, y: 64 });
      history = editorHistoryReducer(history, { type: "end-group", group });

      history = editorHistoryReducer(history, { type: "undo" });
      expect(history.present.settings.textLayout?.x).toBe(70);
      history = editorHistoryReducer(history, { type: "undo" });
      expect(history.present.settings.textLayout).toBeUndefined();
      expect(history.present.selectedLayer).toBe("text");
      history = editorHistoryReducer(history, { type: "redo" });
      expect(history.present.settings.textLayout?.x).toBe(70);
    },
  );

  test("groups a slider gesture without combining the next document action", () => {
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "begin-group",
      group: "pointer",
    });
    for (const delay of [100, 500, 800])
      history = editorHistoryReducer(history, { type: "change", patch: { delay } });
    history = editorHistoryReducer(history, { type: "end-group", group: "pointer" });
    history = editorHistoryReducer(history, { type: "change", patch: { motion: "roll" } });

    history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present.settings).toMatchObject({ delay: 800, motion: initialSettings.motion });
    history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present.settings.delay).toBe(initialSettings.delay);
    history = editorHistoryReducer(history, { type: "redo" });
    expect(history.present.settings.delay).toBe(800);
  });

  test("keeps a text focus session together through unrelated pointer releases", () => {
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "begin-group",
      group: "input",
    });
    history = editorHistoryReducer(history, { type: "change", patch: { text: "A" } });
    history = editorHistoryReducer(history, { type: "end-group", group: "pointer" });
    history = editorHistoryReducer(history, { type: "end-group", group: "keyboard" });
    history = editorHistoryReducer(history, { type: "change", patch: { text: "AB" } });
    history = editorHistoryReducer(history, { type: "end-group", group: "input" });

    history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present.settings.text).toBe(initialSettings.text);
    history = editorHistoryReducer(history, { type: "redo" });
    expect(history.present.settings.text).toBe("AB");
  });

  test.each(["text", "placement"])(
    "does not record a %s gesture that returns to its start",
    (field) => {
      let history = editorHistoryReducer(initialEditorHistory, {
        type: "begin-group",
        group: "pointer",
      });
      history = editorHistoryReducer(history, {
        type: "change",
        patch: field === "text" ? { text: "임시" } : { textLayout: { x: 70, y: 64, scale: 1 } },
      });
      history = editorHistoryReducer(history, {
        type: "change",
        patch:
          field === "text"
            ? { text: initialSettings.text }
            : { textLayout: { x: 64, y: 64, scale: 1 } },
      });
      history = editorHistoryReducer(history, { type: "end-group" });

      expect(editorHistoryReducer(history, { type: "undo" })).toBe(history);
      expect(history.past).toHaveLength(0);
    },
  );

  test("ignores no-op edits and UI selection without losing redo", () => {
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "change",
      patch: { gradient: { end: "#123456", direction: "horizontal" }, characterColors: undefined },
    });
    history = editorHistoryReducer(history, { type: "change", patch: { color: "#112233" } });
    history = editorHistoryReducer(history, { type: "undo" });
    history = editorHistoryReducer(history, { type: "select", id: "text" });

    expect(
      editorHistoryReducer(history, {
        type: "change",
        patch: {
          ...history.present.settings,
          gradient: { end: "#123456", direction: "horizontal" },
        },
      }),
    ).toBe(history);
    expect(editorHistoryReducer(history, { type: "delete", id: "missing" })).toBe(history);
    expect(editorHistoryReducer(history, { type: "move", id: "missing", x: 1, y: 1 })).toBe(
      history,
    );
    expect(editorHistoryReducer(history, { type: "redo" }).present.settings.color).toBe("#112233");
  });

  test("clears redo only when a new document edit branches from restored settings", () => {
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "change",
      patch: { text: "이전" },
    });
    history = editorHistoryReducer(history, { type: "change", patch: { text: "이후" } });
    history = editorHistoryReducer(history, { type: "undo" });
    history = editorHistoryReducer(history, { type: "change", patch: { text: "새 편집" } });

    expect(editorHistoryReducer(history, { type: "redo" })).toBe(history);
    expect(editorHistoryReducer(history, { type: "undo" }).present.settings.text).toBe("이전");
  });

  test("captures colors, motion and same-label font replacements as document edits", () => {
    const changes: Partial<Settings>[] = [
      { color: "#123456", characterColors: { 0: "#654321" } },
      { gradient: { end: "#aabbcc", direction: "vertical" }, characterColors: undefined },
      { transparent: false, background: "#ff3322" },
      { motion: "swing", speed: 2, delay: 700 },
      { font: "upload-first", fontLabel: "same.woff2 (업로드)" },
      { font: "upload-second", fontLabel: "same.woff2 (업로드)" },
      { font: "Jua", fontLabel: undefined },
    ];
    let history = initialEditorHistory;
    const documents = [history.present.settings];
    for (const patch of changes) {
      history = editorHistoryReducer(history, { type: "change", patch });
      documents.push(history.present.settings);
    }

    for (const settings of documents.slice(0, -1).toReversed()) {
      history = editorHistoryReducer(history, { type: "undo" });
      expect(history.present.settings).toEqual(settings);
    }
    for (const settings of documents.slice(1)) {
      history = editorHistoryReducer(history, { type: "redo" });
      expect(history.present.settings).toEqual(settings);
    }
  });

  test("retains the most recent 100 actions and can redo them", () => {
    let history = initialEditorHistory;
    for (let index = 1; index <= 101; index++)
      history = editorHistoryReducer(history, { type: "change", patch: { text: String(index) } });

    for (let index = 0; index < 100; index++)
      history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present.settings.text).toBe("1");
    expect(editorHistoryReducer(history, { type: "undo" })).toBe(history);
    for (let index = 0; index < 100; index++)
      history = editorHistoryReducer(history, { type: "redo" });
    expect(history.present.settings.text).toBe("101");
    expect(editorHistoryReducer(history, { type: "redo" })).toBe(history);
  });

  test.each(["return", "commit", "undo"] as const)(
    "preserves the history limit when a full-capacity gesture ends by %s",
    (ending) => {
      let history = initialEditorHistory;
      for (let index = 1; index <= 100; index++)
        history = editorHistoryReducer(history, { type: "change", patch: { text: String(index) } });
      history = editorHistoryReducer(history, { type: "begin-group", group: "input" });
      history = editorHistoryReducer(history, { type: "change", patch: { text: "진행 중" } });

      if (ending === "return")
        history = editorHistoryReducer(history, { type: "change", patch: { text: "100" } });
      history = editorHistoryReducer(history, { type: ending === "undo" ? "undo" : "end-group" });
      for (let index = 0; index < 100; index++)
        history = editorHistoryReducer(history, { type: "undo" });

      expect(history.present.settings.text).toBe(ending === "return" ? initialSettings.text : "1");
      expect(editorHistoryReducer(history, { type: "undo" })).toBe(history);
    },
  );

  test("adds asynchronously decoded images to the current document within the layer limit", () => {
    const source = createCanvas(1, 1) as unknown as HTMLCanvasElement;
    const images: ImageLayer[] = Array.from({ length: 12 }, (_, index) => ({
      id: String(index),
      name: `${index}.png`,
      source,
      aspectRatio: 1,
      x: 64,
      y: 64,
      size: 40,
      rotation: 0,
      behindText: true,
      fit: "contain",
    }));
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "add-images",
      images: images.slice(0, 11),
    });
    history = editorHistoryReducer(history, { type: "change", patch: { text: "최근 입력" } });

    history = editorHistoryReducer(history, {
      type: "add-images",
      images: [images[11], { ...images[0], id: "excess" }],
    });

    expect(history.present.settings.text).toBe("최근 입력");
    expect(history.present.settings.images?.map((image) => image.id)).toEqual(
      images.map((image) => image.id),
    );
    history = editorHistoryReducer(history, { type: "undo" });
    expect(history.present.settings.images).toHaveLength(11);
    expect(history.present.settings.text).toBe("최근 입력");
  });

  test("does not let an old panel dismissal clear a newly selected layer", () => {
    const source = createCanvas(1, 1) as unknown as HTMLCanvasElement;
    let history = editorHistoryReducer(initialEditorHistory, {
      type: "add-images",
      images: [
        {
          id: "image",
          name: "a.png",
          source,
          aspectRatio: 1,
          x: 64,
          y: 64,
          size: 40,
          rotation: 0,
          behindText: true,
          fit: "contain",
        },
      ],
    });
    history = editorHistoryReducer(history, { type: "select", id: "text" });
    history = editorHistoryReducer(history, { type: "select", id: "image" });

    history = editorHistoryReducer(history, { type: "deselect", id: "text" });
    expect(history.present.selectedLayer).toBe("image");
    history = editorHistoryReducer(history, { type: "deselect", id: "image" });
    expect(history.present.selectedLayer).toBeNull();
    history = editorHistoryReducer(history, { type: "select", id: "missing" });
    expect(history.present.selectedLayer).toBeNull();
  });
});
