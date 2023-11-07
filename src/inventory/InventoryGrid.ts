import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import {
  GridSizer,
  ScrollablePanel,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { keys } from "../config/Keys.ts";
import Item from "./Item.ts";
import ItemSlotModel from "./ItemSlotModel.ts";

export default class InventoryGrid {
  // The container for the inventory grid
  scrollableContainer: ScrollablePanel;
  // The actual inventory grid
  grid: GridSizer;
  constructor(scrollableContainer: ScrollablePanel, panel: Sizer) {
    this.scrollableContainer = scrollableContainer;
    const inventoryTable = panel.getElement(keys.ui.inventoryTable) as Sizer;
    this.grid = inventoryTable.getElement(keys.ui.inventoryGrid) as GridSizer;
  }

  addItem(itemConfig: any): Item | null {
    const items = this.grid.getElement("items") as ItemSlotModel[];
    const slot = items[itemConfig.pickedUp.slotIndex];

    if (slot) {
      const item = slot.addItem(itemConfig);
      this.grid.layout();
      return item;
    }

    return null;
  }

  removeItem(index: number) {
    const items = this.grid.getElement("items") as ItemSlotModel[];
    const slot = items[index];
    slot?.removeItem();

    this.grid.layout();
  }
}
