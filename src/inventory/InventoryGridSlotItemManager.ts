import { eventEmitter } from "../EventEmitter.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridSlot from "./InventoryGridSlot.ts";
import { AddItemConfig } from "./ItemGridSlot.ts";
import ItemNew from "./ItemNew.ts";
import ItemSpriteFactory from "./ItemSpriteFactory.ts";

export default class InventoryGridSlotItemManager {
  private item: ItemNew | null = null;
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

      this.itemSlot.slotSprite.remove(this.item.itemSprite, true);
      this.item.itemSprite.destroy();

      if (this.qty) {
        this.qty.destroy();
      }

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

    const itemSprite = ItemSpriteFactory.create(
      this.scene,
      this.itemSlot.slotSprite.x,
      this.itemSlot.slotSprite.y,
      config.frame
    );

    this.item = new ItemNew(itemSprite, config);

    // this.item = new Item({
    //   scene: this.scene,
    //   x: this.itemSlot.slotSprite.x,
    //   y: this.itemSlot.slotSprite.y,
    //   texture: "icons",
    //   frame: config.renderable.sprite.frame,
    //   name: config.descriptor.name,
    //   description: config.descriptor.description,
    //   entity: config.entity,
    //   itemId: config.itemId,
    // });

    // Add the new sprite to the scene
    this.scene.add.existing(itemSprite);

    // Add the new sprite to the item slot sizer
    this.itemSlot.slotSprite.add(itemSprite, {
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
    // if (config.tradeId) {
    //   config.renderable.tradeModel = this.item;
    // } else {
    //   config.renderable.model = this.item;
    // }

    itemSprite.setDepth(201);
    return this.item;
  }
}
