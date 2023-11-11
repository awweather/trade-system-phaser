import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import {
  GridSizer,
  ScrollablePanel,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { HudContext } from "../../HudContext.ts";
import { keys } from "../../config/Keys.ts";
import InventoryGridSlot, { AddItemConfig } from "../ui/InventoryGridSlot.ts";
import Item from "../ui/Item.ts";

export default class InventoryGridManager {
  // The container for the inventory grid
  scrollableContainer: ScrollablePanel;
  // The actual inventory grid
  grid: GridSizer;

  constructor(
    scrollableContainer: ScrollablePanel,
    panel: Sizer,
    public readonly slots: InventoryGridSlot[]
  ) {
    this.scrollableContainer = scrollableContainer;
    const inventoryTable = panel.getElement(keys.ui.inventoryTable) as Sizer;
    this.grid = inventoryTable.getElement(keys.ui.inventoryGrid) as GridSizer;

    this.slots.forEach((slot) => {
      // slot.events.on(InventoryGridSlotEvent.DRAG_OVER, (dragOverProps) => {
      //   const slot = this.getSlotAtIndex(dragOverProps.slotIndex);
      //   if (
      //     !getValidDropTarget(slot.slotType).includes(dragOverProps.slotContext)
      //   )
      //     return;
      //   slot.handlePointerOver();
      // });
      // slot.events.on(InventoryGridSlotEvent.DRAG_LEAVE, (dragOverProps) => {
      //   const slot = this.getSlotAtIndex(dragOverProps.slotIndex);
      //   if (slot.slotType !== dragOverProps.slotContext) return;
      //   slot.handlePointerOut();
      // });
    });
  }

  addItem(itemConfig: AddItemConfig, slotIndex: number): Item | null {
    const slot =
      slotIndex !== undefined
        ? this.slots[slotIndex]
        : this.slots[itemConfig.pickedUp!.slotIndex];

    if (slot) {
      const item = slot.addItem(itemConfig);
      this.grid.layout();
      return item;
    }

    return null;
  }

  removeItem(index: number) {
    const items = this.grid.getElement("items") as InventoryGridSlot[];
    const slot = items[index];
    slot?.removeItem();

    this.grid.layout();
  }

  getItemAtIndex(index: number) {
    const slot = this.getSlotAtIndex(index);

    if (slot) {
      return slot?.getItem();
    }
  }

  getSlotAtIndex(index: number) {
    const slot = this.slots[index];

    return slot;
  }
}

function getValidDropTarget(context: HudContext) {
  switch (context) {
    case HudContext.playerShopInventory:
      return [HudContext.playerInPlay, HudContext.playerShopInventory];

    case HudContext.playerInPlay:
      return [HudContext.playerShopInventory, HudContext.playerInPlay];
    case HudContext.shopInventory:
      return [HudContext.shopInPlay, HudContext.shopInventory];
    case HudContext.shopInPlay:
      return [HudContext.shopInventory, HudContext.shopInPlay];
    default:
      return [];
  }
}
