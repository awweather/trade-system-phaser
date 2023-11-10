import { Component, Types } from "ecsy";
import { ItemSlot, createItemSlot } from "../../inventory/state/ItemSlot.ts";
interface ShopWindowProps {}
class ShopWindow extends Component<ShopWindowProps> {
  inventory: ItemSlot[];
  inPlay: ItemSlot[];
  npcInPlay: ItemSlot[];
  npcInventory: ItemSlot[];
  tradingWithEntityId: string;

  constructor() {
    super(false);

    this.inventory = [];
    this.inPlay = [];
    this.npcInPlay = [];
    this.npcInventory = [];
    this.tradingWithEntityId = "";
  }

  copy(source: ShopWindow) {
    this.inventory = source.inventory.map((itemSlot) => {
      const slot = createItemSlot(itemSlot.slotIndex);
      slot.item = itemSlot.item;
      return slot;
    });
    this.inPlay = source.inPlay.map((itemSlot) => {
      const slot = createItemSlot(itemSlot.slotIndex);
      slot.item = itemSlot.item;
      return slot;
    });
    this.npcInventory = source.npcInventory.map((itemSlot) => {
      const slot = createItemSlot(itemSlot.slotIndex);
      slot.item = itemSlot.item;
      return slot;
    });
    this.npcInPlay = source.npcInPlay.map((itemSlot) => {
      const slot = createItemSlot(itemSlot.slotIndex);
      slot.item = itemSlot.item;
      return slot;
    });

    this.tradingWithEntityId = source.tradingWithEntityId;
    return this;
  }
}

ShopWindow.schema = {
  inventory: { type: Types.Array },
  inPlay: { type: Types.Array },
  npcInPlay: { type: Types.Array },
  npcInventory: { type: Types.Array },
  tradingWithEntityId: { type: Types.String },
};

export default ShopWindow;
