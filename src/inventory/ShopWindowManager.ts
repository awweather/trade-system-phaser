import { eventEmitter } from "../EventEmitter.ts";
import { HudContext } from "../HudContext.ts";
import { GameEntity } from "../ecs/GameEntity.ts";
import {
  QuantityComponent,
  TradeIdComponent,
} from "../ecs/components/Components.ts";
import ShopSystem from "../ecs/systems/ShopSystem.ts";
import { playerEntity } from "../main.ts";
import TradeScene from "../scenes/TradeScene.ts";
import { ShopEvent } from "../shop/ShopEventEmitter.ts";
import {
  getGoldValueInSlots,
  getValueOfItemsInSlots,
  moveItem,
  moveItemInSameInventoryGrid,
} from "../shop/ShopUtilities.ts";
import ShopWindow from "../shop/ShopWindow.ts";
import { AddItemConfig } from "./InventoryGridSlot.ts";
import {
  DragEndedProps,
  InventoryGridSlotEvent,
} from "./InventoryGridSlotEventEmitter.ts";

export class ShopWindowManager {
  constructor(
    private scene: TradeScene,
    private readonly shopWindow: ShopWindow,

    shopSystem: ShopSystem
  ) {
    shopWindow.playerInventoryGrid.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleItemMovedFromPlayerInventory(dragEndedProps)
      );
    });

    shopWindow.playerInPlay.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleItemMovedFromPlayerInventory(dragEndedProps)
      );
    });

    shopWindow.shopInventoryGrid.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleItemMovedFromPlayerInventory(dragEndedProps)
      );
    });

    shopWindow.shopInPlay.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.handleItemMovedFromPlayerInventory(dragEndedProps)
      );
    });

    shopSystem.events.on(ShopEvent.ITEM_ADDED, (props) => {
      const currentSlot = this.getItemSlotFromContext(
        props.currentSlotIndex,
        props.currentSlotContext
      );
      const landingSlot = this.getItemSlotFromContext(
        props.targetSlotIndex,
        props.targetSlotContext
      );

      currentSlot?.removeItem();

      const addItemConfig = decomposeItem(props.item);

      landingSlot?.addItem(addItemConfig);

      this.updateShopWindow();
    });
  }

  getItemSlotFromContext(slotIndex: number, context: HudContext) {
    if (context === HudContext.playerInPlay) {
      return this.shopWindow.playerInPlay.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.playerShopInventory) {
      return this.shopWindow.playerInventoryGrid.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.shopInPlay) {
      return this.shopWindow.shopInPlay.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.shopInventory) {
      return this.shopWindow.shopInventoryGrid.getSlotAtIndex(slotIndex);
    }
  }

  handleItemMovedFromPlayerInventory(dragEndedProps: DragEndedProps) {
    const {
      startingSlotIndex,
      startingSlotContext,
      landingSlotIndex,
      landingSlotContext,
    } = dragEndedProps;

    const currentSlot = this.getItemSlotFromContext(
      startingSlotIndex,
      startingSlotContext
    );

    const landingSlot = this.getItemSlotFromContext(
      landingSlotIndex,
      landingSlotContext
    );

    const droppedInSameContext =
      currentSlot?.slotType === landingSlot?.slotType;

    const itemId = currentSlot!.getItem()!.itemId;

    if (landingSlotContext === HudContext.playerInPlay) {
      if (droppedInSameContext) {
        moveItemInSameInventoryGrid(
          itemId,
          playerEntity.shopWindow.inPlay,
          landingSlotContext,
          landingSlotIndex
        );
      } else {
        moveItem(
          itemId!,
          playerEntity.shopWindow.inventory,
          playerEntity.shopWindow.inPlay,
          landingSlotContext,
          currentSlot!.slotType,
          landingSlotIndex
        );
      }

      return;
    }

    if (landingSlotContext === HudContext.playerShopInventory) {
      if (droppedInSameContext) {
        moveItemInSameInventoryGrid(
          itemId,
          playerEntity.shopWindow.inventory,
          landingSlotContext,
          landingSlotIndex
        );
      } else {
        moveItem(
          itemId!,
          playerEntity.shopWindow.inPlay,
          playerEntity.shopWindow.inventory,
          landingSlotContext,
          currentSlot!.slotType,
          landingSlotIndex
        );
      }

      return;
    }

    if (landingSlotContext === HudContext.shopInPlay) {
      if (droppedInSameContext) {
        moveItemInSameInventoryGrid(
          itemId,
          playerEntity.shopWindow.npcInPlay,
          landingSlotContext,
          landingSlotIndex
        );
      } else {
        moveItem(
          itemId!,
          playerEntity.shopWindow.npcInventory,
          playerEntity.shopWindow.npcInPlay,
          landingSlotContext,
          currentSlot!.slotType,
          landingSlotIndex
        );
      }

      return;
    }

    if (landingSlotContext === HudContext.shopInventory) {
      if (droppedInSameContext) {
        moveItemInSameInventoryGrid(
          itemId,
          playerEntity.shopWindow.npcInventory,
          landingSlotContext,
          landingSlotIndex
        );
      } else {
        moveItem(
          itemId!,
          playerEntity.shopWindow.npcInPlay,
          playerEntity.shopWindow.npcInventory,
          landingSlotContext,
          currentSlot!.slotType,
          landingSlotIndex
        );

        return;
      }
    }
  }

  handleDragEnded(dragEndedProps: DragEndedProps) {
    const { startingSlotIndex: startingSlot, landingSlotIndex: landingSlot } =
      dragEndedProps;

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

  updateShopWindow() {
    this.shopWindow.updatePlayerCoins(this.playerCoins);
    this.shopWindow.updateShopCoins(this.shopCoins);
    this.shopWindow.updateCoinsInPlay(this.inPlayValue);
    this.shopWindow.updateShopCoinsInPlay(this.shopInPlayValue);
  }

  get playerCoins(): number {
    return getGoldValueInSlots(playerEntity.shopWindow.inventory);
  }

  get playerCoinsInPlay(): number {
    return getGoldValueInSlots(playerEntity.shopWindow.inPlay);
  }

  get shopCoinsInPlay(): number {
    return getGoldValueInSlots(playerEntity.shopWindow.npcInPlay);
  }

  get shopCoins(): number {
    return getGoldValueInSlots(playerEntity.shopWindow.npcInventory);
  }

  get inPlayValue() {
    return getValueOfItemsInSlots(playerEntity.shopWindow.inPlay);
  }

  get shopInPlayValue() {
    return getValueOfItemsInSlots(playerEntity.shopWindow.npcInPlay);
  }
}

function decomposeItem(item: GameEntity): AddItemConfig {
  return {
    entity: item,
    pickedUp: item.pickedUp,
    descriptor: item.descriptor,
    renderable: item.renderable_mutable,
    quantity: item.hasComponent(QuantityComponent) ? item.quantity : undefined,
    tradeId: item.getComponent<TradeIdComponent>(TradeIdComponent),
    itemId: item.entityId.value,
  };
}
