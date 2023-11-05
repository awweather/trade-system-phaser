import { Component, Types } from "ecsy";

export class ItemSlot {
  constructor(public item: string, public slotIndex: number) {}

  hasItem() {
    return this.item && this.item !== "00000000-0000-0000-0000-000000000000";
  }

  removeItem(): string {
    const item = this.item;

    this.item = "";

    return item;
  }
}

export const createItemSlot = (slot: number): ItemSlot => {
  return new ItemSlot("", slot);
};

export const createItemSlots = (num: number): ItemSlot[] => {
  const slots = [];
  for (let i = 0; i < num; i++) {
    slots.push(new ItemSlot("", i));
  }

  return slots;
};

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

  copy(source) {
    this.items = source.items;
    this.slots = source.slots.map((slot: ItemSlot, index: number) => {
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
