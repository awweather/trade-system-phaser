import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import { OverlapSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { HudContext } from "../HudContext.ts";
import InventoryGridSlot from "../inventory/InventoryGridSlot.ts";
import { InventoryGridSlotEvent } from "../inventory/InventoryGridSlotEventEmitter.ts";
import TradeScene from "../scenes/TradeScene.ts";

export interface DragManager {
  handleDrag: (pointer: Phaser.Input.Pointer) => void;
}

export default class ShopWindowDragManager implements DragManager {
  private readonly dragPlugin: DragPlugin;
  constructor(
    private readonly scene: TradeScene,
    private readonly itemSlot: InventoryGridSlot
  ) {
    this.dragPlugin = scene.plugins.get("dragPlugin") as DragPlugin;
  }

  handleDrag(pointer: Phaser.Input.Pointer) {
    // Record the start position of the pointer
    let dragStartX = pointer.x;
    let dragStartY = pointer.y;

    // Set a flag to indicate dragging has not started
    let isDragging = false;

    // Define a threshold for when the drag should start
    const dragThreshold = 10; // Pixels the pointer needs to move to start the drag

    const dragManager = this;

    // Add a move event listener to track the pointer movement
    this.scene.input.on(
      "pointermove",
      function (pointer: Phaser.Input.Pointer) {
        dragManager.itemSlot.getItem()?.itemSprite.setDepth(201);
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
          dragManager.initiateDrag();
        }
      },
      this
    );

    // Add a pointer up event to stop tracking movement and clean up listeners
    this.scene.input.once(
      "pointerup",
      function () {
        dragManager.scene.input.off("pointermove");
      },
      this
    );
  }

  initiateDrag() {
    if (!this.itemSlot.hasItem()) return;

    const item = this.itemSlot.getItem()!;

    const drag = this.dragPlugin.add(item.itemSprite);
    drag.drag();

    const startingX = item.itemSprite.x;
    const startingY = item.itemSprite.y;
    // this.item.setDepth(201);
    item.itemSprite.on(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        dragX: number,
        dragY: number,
        dropped: boolean
      ) => {
        if (!dropped) {
          item!.x = startingX;
          item!.y = startingY;

          this.itemSlot.slotSprite.layout();
        }
      }
    );

    // Hold temp variable to reference in drag function
    const currentSlot = this.itemSlot;
    item.itemSprite.on(
      "drop",
      function (
        this: any,
        pointer: Phaser.Input.Pointer,
        gameObject: OverlapSizer
      ) {
        let isValidDropTarget = true;
        isValidDropTarget =
          isValidDropTarget &&
          getValidDropTarget(currentSlot.slotType).includes(
            gameObject.getData("slotType")
          );

        // False if the slot the item was dropped on already has an item
        // isValidDropTarget = isValidDropTarget && !gameObject.getItem();

        if (!isValidDropTarget) {
          this.x = this.input!.dragStartX;
          this.y = this.input!.dragStartY;
          currentSlot.slotSprite.layout();

          return;
        }

        currentSlot.events.emit(InventoryGridSlotEvent.DRAG_ENDED, {
          startingSlotIndex: currentSlot.slotIndex,
          startingSlotContext: currentSlot.slotType,
          landingSlotIndex: gameObject.getData("slotIndex") as number,
          landingSlotContext: gameObject.getData("slotType") as number,
        });

        // eventEmitter.emit(
        //   `${gameObject.getData("slotType")}_itemDropped`,
        //   this.entity,
        //   gameObject.getData("slotIndex"),
        //   droppedInSameInventoryGrid
        // );
      }
    );
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
