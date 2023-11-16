import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import {
  GridSizer,
  ScrollablePanel,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { keys } from "../../config/Keys.ts";
import InventoryGridSlot, { AddItemConfig } from "../ui/InventoryGridSlot.ts";
import Item from "../ui/Item.ts";

export default class InventoryGridManager {
  scrollableContainer: ScrollablePanel;
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
        ? this.getSlotAtIndex(slotIndex)
        : this.getSlotAtIndex(itemConfig.pickedUp!.slotIndex);

    if (slot) {
      const item = slot.addItem(itemConfig);
      this.grid.layout();
      return item;
    }

    return null;
  }

  getSlotAtIndex(index: number) {
    const slot = this.slots[index];

    return slot;
  }
}
