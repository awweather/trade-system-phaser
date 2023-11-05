import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";

import constants from "./Constants.ts";
import { eventEmitter } from "./EventEmitter.ts";
import { HudContext } from "./HudContext.ts";
import Item from "./Item";
import type { AddItemConfig } from "./ItemSlot";
import { keys } from "./Keys.ts";
import TradeScene from "./TradeScene.ts";

export default class OverlapItemSlot extends OverlapSizer {
  slotIndex: number;
  item: Item | null;
  slotType: HudContext;
  qty: Phaser.GameObjects.Text;
  hover: string;
  updateQuantity: (val: number) => void;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    config: any,
    scene: TradeScene,
    slotType: HudContext
  ) {
    super(scene, x, y, width, height, config);

    this.slotType = slotType;
    this.slotIndex = config.slotIndex;
    this.addBackground(config.background);

    this.hover = config.hover;
    this.item = null;
    config.overlapChildren.forEach((child) => {
      this.add(child.background, child.config);
    });

    this.updateQuantity = function (newQuantity: number) {
      this.qty.setText(newQuantity.toString());
    };
  }

  removeItem() {
    if (this.item) {
      if (this.qty) {
        this.qty.destroy();
        eventEmitter.off(
          keys.items.QTY_CHANGED(this.item.entity.entityId.value),
          this.updateQuantity
        );
      }

      this.remove(this.item, true);
      this.item.destroy();
      this.item = null;
    }
  }

  addItem(config: AddItemConfig) {
    this.item = new Item({
      scene: this.scene,
      x: this.x,
      y: this.y,
      texture: "icons",
      frame: config.renderable.sprite.frame,
      name: config.descriptor.name,
      description: config.descriptor.description,
      entityID: config.entity.name,
      entity: config.entity,
    });

    this.item.slotIndex = this.slotIndex;
    this.scene.add.existing(this.item);
    this.add(this.item, {
      expand: false,
      align: "center",
    } as any);
    if (config.quantity) {
      this.qty = this.scene.add
        .text(0, 0, config.quantity.value.toString(), {
          fontFamily: constants.styles.text.fontFamily,
          fontSize: `10px`,
        })
        .setDepth(202);

      this.add(this.qty, {
        expand: false,
        align: "right-bottom",
      });

      eventEmitter.on(
        keys.items.QTY_CHANGED(config.entity.entityId.value),
        this.updateQuantity,
        this
      );

      //   this.qtySubscription = watch(config.quantity.value, (newValue) => {
      //     this.qty.setText(`${newValue}`);
      //   });

      this.layout();
    }

    // If the item is involved in a trade, create a separate sprite
    if (config.tradeId) {
      config.renderable.tradeModel = this.item;
    } else {
      config.renderable.model = this.item;
    }

    return this.item;
  }

  handle_pointerOver(scene, position) {
    // const me = this as any;
    // me.backgroundChildren[0].setFrame(this.hover || UI.itemSlot.hover);
    // if (this.item) {
    //   scene.itemInfoPanel = ItemInfoPanel.create(
    //     scene,
    //     this.item.entity,
    //     this.slotType
    //   ).layout();
    //   const y =
    //     position && position === "above"
    //       ? this.y - this.height / 2 - scene.itemInfoPanel.height / 2
    //       : this.y + this.height / 2 + scene.itemInfoPanel.height / 2;
    //   scene.itemInfoPanel.setX(this.x).setY(y).setDepth(205);
    // }
  }

  handle_pointerDown(scene: TradeScene, pointer: Phaser.Input.Pointer) {
    if (
      scene.controls.shift.isDown ||
      scene.controls.justDown(scene.controls.shift)
    )
      return;
    if (this.item) {
      if (!pointer.rightButtonDown()) {
        this.item.drag = scene.plugins.get("dragPlugin").add(this.item);

        this.item.drag.drag();
        this.item.on("dragstart", function () {
          console.log("dragstart");
        });
        this.item.on("drag", function () {
          console.log("drag");
        });
        this.item.on("dragend", (pointer, gameObject, dontKnow, dropped) => {
          if (!dropped) {
            this.item.x = this.input.dragStartX;
            this.item.y = this.input.dragStartY;

            eventEmitter.emit(
              `${this.slotType}_returnToSlot`,
              this.item.entity,
              this.slotIndex
            );
          }
        });

        const currentSlot = this;
        this.item.on("drop", function (pointer, gameObject) {
          if (
            (gameObject.slotIndex === currentSlot.slotIndex &&
              gameObject.slotType === currentSlot.slotType) ||
            gameObject.item
          ) {
            this.x = this.input.dragStartX;
            this.y = this.input.dragStartY;
          } else {
            eventEmitter.emit(
              `${gameObject.slotType}_itemDropped`,
              this.entity,
              gameObject.slotIndex
            );
          }
        });
      } else {
        eventEmitter.emit(`${this.slotType}_slot_clicked`, this.slotIndex);
      }
    }
  }

  handle_pointerUp(scene: TradeScene) {
    if (
      this.item &&
      (scene.controls.shift.isDown ||
        scene.controls.justDown(scene.controls.shift))
    ) {
      eventEmitter.emit(
        `${this.slotType}_slot_clicked`,
        this.slotIndex,
        this.item.entity
      );
      this.handle_pointerOut(this.scene);
    }
  }

  handle_pointerOut(scene) {
    // const me = this as any;
    // me.backgroundChildren[0].setFrame(
    //   this.hover ? UI.itemSlot.potions : UI.itemSlot.base
    // );
    // scene.itemInfoPanel?.setVisible(false);
  }
}
