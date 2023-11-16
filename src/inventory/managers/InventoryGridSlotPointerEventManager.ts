import TradeScene from "../../scenes/TradeScene.ts";
import InventoryGridSlot from "../ui/InventoryGridSlot.ts";

export interface PointerEventManager {
  handlePointerOver: (pointer: Phaser.Input.Pointer) => void;
  handlePointerOut: (pointer: Phaser.Input.Pointer) => void;
  handlePointerDown: (pointer: Phaser.Input.Pointer) => void;
  handlePointerUp: (pointer: Phaser.Input.Pointer) => void;
}

export default class InventoryGridSlotPointerEventManager
  implements PointerEventManager
{
  constructor(
    private readonly scene: TradeScene,
    private readonly itemSlot: InventoryGridSlot
  ) {
    itemSlot.slotSprite
      .setInteractive({
        dropZone: true,
        hitArea: new Phaser.Geom.Rectangle(0, 0, 32, 32),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      })
      .on("pointerover", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerOver(pointer);
      })
      .on("pointerout", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerOut(pointer);
      })
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerDown(pointer);
      })
      .on("pointerup", (pointer: Phaser.Input.Pointer) => {
        this.handlePointerUp(pointer);
      });
  }
  handlePointerOver(_pointer: Phaser.Input.Pointer) {
    // The typings for the UI plugin don't include this.backgroundChildren
    const anyHack = this.itemSlot.slotSprite as any;
    anyHack.backgroundChildren[0].setStrokeStyle(1, 0xa08662);

    if (this.itemSlot.hasItem()) {
      this.itemSlot.showItemInfo();
    }
  }

  handlePointerOut(_pointer: Phaser.Input.Pointer) {
    // The typings for the UI plugin don't include this.backgroundChildren
    const anyHack = this.itemSlot.slotSprite as any;
    anyHack.backgroundChildren[0].setStrokeStyle(null);

    this.scene.itemInfoPanel?.setVisible(false);
    this.scene.itemInfoPanel?.destroy(true);
  }

  handlePointerDown(pointer: Phaser.Input.Pointer) {
    // If no item is in this slot, return
    if (!this.itemSlot.hasItem()) return;

    // If the right mouse button is down, return
    if (pointer.rightButtonDown()) return;

    // If shift is down, return
    if (
      this.scene.controls.shift.isDown ||
      this.scene.controls.justDown(this.scene.controls.shift)
    ) {
      console.log("shuft down");
      return;
    }

    this.itemSlot.handleDrag(pointer);
  }

  handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.itemSlot.hasItem()) return;
    if (
      this.scene.controls.shift.isDown ||
      this.scene.controls.justDown(this.scene.controls.shift)
    ) {
      this.itemSlot.handleSlotClick();
      this.handlePointerOut(pointer);
    }
  }
}
