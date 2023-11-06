import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { eventEmitter } from "../EventEmitter.ts";
import { HudContext } from "../HudContext.ts";
import constants from "../config/Constants.ts";
import { keys } from "../config/Keys.ts";
import { GameEntity } from "../ecs/GameEntity.ts";
import {
  DescriptorComponent,
  PickedUpComponent,
  QuantityComponent,
  RenderableComponent,
  TradeIdComponent,
} from "../ecs/components/Components.ts";
import TradeScene from "../scenes/TradeScene.ts";
import Item from "./Item.ts";
import ItemInfoPanel from "./ItemInfoPanel.ts";

export interface AddItemConfig {
  renderable: RenderableComponent;
  descriptor: DescriptorComponent;
  entity: GameEntity;
  pickedUp?: PickedUpComponent;
  quantity?: QuantityComponent;
  tradeId?: TradeIdComponent;
}

/**
 * This class contains the UI logic for the ItemSlot
 * Used for all inventory grids
 */
export default class ItemSlot extends OverlapSizer {
  slotIndex: number;
  item: Item | undefined;
  slotType: HudContext;
  qty: Phaser.GameObjects.Text | undefined;
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

    this.updateQuantity = function (newQuantity: number) {
      this.qty?.setText(newQuantity.toString());
    };
  }

  removeItem() {
    if (this.item) {
      // If the item has quantity
      // Destroy the quantity text and turn off the event listener
      if (this.qty) {
        this.qty.destroy();
        eventEmitter.off(
          keys.items.QTY_CHANGED(this.item.entity.entityId.value),
          this.updateQuantity
        );
      }

      this.remove(this.item, true);
      this.item.destroy();
      this.item = undefined;
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
      entity: config.entity,
    });

    this.item.slotIndex = this.slotIndex;
    this.scene.add.existing(this.item);
    this.add(this.item, {
      expand: false,
      align: "center",
    } as any);

    // If the item has a quantity, render the quantity text
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

      // Update quantity when quantity changes
      eventEmitter.on(
        keys.items.QTY_CHANGED(config.entity.entityId.value),
        this.updateQuantity,
        this
      );

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

  handle_pointerOver(scene: TradeScene, position: string = "below") {
    this.backgroundChildren[0].setStrokeStyle(1, 0xa08662);
    // const me = this as any;
    // me.backgroundChildren[0].setFrame(this.hover || UI.itemSlot.hover);
    if (this.item) {
      scene.itemInfoPanel = ItemInfoPanel.create(
        scene,
        this.item.entity,
        this.slotType
      ).layout();
      const y =
        position && position === "above"
          ? this.y - this.height / 2 - scene.itemInfoPanel.height / 2
          : this.y + this.height / 2 + scene.itemInfoPanel.height / 2;
      scene.itemInfoPanel.setX(this.x).setY(y).setDepth(205);
    }
  }

  handle_pointerDown(scene: TradeScene, pointer: Phaser.Input.Pointer) {
    // If shift is down, return early
    // The rest of this method handles dragging
    if (
      scene.controls.shift.isDown ||
      scene.controls.justDown(scene.controls.shift)
    )
      return;

    if (this.item) {
      if (!pointer.rightButtonDown()) {
        const plugin = scene.plugins.get("dragPlugin") as DragPlugin;
        this.item.drag = plugin.add(this.item);
        this.item.drag.drag();
        this.item.on(
          "dragend",
          (
            pointer: Phaser.Input.Pointer,
            dragX: number,
            dragY: number,
            dropped: boolean
          ) => {
            if (!dropped) {
              this.item!.x = this.input!.dragStartX;
              this.item!.y = this.input!.dragStartY;

              eventEmitter.emit(
                `${this.slotType}_returnToSlot`,
                this.item!.entity,
                this.slotIndex
              );
            }
          }
        );

        const currentSlot = this;
        this.item.on(
          "drop",
          function (pointer: Phaser.Input.Pointer, gameObject: ItemSlot) {
            if (
              (gameObject.slotIndex === currentSlot.slotIndex &&
                gameObject.slotType === currentSlot.slotType) ||
              gameObject.item
            ) {
              gameObject.x = gameObject.input!.dragStartX;
              gameObject.y = gameObject.input!.dragStartY;
            } else {
              eventEmitter.emit(
                `${gameObject.slotType}_itemDropped`,
                gameObject.item!.entity,
                gameObject.slotIndex
              );
            }
          }
        );
      } else {
        eventEmitter.emit(keys.itemSlots.CLICKED(this.slotType));
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
        keys.itemSlots.CLICKED(this.slotType),
        this.item.entity
      );
      this.handle_pointerOut(this.scene as TradeScene);
    }
  }

  handle_pointerOut(scene: TradeScene) {
    this.backgroundChildren[0].setStrokeStyle(null);
    scene.itemInfoPanel?.setVisible(false);
    scene.itemInfoPanel?.destroy(true);
  }
}
