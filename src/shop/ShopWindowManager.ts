import { HudContext } from "../HudContext.ts";
import { GameEntity } from "../ecs/GameEntity.ts";
import {
  PickedUpComponent,
  QuantityComponent,
  TradeIdComponent,
} from "../ecs/components/Components.ts";
import ShopSystem from "../ecs/systems/ShopSystem.ts";
import InventoryGridManager from "../inventory/InventoryGridManager.ts";
import { AddItemConfig } from "../inventory/InventoryGridSlot.ts";
import {
  DragEndedProps,
  InventoryGridSlotEvent,
} from "../inventory/InventoryGridSlotEventEmitter.ts";
import { playerEntity } from "../main.ts";
import TradeScene from "../scenes/TradeScene.ts";
import { ShopEvent } from "./ShopEventEmitter.ts";
import {
  getGoldValueInSlots,
  getValueOfItemsInSlots,
  moveItem,
  moveItemInSameInventoryGrid,
} from "./ShopUtilities.ts";
import ShopWindow from "./ShopWindow.ts";

export class ShopWindowManager {
  constructor(
    private scene: TradeScene,
    private readonly shopWindow: ShopWindow,
    private readonly playerInventory: InventoryGridManager,
    private readonly playerInPlay: InventoryGridManager,
    private readonly shopInPlay: InventoryGridManager,
    private readonly shopInventory: InventoryGridManager,

    shopSystem: ShopSystem
  ) {
    playerInventory.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.moveItemFromPlayerInventory(dragEndedProps)
      );
    });

    playerInPlay.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.moveItemFromPlayerInPlay(dragEndedProps)
      );
    });

    shopInventory.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.moveItemFromShopInventory(dragEndedProps)
      );
    });

    shopInPlay.slots.forEach((slot) => {
      slot.events.on(InventoryGridSlotEvent.DRAG_ENDED, (dragEndedProps) =>
        this.moveItemFromShopInPlay(dragEndedProps)
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

    shopSystem.events.on(ShopEvent.TRADE_INITIATED, (props) => {
      const {
        shopkeeperItemEntities,
        shopkeeperName,
        playerItemEntities,
        playerName,
      } = props;

      shopkeeperItemEntities.forEach((item) => {
        return this.shopInventory.addItem(
          decomposeItem(item),
          item.pickedUp.slotIndex
        );
      });

      playerItemEntities.forEach((item) => {
        return this.playerInventory.addItem(
          decomposeItem(item),
          item.pickedUp.slotIndex
        );
      });

      this.shopWindow.initialize(
        shopkeeperName,
        playerName,
        this.playerCoins,
        this.shopCoins
      );
    });

    shopSystem.events.on(ShopEvent.TRADE_COMPLETED, () => {
      this.updateShopWindow();
      this.removeAllInPlayItems();
    });
  }

  getItemSlotFromContext(slotIndex: number, context: HudContext) {
    if (context === HudContext.playerInPlay) {
      return this.playerInPlay.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.playerShopInventory) {
      return this.playerInventory.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.shopInPlay) {
      return this.shopInPlay.getSlotAtIndex(slotIndex);
    }

    if (context === HudContext.shopInventory) {
      return this.shopInventory.getSlotAtIndex(slotIndex);
    }
  }

  removeAllInPlayItems() {
    this.playerInPlay.slots.forEach((slot) => slot.removeItem());
    this.shopInPlay.slots.forEach((slot) => slot.removeItem());
  }

  moveItemFromShopInventory(dragEndedProps: DragEndedProps) {
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

  moveItemFromShopInPlay(dragEndedProps: DragEndedProps) {
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
        playerEntity.shopWindow.npcInPlay,
        playerEntity.shopWindow.npcInventory,
        landingSlotContext,
        currentSlot!.slotType,
        landingSlotIndex
      );

      return;
    }
  }

  moveItemFromPlayerInPlay(dragEndedProps: DragEndedProps) {
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
        playerEntity.shopWindow.inPlay,
        playerEntity.shopWindow.inventory,
        landingSlotContext,
        currentSlot!.slotType,
        landingSlotIndex
      );

      return;
    }
  }

  moveItemFromPlayerInventory(dragEndedProps: DragEndedProps) {
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
        playerEntity.shopWindow.inventory,
        playerEntity.shopWindow.inPlay,
        landingSlotContext,
        currentSlot!.slotType,
        landingSlotIndex
      );
    }

    return;
  }

  updateShopWindow() {
    this.shopWindow.updateShopCoins(this.shopCoins);
    this.shopWindow.updateCoinsInPlay(this.inPlayValue);
    this.shopWindow.updateShopCoinsInPlay(this.shopInPlayValue);
  }

  get playerCoins(): number {
    return getGoldValueInSlots(playerEntity.shopWindow.inventory);
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
    pickedUp: item.hasComponent(PickedUpComponent) ? item.pickedUp : undefined,
    descriptor: item.descriptor,
    renderable: item.renderable_mutable,
    quantity: item.hasComponent(QuantityComponent) ? item.quantity : undefined,
    tradeId: item.getComponent<TradeIdComponent>(TradeIdComponent),
    itemId: item.entityId.value,
  };
}