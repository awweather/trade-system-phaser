import { eventEmitter } from "../EventEmitter.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridSlot from "./InventoryGridSlot.ts";
import Item from "./Item.ts";
import { AddItemConfig } from "./ItemGridSlot.ts";

export default class InventoryGridSlotItemManager {
  private item: Item | null = null;
  updateQuantity: (val: number) => void;
  qty: Phaser.GameObjects.Text | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly itemSlot: InventoryGridSlot
  ) {
    this.updateQuantity = function (newQuantity: number) {
      this.qty?.setText(newQuantity.toString());
    };
  }

  removeItem(): string {
    if (this.item) {
      // If the item has quantity
      // Destroy the quantity text and turn off the event listener
      const itemId = this.item.entity.entityId.value;

      this.itemSlot.slotSprite.remove(this.item, true);
      this.item.destroy();
      this.item = null;

      return itemId;
    }

    return "";
  }

  hasItem() {
    return this.item !== null;
  }

  getItem() {
    return this.item;
  }

  addItem(config: AddItemConfig) {
    // Creates a new item sprite based on the item's configuration
    this.item = new Item({
      scene: this.scene,
      x: this.itemSlot.slotSprite.x,
      y: this.itemSlot.slotSprite.y,
      texture: "icons",
      frame: config.renderable.sprite.frame,
      name: config.descriptor.name,
      description: config.descriptor.description,
      entity: config.entity,
    });

    // Add the new sprite to the scene
    this.scene.add.existing(this.item);

    // Add the new sprite to the item slot sizer
    this.itemSlot.slotSprite.add(this.item, {
      expand: false,
      align: "center",
    });

    // If the item has a quantity, render the quantity text
    if (config.quantity) {
      this.qty = this.scene.add
        .text(0, 0, config.quantity.value.toString(), {
          fontSize: `10px`,
        })
        .setDepth(202);

      this.itemSlot.slotSprite.add(this.qty, {
        expand: false,
        align: "right-bottom",
      });

      // Update quantity when quantity changes
      eventEmitter.on(
        keys.items.QTY_CHANGED(config.entity.entityId.value),
        this.updateQuantity,
        this
      );
    }

    // If the item is involved in a trade, create a separate sprite
    if (config.tradeId) {
      config.renderable.tradeModel = this.item;
    } else {
      config.renderable.model = this.item;
    }

    return this.item;
  }
}
