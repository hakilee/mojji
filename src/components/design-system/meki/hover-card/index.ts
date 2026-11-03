import { Root } from "@radix-ui/react-hover-card";
import { Portal } from "@radix-ui/react-hover-card";
import { Trigger } from "@radix-ui/react-hover-card";
import { HoverCardContent } from "./parts";

export const HoverCard = /* @__PURE__ */ Object.assign(Root, {
  Content: HoverCardContent,
  Portal,
  Trigger,
});
