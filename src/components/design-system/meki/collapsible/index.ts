import { Root } from "@radix-ui/react-collapsible";
import { Trigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "./parts";

export const Collapsible = /* @__PURE__ */ Object.assign(Root, {
  Content: CollapsibleContent,
  Trigger,
});
