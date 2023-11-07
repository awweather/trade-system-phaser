import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import OverlapSizer from "phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer";
import { eventEmitter } from "../EventEmitter.ts";
import { HudContext } from "../HudContext.ts";
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
export default class ItemSlotModel extends OverlapSizer {
  slotIndex: number;
  item: Item | undefined;
  slotType: HudContext;
  qty: Phaser.GameObjects.Text | undefined;
  dragTimer: Phaser.Time.TimerEvent | null = null;
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
    // Creates a new item sprite based on the item's configuration
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

    // Add the new sprite to the scene
    this.scene.add.existing(this.item);

    // Add the new sprite to the item slot sizer
    this.add(this.item, {
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
    // The typings for the UI plugin don't include this.backgroundChildren
    const anyHack = this as any;
    anyHack.backgroundChildren[0].setStrokeStyle(1, 0xa08662);

    if (this.item) {
      // Create the item info panel, store it on the scene so it can be removed on pointer out
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

  handle_pointerDown(scene: TradeScene, pointer: Phaser.Input.Pointer) {
    // If no item is in this slot, return
    if (!this.item) return;

    // If the right mouse button is down, return
    if (pointer.rightButtonDown()) return;

    // If shift is down, return
    if (
      scene.controls.shift.isDown ||
      scene.controls.justDown(scene.controls.shift)
    )
      return;

    const plugin = scene.plugins.get("dragPlugin") as DragPlugin;

    // Record the start position of the pointer
    let dragStartX = pointer.x;
    let dragStartY = pointer.y;

    // Set a flag to indicate dragging has not started
    let isDragging = false;

    // Define a threshold for when the drag should start
    const dragThreshold = 10; // Pixels the pointer needs to move to start the drag

    const currentSlot = this;

    // Add a move event listener to track the pointer movement
    scene.input.on(
      "pointermove",
      function (pointer: Phaser.Input.Pointer) {
        // Calculate the distance the pointer has moved
        const distance = Phaser.Math.Distance.Between(
          dragStartX,
          dragStartY,
          pointer.x,
          pointer.y
        );

        // If the distance is greater than the threshold and dragging hasn't started, start the drag
        if (!isDragging && distance > dragThreshold) {
          isDragging = true; // Set the flag to indicate that dragging has started
          currentSlot.initiateDrag(scene, plugin);
        }
      },
      this
    );

    // Add a pointer up event to stop tracking movement and clean up listeners
    this.scene.input.once(
      "pointerup",
      function () {
        scene.input.off("pointermove");
      },
      this
    );
  }

  handle_pointerUp(scene: TradeScene) {
    if (!this.item) return;
    if (
      scene.controls.shift.isDown ||
      scene.controls.justDown(scene.controls.shift)
    ) {
      eventEmitter.emit(
        keys.itemSlots.CLICKED(this.slotType),
        this.item.entity
      );
      this.handle_pointerOut(this.scene as TradeScene);
    }
  }

  initiateDrag(scene: TradeScene, plugin: DragPlugin) {
    if (!this.item) return;

    this.item.drag = plugin.add(this.item);
    this.item.drag.drag();

    this.item.setDepth(201);
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

          currentSlot.layout();
        }
      }
    );

    // Hold temp variable to reference in drag function
    const currentSlot = this;
    this.item.on(
      "drop",
      function (
        this: any,
        pointer: Phaser.Input.Pointer,
        gameObject: ItemSlotModel
      ) {
        let isValidDropTarget = true;
        isValidDropTarget =
          isValidDropTarget &&
          getValidDropTarget(currentSlot.slotType).includes(
            gameObject.slotType
          );

        // False if the slot the item was dropped on already has an item
        isValidDropTarget = isValidDropTarget && !gameObject.item;

        if (!isValidDropTarget) {
          this.x = this.input!.dragStartX;
          this.y = this.input!.dragStartY;
          currentSlot.layout();

          return;
        }

        const droppedInSameInventoryGrid =
          gameObject.slotType === currentSlot.slotType;
        eventEmitter.emit(
          `${gameObject.slotType}_itemDropped`,
          this.entity,
          gameObject.slotIndex,
          droppedInSameInventoryGrid
        );
      }
    );
  }

  handle_pointerOut(scene: TradeScene) {
    // The typings for the UI plugin don't include this.backgroundChildren
    const anyHack = this as any;
    anyHack.backgroundChildren[0].setStrokeStyle(null);

    scene.itemInfoPanel?.setVisible(false);
    scene.itemInfoPanel?.destroy(true);
  }
}

function getValidDropTarget(context: HudContext) {
  switch (context) {
    case HudContext.playerShopInventory:
      return [HudContext.playerInPlay, HudContext.playerShopInventory];

    case HudContext.playerInPlay:
      return [HudContext.playerShopInventory, HudContext.playerInPlay];
    case HudContext.shopInventory:
      return [HudContext.shopInPlay, HudContext.shopInventory];
    case HudContext.shopInPlay:
      return [HudContext.shopInventory, HudContext.shopInPlay];
    default:
      return [];
  }
}
