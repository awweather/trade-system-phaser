import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import Item from "./Item.ts";
import ItemSlot from "./ItemSlot.ts";

export default class InventoryPanel {
  sizer: Sizer;
  public grid: any;
  constructor(inventoryPanel: any) {
    this.sizer = inventoryPanel;
    this.grid = inventoryPanel.childrenMap.panel
      .getElement("inventoryPanel")
      .getElement("inventoryGrid");
  }

  addItem(itemConfig: any): Item | null {
    const items = this.grid.getElement("items");
    const slot = items[itemConfig.pickedUp.slotIndex] as ItemSlot;

    if (slot) {
      const item = slot.addItem(itemConfig);
      this.grid.layout();
      return item;
    }

    return null;
  }

  getSlotByEntityId(id: string): ItemSlot {
    return this.grid.children.find((slot: ItemSlot) => {
      return slot.hasItem() && slot.item.entityID.toString() === id;
    });
  }

  removeItem(index: number): Item {
    const items = this.grid.getElement("items");
    const slot = items[index];
    const item = slot?.removeItem();

    this.grid.layout();

    return item;
  }
}
