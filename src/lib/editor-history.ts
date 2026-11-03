import { initialSettings } from "./emoji";
import type { ImageLayer, Settings } from "./emoji";

type Snapshot = { settings: Settings; selectedLayer: string | null };
type Group = "pointer" | "keyboard" | "input";
type History = {
  past: Snapshot[];
  present: Snapshot;
  future: Snapshot[];
  group: Group | null;
  grouped: boolean;
};
type Action =
  | { type: "change"; patch: Partial<Settings> }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "add-images"; images: ImageLayer[] }
  | { type: "delete"; id: string }
  | { type: "select"; id: string | null }
  | { type: "deselect"; id: string }
  | { type: "begin-group"; group: Group }
  | { type: "end-group"; group?: Group }
  | { type: "undo" | "redo" };

export const initialEditorHistory: History = {
  past: [],
  present: { settings: initialSettings, selectedLayer: null },
  future: [],
  group: null,
  grouped: false,
};

function layerExists(settings: Settings, id: string | null) {
  return id === "text"
    ? !!settings.text.trim()
    : !!settings.images?.some((image) => image.id === id);
}

function sameValues(left: object | undefined, right: object | undefined) {
  return (
    left === right ||
    (!!left &&
      !!right &&
      Object.keys({ ...left, ...right }).every((key) =>
        Object.is(Reflect.get(left, key), Reflect.get(right, key)),
      ))
  );
}

function sameSettings(left: Settings, right: Settings) {
  return (
    sameValues(
      {
        ...left,
        images: undefined,
        textLayout: undefined,
        gradient: undefined,
        characterColors: undefined,
      },
      {
        ...right,
        images: undefined,
        textLayout: undefined,
        gradient: undefined,
        characterColors: undefined,
      },
    ) &&
    sameValues(
      left.textLayout ?? { x: 64, y: 64, scale: 1 },
      right.textLayout ?? { x: 64, y: 64, scale: 1 },
    ) &&
    sameValues(left.gradient, right.gradient) &&
    sameValues(left.characterColors, right.characterColors) &&
    (left.images?.length ?? 0) === (right.images?.length ?? 0) &&
    (left.images ?? []).every((image, index) => sameValues(image, right.images?.[index]))
  );
}

export function editorHistoryReducer(state: History, action: Action): History {
  switch (action.type) {
    case "begin-group":
      return state.group === action.group
        ? state
        : { ...state, past: state.past.slice(-100), group: action.group, grouped: false };
    case "end-group":
      return !state.group || (action.group && state.group !== action.group)
        ? state
        : { ...state, past: state.past.slice(-100), group: null, grouped: false };
    case "select": {
      const id = layerExists(state.present.settings, action.id) ? action.id : null;
      return state.present.selectedLayer === id
        ? state
        : { ...state, present: { ...state.present, selectedLayer: id } };
    }
    case "deselect":
      return state.present.selectedLayer === action.id
        ? { ...state, present: { ...state.present, selectedLayer: null } }
        : state;
    case "undo": {
      const previous = state.past.at(-1);
      return previous
        ? {
            past: state.past.slice(0, -1).slice(-99),
            present: previous,
            future: [state.present, ...state.future],
            group: null,
            grouped: false,
          }
        : state;
    }
    case "redo": {
      const next = state.future[0];
      return next
        ? {
            past: [...state.past, state.present],
            present: next,
            future: state.future.slice(1),
            group: null,
            grouped: false,
          }
        : state;
    }
  }

  const current = state.present.settings;
  let settings: Settings;
  switch (action.type) {
    case "change":
      settings = { ...current, ...action.patch };
      break;
    case "add-images":
      settings = { ...current, images: [...(current.images ?? []), ...action.images].slice(0, 12) };
      break;
    case "delete":
      if (!layerExists(current, action.id)) return state;
      settings =
        action.id === "text"
          ? { ...current, text: "", textLayout: undefined, characterColors: undefined }
          : { ...current, images: current.images?.filter((image) => image.id !== action.id) };
      break;
    case "move":
      if (!layerExists(current, action.id)) return state;
      settings =
        action.id === "text"
          ? {
              ...current,
              textLayout: { ...(current.textLayout ?? { scale: 1 }), x: action.x, y: action.y },
            }
          : {
              ...current,
              images: current.images?.map((image) =>
                image.id === action.id ? { ...image, x: action.x, y: action.y } : image,
              ),
            };
      break;
  }
  if (sameSettings(current, settings)) return state;
  const present = {
    settings,
    selectedLayer: layerExists(settings, state.present.selectedLayer)
      ? state.present.selectedLayer
      : null,
  };
  if (state.group && state.grouped && sameSettings(state.past.at(-1)!.settings, settings)) {
    return { ...state, past: state.past.slice(0, -1), present, future: [], grouped: false };
  }
  return {
    ...state,
    past: state.group
      ? state.grouped
        ? state.past
        : [...state.past, state.present]
      : [...state.past, state.present].slice(-100),
    present,
    future: [],
    grouped: !!state.group,
  };
}
