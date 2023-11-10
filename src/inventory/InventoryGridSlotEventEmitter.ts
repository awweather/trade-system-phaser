import { HudContext } from "../HudContext";
import ItemNew from "./ItemNew.ts";

// EventTypes.ts
export const enum InventoryGridSlotEvent {
  ITEM_ADDED = "item_added",
  ITEM_REMOVED = "item_removed",
  DRAG_STARTED = "drag_started",
  DRAG_ENDED = "drag_ended",
  POINTER_OVER = "pointer_over",
  POINTER_OUT = "pointer_out",
  POINTER_UP = "pointer_up",
  POINTER_DOWN = "pointer_down",
  // ... other event keys
}

export interface DragEndedProps {
  startingSlotIndex: number;
  startingSlotContext: HudContext;
  landingSlotIndex: number;
  landingSlotContext: HudContext;
}

export interface InventoryGridSlotEventMap {
  [InventoryGridSlotEvent.ITEM_ADDED]: ItemNew;
  [InventoryGridSlotEvent.ITEM_REMOVED]: string; // Assuming itemId is a string
  [InventoryGridSlotEvent.DRAG_ENDED]: DragEndedProps;
  // ... other event payloads
}

export class InventoryGridSlotEventEmitter extends Phaser.Events.EventEmitter {
  emit<K extends keyof InventoryGridSlotEventMap>(
    event: K,
    args: InventoryGridSlotEventMap[K]
  ): boolean {
    return super.emit(event, args);
  }

  on<K extends keyof InventoryGridSlotEventMap>(
    event: K,
    fn: (args: InventoryGridSlotEventMap[K]) => void,
    context?: any
  ): this {
    return super.on(event, fn, context);
  }
}
