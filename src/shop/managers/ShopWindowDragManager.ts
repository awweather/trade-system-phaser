import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import { OverlapSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { HudContext } from "../../HudContext.ts";
import { InventoryGridSlotEvent } from "../../inventory/events/InventoryGridSlotEventEmitter.ts";
import InventoryGridSlot from "../../inventory/ui/InventoryGridSlot.ts";
import TradeScene from "../../scenes/TradeScene.ts";

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

    item.itemSprite.setScale(1.25);

    item.itemSprite.on("dragenter", (obj, itemSlotSprite: OverlapSizer) => {
      const slotContext = itemSlotSprite.getData("slotType");
      const slotIndex = itemSlotSprite.getData("slotIndex");
      if (getValidDropTarget(slotContext)) {
        this.itemSlot.events.emit(InventoryGridSlotEvent.DRAG_OVER, {
          slotIndex,
          slotContext,
        });
      }
    });

    item.itemSprite.on("dragleave", (obj, itemSlotSprite: OverlapSizer) => {
      const slotContext = itemSlotSprite.getData("slotType");
      const slotIndex = itemSlotSprite.getData("slotIndex");
      if (getValidDropTarget(slotContext)) {
        this.itemSlot.events.emit(InventoryGridSlotEvent.DRAG_LEAVE, {
          slotIndex,
          slotContext,
        });
      }
    });

    item.itemSprite.on(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        dragX: number,
        dragY: number,
        dropped: boolean
      ) => {
        if (!dropped) {
          item!.itemSprite.x = startingX;
          item!.itemSprite.y = startingY;
          item.itemSprite.setScale(1);
          this.itemSlot.slotSprite.layout();
        }
      }
    );

    item.itemSprite.on(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        dragX: number,
        dragY: number,
        dropped: boolean
      ) => {
        if (!dropped) {
          item!.itemSprite.x = startingX;
          item!.itemSprite.y = startingY;
          item.itemSprite.setScale(1);
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
        item.itemSprite.setScale(1);
        currentSlot.slotSprite.layout();

        if (!isValidDropTarget) {
          this.x = this.input!.dragStartX;
          this.y = this.input!.dragStartY;

          return;
        }

        currentSlot.events.emit(InventoryGridSlotEvent.DRAG_ENDED, {
          startingSlotIndex: currentSlot.slotIndex,
          startingSlotContext: currentSlot.slotType,
          landingSlotIndex: gameObject.getData("slotIndex") as number,
          landingSlotContext: gameObject.getData("slotType") as number,
        });
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
