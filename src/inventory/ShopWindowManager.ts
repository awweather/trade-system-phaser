import { eventEmitter } from "../EventEmitter.ts";
import TradeScene from "../scenes/TradeScene.ts";
import ShopWindow from "../shop/ShopWindow.ts";
import InventoryGrid from "./InventoryGrid.ts";
import {
  DragEndedProps,
  InventoryGridSlotEvent,
} from "./InventoryGridSlotEventEmitter.ts";

export class ShopWindowManager {
  constructor(
    private scene: TradeScene,
    private readonly shopWindow: ShopWindow
  ) {
    shopWindow.playerInventoryGrid.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleItemMovedFromPlayerInventory
      );
    });
  }

  handleItemMovedFromPlayerInventory(dragEndedProps: DragEndedProps) {
    const { startingSlotIndex: startingSlot, landingSlotIndex: landingSlot } = dragEndedProps;

    const currentSlot = this.inventoryGrid.getSlotAtIndex(startingSlot);
    const landingItemSlot = this.inventoryGrid.getSlotAtIndex(landingSlot);


  }

  handleDragEnded(dragEndedProps: DragEndedProps) {
    const { startingSlotIndex: startingSlot, landingSlotIndex: landingSlot } = dragEndedProps;

    const currentSlot = this.inventoryGrid.getSlotAtIndex(startingSlot);
    const landingItemSlot = this.inventoryGrid.getSlotAtIndex(landingSlot);

    const droppedInSameInventoryGrid =
      currentSlot.slotType === landingItemSlot.slotType;

    eventEmitter.emit(
      `${landingItemSlot.slotType}_itemDropped`,
      currentSlot.getItem()!.entity,
      landingItemSlot.slotIndex,
      droppedInSameInventoryGrid
    );
  }

  // ... other methods to manage slots, like handling drag and drop, etc.
}
