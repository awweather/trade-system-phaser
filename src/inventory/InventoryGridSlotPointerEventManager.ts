import { eventEmitter } from "../EventEmitter.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridSlot from "./InventoryGridSlot.ts";

export interface HoverManager {
  handlePointerOver: (pointer: Phaser.Input.Pointer) => void;
  handlePointerOut: (pointer: Phaser.Input.Pointer) => void;
  handlePointerDown: (pointer: Phaser.Input.Pointer) => void;
  handlePointerUp: (pointer: Phaser.Input.Pointer) => void;
}

export default class InventoryGridSlotPointerEventManager
  extends Phaser.Events.EventEmitter
  implements HoverManager
{
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly itemSlot: InventoryGridSlot
  ) {
    super();

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
  handlePointerOver(pointer: Phaser.Input.Pointer) {
    // The typings for the UI plugin don't include this.backgroundChildren
    const anyHack = this.itemSlot.slotSprite as any;
    anyHack.backgroundChildren[0].setStrokeStyle(1, 0xa08662);

    if (this.itemSlot.hasItem()) {
      this.itemSlot.showItemInfo();
    }
    // if (this.itemSlot.hasItem()) {
    //   // Create the item info panel, store it on the scene so it can be removed on pointer out
    //   this.scene.itemInfoPanel = ItemInfoPanel.create(
    //     this.scene.scene,
    //     this.item.entity
    //   ).layout();

    //   const y =
    //     position && position === "above"
    //       ? this.y - this.height / 2 - scene.itemInfoPanel.height / 2
    //       : this.y + this.height / 2 + scene.itemInfoPanel.height / 2;

    //   this.scene.itemInfoPanel.setX(this.x).setY(y).setDepth(205);
  }

  handlePointerOut(pointer: Phaser.Input.Pointer) {
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
    )
      return;

    this.itemSlot.handleDrag(pointer);
  }

  handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.itemSlot.hasItem()) return;
    if (
      this.scene.controls.shift.isDown ||
      this.scene.controls.justDown(this.scene.controls.shift)
    ) {
      eventEmitter.emit(
        keys.itemSlots.CLICKED(this.itemSlot.slotType),
        this.item.entity
      );
      this.handlePointerOut(pointer);
    }
  }
}
