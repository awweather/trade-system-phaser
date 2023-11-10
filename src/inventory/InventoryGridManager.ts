import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import {
  GridSizer,
  ScrollablePanel,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { keys } from "../config/Keys.ts";
import InventoryGridSlot, { AddItemConfig } from "./InventoryGridSlot.ts";
import Item from "./Item.ts";
import ItemGridSlot from "./ItemGridSlot.ts";

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
    const items = this.grid.getElement("items") as ItemGridSlot[];
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
