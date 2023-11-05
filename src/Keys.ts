import { HudContext } from "./HudContext.ts";

export type MenuTypes = "startQuest" | "trade" | "mint" | "Turn it in";

export const keys = {
  itemSlots: {
    CLICKED: (context: HudContext) => `${context}_slot_clicked`,
    CTRL_CLICK: (context: HudContext) => `${context}_ctrl_slot_clicked`,
    M_CLICK: (context: HudContext) => `${context}_m_slot_clicked`,
  },
  items: {
    MOVED: (context: HudContext) => `${context}_itemMoved`,
    ADDED: (context: HudContext) => `${context}_itemAdded`,
    DROPPED: (context: HudContext) => `${context}_itemDropped`,
    REMOVED: (context: HudContext) => `${context}_itemRemoved`,
  },
  inventory: {
    MOVED: `${HudContext.inventory}_itemMoved`,
    ADDED: `${HudContext.inventory}_itemAdded`,
    DROPPED: `${HudContext.inventory}_itemDropped`,
    REMOVED: `${HudContext.inventory}_itemRemoved`,
  },
  splitStack: {
    CLICKED: "split_stack_clicked",
  },
  menu: {
    CLICKED: (option: MenuTypes) => `menu.${option}.clicked`,
    button: {
      CLICKED: "menu.button.clicked",
    },
  },
};
