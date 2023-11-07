import { Component, Types } from "ecsy";
import { ItemSlot } from "../../inventory/ItemSlot.ts";

interface InventoryProps {}
class Inventory extends Component<InventoryProps> {
  items: string[];
  slots: ItemSlot[];

  constructor() {
    super(false);

    this.slots = [];
    this.items = [];
  }

  firstAvailableSlot() {
    return this.slots.find((slot) => {
      return !slot.hasItem();
    });
  }

  copy(source: any) {
    this.items = source.items;
    this.slots = source.slots.map((slot: ItemSlot) => {
      return new ItemSlot(slot.item, slot.slotIndex);
    });

    return this;
  }
}

Inventory.schema = {
  items: { type: Types.Array },
  coins: { type: Types.Number },
  slots: { type: Types.Array },
  entityID: { type: Types.Number },
};

export default Inventory;
