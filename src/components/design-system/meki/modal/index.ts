import { Root } from "@radix-ui/react-dialog";
import { Close } from "@radix-ui/react-dialog";
import { Description } from "@radix-ui/react-dialog";
import { Trigger } from "@radix-ui/react-dialog";
import { ModalContent, ModalTitle } from "./parts";

export const Modal = /* @__PURE__ */ Object.assign(Root, {
  Close,
  Content: ModalContent,
  Description,
  Title: ModalTitle,
  Trigger,
});
