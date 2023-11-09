import { eventEmitter } from "../EventEmitter.ts";
import TradeScene from "../scenes/TradeScene.ts";
import InventoryGrid from "./InventoryGrid.ts";
import {
  DragEndedProps,
  InventoryGridSlotEvent,
} from "./InventoryGridSlotEventEmitter.ts";

export class InventoryGridManager {
  constructor(
    private scene: TradeScene,
    private readonly inventoryGrid: InventoryGrid
  ) {
    inventoryGrid.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleDragEnded(dragEndedProps)
      );
    });
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
