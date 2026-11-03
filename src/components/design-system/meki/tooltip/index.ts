import { TooltipImpl, TooltipContent, TooltipProvider, TooltipTrigger } from "./parts";

export const Tooltip = /* @__PURE__ */ Object.assign(TooltipImpl, {
  Content: TooltipContent,
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
});
