/**
 * This class holds the internal state of the item slot
 */
export class ItemSlot {
  constructor(public item: string, public slotIndex: number) {}

  hasItem() {
    return this.item && this.item !== "00000000-0000-0000-0000-000000000000";
  }

  addItem(item: string) {
    if (this.hasItem()) {
      throw new Error("ItemSlot already has an item");
    }

    this.item = item;
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
