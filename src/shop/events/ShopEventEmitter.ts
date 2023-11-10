import { HudContext } from "../../HudContext.ts";
import { GameEntity } from "../../ecs/GameEntity.ts";

// EventTypes.ts
export const enum ShopEvent {
  ITEM_ADDED = "item_added",
  ITEM_REMOVED = "item_removed",
  TRADE_COMPLETED = "trade_completed",
  TRADE_INITIATED = "trade_initiated",
  DRAG_ENDED = "drag_ended",
  POINTER_OVER = "pointer_over",
  POINTER_OUT = "pointer_out",
  POINTER_UP = "pointer_up",
  POINTER_DOWN = "pointer_down",
  // ... other event keys
}

export interface ItemAddedProps {
  item: GameEntity;
  targetSlotIndex: number;
  targetSlotContext: HudContext;
  currentSlotContext: HudContext;
  currentSlotIndex: number;
  removedItemId: string;
}

export interface TradeInitiatedProps {
  shopkeeperName: string;
  shopkeeperItemEntities: GameEntity[];
  playerName: string;
  playerItemEntities: GameEntity[];
}

export interface ItemAddedProps {
  item: GameEntity;
  targetSlotIndex: number;
  targetSlotContext: HudContext;
  currentSlotContext: HudContext;
  currentSlotIndex: number;
  removedItemId: string;
}

export interface ShopEventMap {
  [ShopEvent.ITEM_ADDED]: ItemAddedProps;
  [ShopEvent.ITEM_REMOVED]: string; // Assuming itemId is a string
  [ShopEvent.TRADE_INITIATED]: TradeInitiatedProps; // Assuming itemId is a string
  [ShopEvent.TRADE_COMPLETED]: undefined;
  // ... other event payloads
}

export class ShopEventEmitter extends Phaser.Events.EventEmitter {
  emit<K extends keyof ShopEventMap>(event: K, args: ShopEventMap[K]): boolean {
    return super.emit(event, args);
  }

  on<K extends keyof ShopEventMap>(
    event: K,
    fn: (args: ShopEventMap[K]) => void,
    context?: any
  ): this {
    return super.on(event, fn, context);
  }
}
