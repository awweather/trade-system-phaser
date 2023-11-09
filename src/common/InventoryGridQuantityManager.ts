import { eventEmitter } from "../EventEmitter.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridSlot from "../inventory/InventoryGridSlot.ts";

export default class InventoryGridQuantityManager {
  qty: Phaser.GameObjects.Text | null = null;
  updateQuantity: (val: number) => void;

  constructor(
    private readonly itemSlot: InventoryGridSlot,
    private readonly scene: Phaser.Scene
  ) {
    this.updateQuantity = function (newQuantity: number) {
      this.qty?.setText(newQuantity.toString());
    };
  }

  addQuantity(value: number, itemId: string) {
    this.qty = this.scene.add
      .text(0, 0, value.toString(), {
        fontSize: `10px`,
      })
      .setDepth(202);

    this.itemSlot.slotSprite.add(this.qty, {
      expand: false,
      align: "right-bottom",
    });

    // Update quantity when quantity changes
    eventEmitter.on(keys.items.QTY_CHANGED(itemId), this.updateQuantity, this);
  }

  removeQuantity(itemId: string) {
    this.qty?.destroy();
    eventEmitter.off(keys.items.QTY_CHANGED(itemId), this.updateQuantity);
  }
}
