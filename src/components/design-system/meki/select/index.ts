import { ItemIndicator } from "@radix-ui/react-select";
import { ItemText } from "@radix-ui/react-select";
import { Value } from "@radix-ui/react-select";
import { SelectRoot, SelectContent, SelectItem, SelectTrigger } from "./parts";
export type { SelectSize } from "./parts";
export const Select = /* @__PURE__ */ Object.assign(SelectRoot, {
  Content: SelectContent,
  Item: SelectItem,
  ItemIndicator,
  ItemText,
  Trigger: SelectTrigger,
  Value,
});
