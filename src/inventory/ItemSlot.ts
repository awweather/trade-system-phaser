import { Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import UI from "../../../../configs/UI";
import type { GameEntity } from "../../../../ecs/Entities";
import {
  DescriptorComponent,
  NFTComponent,
  PickedUpComponent,
  QuantityComponent,
  RenderableComponent,
  SummaryComponent,
  TradeIdComponent,
} from "../../../../ecs/components/ECSComponents";
import { gameSystem } from "../../../../ecs/systems/GameSystem";
import type { HudContext } from "../../../../enums/HudContext";
import { eventEmitter } from "../../../../utilities/EventEmitter";
import Item from "../Item";
import ItemInfoPanel from "./ItemInfoPanel";

export interface AddItemConfig {
  renderable: RenderableComponent;
  descriptor: DescriptorComponent;
  entity: GameEntity;
  summary: SummaryComponent;
  pickedUp?: PickedUpComponent;
  quantity?: QuantityComponent;
  nft?: NFTComponent;
  tradeId?: TradeIdComponent;
}

export default class ItemSlot extends Sizer {
  slotIndex: number;
  slotType: HudContext;
  item: Item;
  constructor(config, scene) {
    super(scene, config.x, config.y, config.width, config.height, config);
    this.scene = scene;
    this.slotIndex = config.slotIndex;
    this.addBackground(config.background);
  }

  hasItem() {
    return this.item;
  }

  removeItem(): Item {
    if (this.item) {
      const item = this.item;
      this.item = null;
      this.remove(item, true);

      if (this.item.entity.hasComponent(NFTComponent)) {
        const el = this.getFirst("nft");
        if (el) {
          this.remove(el, true);
        }
      }

      return item;
    }

    return null;
  }

  addItem(config: AddItemConfig): Item {
    this.item = new Item({
      scene: this.scene,
      x: this.x,
      y: this.y,
      texture: "icons",
      frame: config.renderable.sprite.frame,
      name: config.descriptor.name,
      description: config.summary.summaryText,
      entityID: config.entity.name,
      entity: config.entity,
    });

    // If the item is involved in a trade, create a separate sprite
    if (config.tradeId) {
      config.renderable.tradeModel = this.item;
    } else {
      config.renderable.model = this.item;
    }

    this.item.slotIndex = this.slotIndex;
    this.scene.add.existing(this.item);
    this.add(this.item);

    this.item?.setScale(2);

    this.layout();
    // this.item.setDepth(999);
    // this.setDepth(500);
    return this.item;
  }

  handle_pointerOver(scene, position): void {
    const me = this as any;
    me.backgroundChildren[0].setFrame(UI.itemSlot.hover);

    if (this.item) {
      scene.itemInfoPanel = ItemInfoPanel.create(
        scene,
        this.item.entity
      ).layout();
      const y =
        position && position === "above"
          ? this.y - this.height / 2 - scene.itemInfoPanel.height / 2
          : this.y + this.height / 2 + scene.itemInfoPanel.height / 2;
      scene.itemInfoPanel.setX(this.x).setY(y).setDepth(205);
    }
  }

  handle_pointerDown(scene): void {
    if (gameSystem.getActiveScene().controls.shift.isDown) return;

    if (
      this.item &&
      !gameSystem
        .getActiveScene()
        .controls.justDown(gameSystem.getActiveScene().controls.shift)
    ) {
      this.item.drag = scene.plugins.get("dragPlugin").add(this.item);

      this.item.drag.drag();
      this.item.on("dragstart", function () {
        console.log("dragstart");
      });
      this.item.on("drag", function () {
        console.log("drag");
      });
      this.item.on("dragend", function (pointer, gameObject, dropped) {
        if (!dropped) {
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
        }
      });
      this.item.on("drop", (pointer, gameObject) => {
        gameObject.add(this, { align: "center" });
      });
    }
  }

  handle_pointerUp(context): void {
    if (this.item) {
      eventEmitter.emit(
        `${this.slotType}_slot_clicked`,
        context,
        this.slotIndex,
        this.item?.entity
      );
    }
  }

  handle_pointerOut(scene): void {
    const me = this as any;
    me.backgroundChildren[0].setFrame(UI.itemSlot.base);
    scene.itemInfoPanel?.setVisible(false);
  }
}
