import { initialSettings } from "./emoji";
import type { ImageLayer, Settings, TextLayer } from "./emoji";

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
  | { type: "change-text"; id: string; patch: Partial<Omit<TextLayer, "id" | "type">> }
  | { type: "change-image"; id: string; patch: Partial<Omit<ImageLayer, "id" | "type">> }
  | { type: "add-text"; layer: TextLayer }
  | { type: "reorder"; id: string; direction: -1 | 1 }
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
  return settings.layers.some((layer) => layer.id === id);
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
        layers: undefined,
      },
      {
        ...right,
        layers: undefined,
      },
    ) &&
    left.layers.length === right.layers.length &&
    left.layers.every((layer, index) => {
      const other = right.layers[index];
      return layer.type === "text" && other.type === "text"
        ? sameValues(
            { ...layer, gradient: undefined, characterColors: undefined },
            { ...other, gradient: undefined, characterColors: undefined },
          ) &&
            sameValues(layer.gradient, other.gradient) &&
            sameValues(layer.characterColors, other.characterColors)
        : sameValues(layer, other);
    })
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
    case "change-text":
      settings = {
        ...current,
        layers: current.layers.map((layer) =>
          layer.id === action.id && layer.type === "text" ? { ...layer, ...action.patch } : layer,
        ),
      };
      break;
    case "change-image":
      settings = {
        ...current,
        layers: current.layers.map((layer) =>
          layer.id === action.id && layer.type === "image" ? { ...layer, ...action.patch } : layer,
        ),
      };
      break;
    case "add-text":
      settings = { ...current, layers: [...current.layers, action.layer] };
      break;
    case "add-images":
      settings = {
        ...current,
        layers: [
          ...current.layers,
          ...action.images.slice(
            0,
            Math.max(0, 12 - current.layers.filter((layer) => layer.type === "image").length),
          ),
        ],
      };
      break;
    case "reorder": {
      const index = current.layers.findIndex((layer) => layer.id === action.id);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= current.layers.length) return state;
      const layers = [...current.layers];
      [layers[index], layers[target]] = [layers[target], layers[index]];
      settings = { ...current, layers };
      break;
    }
    case "delete":
      if (!layerExists(current, action.id)) return state;
      settings = { ...current, layers: current.layers.filter((layer) => layer.id !== action.id) };
      break;
    case "move":
      if (!layerExists(current, action.id)) return state;
      settings = {
        ...current,
        layers: current.layers.map((layer) =>
          layer.id === action.id ? { ...layer, x: action.x, y: action.y } : layer,
        ),
      };
      break;
  }
  if (sameSettings(current, settings)) return state;
  const present = {
    settings,
    selectedLayer:
      action.type === "add-text"
        ? action.layer.id
        : layerExists(settings, state.present.selectedLayer)
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
