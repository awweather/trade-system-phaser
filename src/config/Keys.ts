import { HudContext } from "../HudContext.ts";

export type MenuTypes = "trade" | "balanceOffer" | "acceptTrade" | "closeShop";

export const keys = {
  ui: {
    inventoryTable: "inventoryTable",
    inventoryGrid: "inventoryGrid",
  },
  itemSlots: {
    CLICKED: (context: HudContext) => `${context}_slot_clicked`,
    CTRL_CLICK: (context: HudContext) => `${context}_ctrl_slot_clicked`,
    M_CLICK: (context: HudContext) => `${context}_m_slot_clicked`,
    ITEM_ADDED: (context: HudContext) => `${context}.itemSlots.item.added`,
  },
  items: {
    MOVED: (context: HudContext) => `${context}_itemMoved`,
    SWAPPED: (context: HudContext) => `$${context}_itemSwapped`,
    ADDED: (context: HudContext) => `${context}_itemAdded`,
    DROPPED: (context: HudContext) => `${context}_itemDropped`,
    REMOVED: (context: HudContext) => `${context}_itemRemoved`,
    QTY_CHANGED: (itemId: string) => `${itemId}.quantity.changed`,
  },
  menu: {
    CLICKED: (option: MenuTypes) => `menu.${option}.clicked`,
  },
};
