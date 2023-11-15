import { GameEntity } from "../../ecs/GameEntity.ts";
import {
  GoldComponent,
  PickedUpComponent,
  QuantityComponent,
  ShopWindowComponent,
  TradeIdComponent,
} from "../../ecs/components/Components.ts";
import { getGold } from "../../prefabs/Items.ts";

import { HudContext } from "../../HudContext.ts";
import { initializeEntity } from "../../ecs/InitializeEntity.ts";
import {
  addToInventory,
  getItemInInventoryWithMinQuantity,
  removeFromInventory,
} from "../../inventory/state/InventoryUtilities.ts";
import { ItemSlot } from "../../inventory/state/ItemSlot.ts";
import { playerEntity, shopSystem, world } from "../../main.ts";
import { ShopEvent } from "../events/ShopEventEmitter.ts";

/**
 *
 * @returns The gold entities inside of the player's shop inventory
 */
export function getPlayerShopGoldEntities(): GameEntity[] {
  const shopwindow = playerEntity.getComponent(ShopWindowComponent);
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return shopwindow!.inventory.some(
        (slot) => slot.hasItem() && slot.item === itemId
      );
    });
}

/**
 * @param slots An array of item slots
 * @returns The gold entities that exist in an array of item slots
 */
export function getGoldEntities(slots: ItemSlot[]): GameEntity[] {
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return slots.some((slot) => slot.hasItem() && slot.item === itemId);
    });
}

/**
 *
 * @returns The gold entities inside of the npcs shop inventory
 */
export function getShopGoldEntities(): GameEntity[] {
  const shopwindow = playerEntity.getComponent(ShopWindowComponent);
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return shopwindow!.npcInventory.some(
        (slot) => slot.hasItem() && slot.item === itemId
      );
    });
}

/**
 * Calculates the sum of an array of gold
 * @param goldEntities The array of gold entities
 * @returns The sum of quantity of the gold. Throws an error if an entity does not have a quantity or gold component
 */
export function calculateAvailableGold(goldEntities: GameEntity[]): number {
  return goldEntities.reduce((totalGold, entity) => {
    if (!entity.hasAllComponents([GoldComponent, QuantityComponent])) {
      throw new Error("Tried to sum a gold entity without gold or quantity");
    }

    const quantityComponent =
      entity.getComponent<QuantityComponent>(QuantityComponent);
    return totalGold + quantityComponent!.value;
  }, 0);
}

export function sortGoldByQuantity(goldEntities: GameEntity[]): GameEntity[] {
  return goldEntities.sort((a, b) => {
    const quantityA =
      a.getComponent<QuantityComponent>(QuantityComponent)!.value;
    const quantityB =
      b.getComponent<QuantityComponent>(QuantityComponent)!.value;
    return quantityA - quantityB;
  });
}

/**
 *
 * @param baseItem the gold item to split
 * @param amount the amount to split off the base item
 * @param actor the player who's inventory the gold is in
 * @returns the split out gold amount
 */
export function splitGoldStack(
  baseItem: GameEntity,
  amount: number,
  context: HudContext
): GameEntity {
  applyNewItemQuantity(baseItem, baseItem.quantity.value - amount, context);

  const splitItem = getGold(amount);
  const entity = initializeEntity(splitItem);

  return entity;
}

/**
 * Removes an item from the slots if the quantity is less than or equal to 0
 * @param entity the entity to be removed
 * @param slots the slots to remove the item from
 */
export function removeItemIfQuantityZero(
  entity: GameEntity,
  slots: ItemSlot[]
) {
  if (entity.quantity!.value <= 0) {
    itemRemovedFromPlayerInventory(
      slots.find((s) => s.item === entity.entityId!.value)!.slotIndex
    );
  }
}

/**
 * Attempts to balance the trade using the player's gold.
 * @param goldItems An array of gold items from the players inventory
 * @param differenceInValue
 */
export function balancePlayerGold(
  goldItems: GameEntity[],
  differenceInValue: number
): void {
  const shopWindow = playerEntity.shopWindow;

  goldItems.forEach((goldItem) => {
    if (differenceInValue <= 0) return;
    const quantityOfGoldItem = goldItem.quantity.value;

    if (differenceInValue - quantityOfGoldItem < 0) {
      const { itemWithMatchingQuantityType, slot } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.inPlay
      );

      if (itemWithMatchingQuantityType && slot) {
        applyNewItemQuantity(
          itemWithMatchingQuantityType,
          itemWithMatchingQuantityType.quantity.value + differenceInValue,
          HudContext.playerInPlay
        );

        applyNewItemQuantity(
          goldItem,
          goldItem.quantity.value - differenceInValue,
          HudContext.playerShopInventory
        );

        removeItemIfQuantityZero(goldItem, shopWindow.inventory);
      } else {
        const splitItem = splitGoldStack(
          goldItem,
          differenceInValue,
          HudContext.playerShopInventory
        );
        // Do this so that we can call itemMovedInPlay
        shopWindow.inventory
          .find((i) => !i.hasItem())
          ?.addItem(splitItem.entityId.value);
        const slotToAddTo = shopWindow.inPlay.find((i) => !i.hasItem());

        moveItemInPlay(splitItem);

        splitItem.addComponent(TradeIdComponent, {
          tradeId: shopWindow.tradingWithEntityId,
        });
        splitItem.addComponent<PickedUpComponent>(PickedUpComponent, {
          slotIndex: slotToAddTo!.slotIndex,
        });
      }
    } else {
      const { itemWithMatchingQuantityType } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.inPlay
      );

      if (itemWithMatchingQuantityType) {
        applyNewItemQuantity(
          itemWithMatchingQuantityType,
          itemWithMatchingQuantityType.quantity.value + quantityOfGoldItem,
          HudContext.playerInPlay
        );

        applyNewItemQuantity(
          goldItem,
          goldItem.quantity.value - differenceInValue,
          HudContext.playerShopInventory
        );

        removeItemIfQuantityZero(goldItem, shopWindow.inventory);
      } else {
        moveItemInPlay(goldItem);
      }
    }

    differenceInValue -= quantityOfGoldItem;
  });
}

/**
 * Attempts to balance the trade using the npc's gold
 * @param goldItems An array of gold items from the npc's inventory
 * @param differenceInValue
 * @param shopKeeper
 */
export function balanceNpcGold(
  goldItems: GameEntity[],
  differenceInValue: number
): void {
  const shopWindow = playerEntity.shopWindow;

  goldItems.forEach((goldItem) => {
    if (differenceInValue <= 0) return;
    const quantityOfGoldItem = goldItem.quantity.value;

    if (differenceInValue - quantityOfGoldItem < 0) {
      const { itemWithMatchingQuantityType, slot } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.npcInPlay
      );

      if (itemWithMatchingQuantityType && slot) {
        applyNewItemQuantity(
          itemWithMatchingQuantityType,
          itemWithMatchingQuantityType.quantity.value + differenceInValue,
          HudContext.shopInPlay
        );

        applyNewItemQuantity(
          goldItem,
          goldItem.quantity.value - differenceInValue,
          HudContext.shopInventory
        );

        removeItemIfQuantityZero(goldItem, shopWindow.npcInventory);
      } else {
        const splitItem = splitGoldStack(
          goldItem,
          differenceInValue,
          HudContext.shopInventory
        );

        shopWindow.npcInventory
          .find((i) => !i.hasItem())
          ?.addItem(splitItem.entityId.value);
        const slotToAddTo = shopWindow.npcInPlay.find((i) => !i.hasItem());

        moveItemToShopInPlay(splitItem);

        splitItem.addComponent(TradeIdComponent, {
          tradeId: shopWindow.tradingWithEntityId,
        });
        splitItem.addComponent<PickedUpComponent>(PickedUpComponent, {
          slotIndex: slotToAddTo!.slotIndex,
        });
      }
    } else {
      const { itemWithMatchingQuantityType } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.npcInPlay
      );

      if (itemWithMatchingQuantityType) {
        applyNewItemQuantity(
          itemWithMatchingQuantityType,
          itemWithMatchingQuantityType.quantity.value + quantityOfGoldItem,
          HudContext.shopInventory
        );

        applyNewItemQuantity(
          goldItem,
          goldItem.quantity.value - differenceInValue,
          HudContext.shopInventory
        );

        removeItemIfQuantityZero(goldItem, shopWindow.npcInventory);
      } else {
        moveItemToShopInPlay(goldItem);
      }
    }

    differenceInValue -= quantityOfGoldItem;
  });
}

export function applyNewItemQuantity(
  item: GameEntity,
  newQuantity: number,
  context: HudContext
) {
  item.quantity_mutable.value = newQuantity;

  shopSystem.events.emit(ShopEvent.QUANTITY_UPDATED, {
    currentSlotContext: context,
    currentSlotIndex: item.pickedUp.slotIndex,
    newQuantity: item.quantity.value,
  });
}

/**
 * Removes the item from the player shop inventory
 * @param message
 */
export function itemRemovedFromPlayerInventory(slotIndex: number) {
  const slot = playerEntity.shopWindow.inventory[slotIndex];
  slot.removeItem();
  // shopViewModel.removeItemFromPlayerInventory(slotIndex);
}

/**
 * Moves an item to the npc shop in play
 * @param item The item being moved
 * @param targetSlotIndex The target slot index to move the item to.  If undefined, it uses the first empty slot
 */
export function moveItemToShopInPlay(
  item: GameEntity,
  targetSlotIndex?: number
) {
  const shopWindow = playerEntity.shopWindow;

  // Get the current slot them item resides in
  const slot = shopWindow.npcInventory.find(
    (i) => i.item === item.entityId.value
  );

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slot) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  // Remove the item from that slot
  const removedItem = slot!.removeItem();

  // Find the target slot
  const targetSlot =
    targetSlotIndex !== undefined
      ? shopWindow.npcInPlay[targetSlotIndex]
      : shopWindow.npcInPlay.find((s) => !s.hasItem());

  // Add the item to the new slot
  shopWindow.npcInPlay[targetSlot!.slotIndex].addItem(removedItem);

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotContext: HudContext.shopInPlay,
    currentSlotContext: HudContext.shopInventory,
    targetSlotIndex: targetSlot!.slotIndex,
    currentSlotIndex: slot!.slotIndex,
    removedItemId: removedItem,
  });
}

/**
 * Moves an item to the player in play
 * @param item The item being moved
 * @param targetSlotIndex The target slot index to move the item to.  If undefined, it uses the first empty slot
 */
export function moveItemInPlay(item: GameEntity, targetSlotIndex?: number) {
  const shopWindow = playerEntity.shopWindow;

  // Get the current slot them item resides in
  const slot = shopWindow.inventory.find((i) => i.item === item.entityId.value);

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slot) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  // Remove the item from that slot
  const removedItem = slot!.removeItem();

  // Find the target slot
  const targetSlot =
    targetSlotIndex !== undefined
      ? shopWindow.inPlay[targetSlotIndex]
      : shopWindow.inPlay.find((s) => !s.hasItem());

  // Add the item to the new slot
  shopWindow.inPlay[targetSlot!.slotIndex].addItem(removedItem);

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotContext: HudContext.playerInPlay,
    currentSlotContext: HudContext.playerShopInventory,
    targetSlotIndex: targetSlot!.slotIndex,
    currentSlotIndex: slot!.slotIndex,
    removedItemId: removedItem,
  });
}

/**
 * Moves an item to the npc's shop inventory
 * @param item The item being moved
 */
export function moveItemToShopInventory(
  item: GameEntity,
  targetSlotIndex?: number
) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.npcInPlay.find((slot) => {
    return slot.item === item.entityId.value;
  });

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slot) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  const removedItem = slot!.removeItem();

  // Find the target slot
  const targetSlot =
    targetSlotIndex !== undefined
      ? shopWindow.npcInventory[targetSlotIndex]
      : shopWindow.npcInventory.find((s) => !s.hasItem());

  shopWindow.npcInventory[targetSlot!.slotIndex].addItem(removedItem);

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotContext: HudContext.shopInventory,
    currentSlotContext: HudContext.shopInPlay,
    targetSlotIndex: targetSlot!.slotIndex,
    currentSlotIndex: slot!.slotIndex,
    removedItemId: removedItem,
  });
}

export function moveItemInSameInventoryGrid(
  itemId: string,
  itemSlots: ItemSlot[],
  hudContext: HudContext,
  targetSlotIndex: number
) {
  const item = world.entityManager.getEntityByName(itemId);
  const slotToRemoveItemFrom = itemSlots.find((slot) => {
    return slot.item === item.entityId.value;
  });

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slotToRemoveItemFrom) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  const removedItem = slotToRemoveItemFrom.removeItem();

  // Find the target slot
  itemSlots[targetSlotIndex].addItem(removedItem);

  // eventEmitter.emit(
  //   keys.itemSlots.ITEM_ADDED(hudContext),
  //   item,
  //   targetSlotIndex,
  //   slotToRemoveItemFrom.slotIndex,
  //   removedItem,
  //   true
  // );

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotIndex,
    targetSlotContext: hudContext,
    currentSlotContext: hudContext,
    currentSlotIndex: slotToRemoveItemFrom.slotIndex,
    removedItemId: removedItem,
  });
}

/**
 * Moves an item to the npc's shop inventory
 * @param item The item being moved
 */
export function moveItem(
  itemId: string,
  moveFromSlots: ItemSlot[],
  moveToSlots: ItemSlot[],
  targetSlotContext: HudContext,
  currentSlotContext: HudContext,
  targetSlotIndex?: number
) {
  const item = world.entityManager.getEntityByName(itemId);
  const slot = moveFromSlots.find((slot) => {
    return slot.item === item.entityId.value;
  });

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slot) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  const removedItem = slot!.removeItem();

  // Find the target slot
  const targetSlot =
    targetSlotIndex !== undefined
      ? moveToSlots[targetSlotIndex]
      : moveToSlots.find((s) => !s.hasItem());

  moveToSlots[targetSlot!.slotIndex].addItem(removedItem);

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotIndex: targetSlot!.slotIndex,
    targetSlotContext,
    currentSlotContext,
    currentSlotIndex: slot.slotIndex,
    removedItemId: removedItem,
  });
}

/**
 * Moves an item to the player's shop inventory
 * @param item The item being moved
 * @param targetSlotIndex The target slot index to move the item to.  If undefined, it uses the first empty slot
 */
export function movedItemToPlayerShopInventory(
  item: GameEntity,
  targetSlotIndex?: number
) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.inPlay.find((slot) => {
    return slot.item === item.entityId.value;
  });

  // If slot does not exist, it means you tried to move the item to an invalid slot
  if (!slot) {
    console.log("Tried to move an item to an invalid slot");
    return;
  }

  const removedItem = slot!.removeItem();

  const targetSlot =
    targetSlotIndex !== undefined
      ? shopWindow.inPlay[targetSlotIndex]
      : shopWindow.inventory.find((s) => !s.hasItem());

  shopWindow.inventory[targetSlot!.slotIndex].addItem(removedItem);

  shopSystem.events.emit(ShopEvent.ITEM_ADDED, {
    item,
    targetSlotIndex: targetSlot!.slotIndex,
    targetSlotContext: HudContext.playerShopInventory,
    currentSlotContext: HudContext.playerInPlay,
    currentSlotIndex: slot.slotIndex,
    removedItemId: removedItem,
  });
}

/**
 * Executes the trade and transfers items and gold between the player and the npc.
 */
export function executeTrade() {
  const playerCoinsInPlay = getGoldValueInSlots(playerEntity.shopWindow.inPlay);
  const shopCoinsInPlay = getGoldValueInSlots(
    playerEntity.shopWindow.npcInPlay
  );
  const playerItemsToReceive = getPlayerItemsToReceive();
  const npcItemsToReceive = getNpcItemsToReceive();
  const shopkeeperId = playerEntity.shopWindow.tradingWithEntityId;

  transferItemsToPlayer(playerItemsToReceive, shopkeeperId);
  transferItemsToNpc(npcItemsToReceive, shopkeeperId);
  applyNewGoldValues(playerCoinsInPlay, playerEntity.entityId.value);
  applyNewGoldValues(shopCoinsInPlay, shopkeeperId);

  shopSystem.events.emit(ShopEvent.TRADE_COMPLETED, undefined);

  playerEntity.removeComponent(ShopWindowComponent);
}

/**
 *
 * @param coinsInPlay The value of the coins in play
 * @param actor Either the player or the npc
 */
export function applyNewGoldValues(coinsInPlay: number, actor: string) {
  if (coinsInPlay > 0) {
    const item = getItemInInventoryWithMinQuantity(coinsInPlay, actor);

    if (item) {
      item.quantity_mutable.value -= coinsInPlay;
    }
  }
}

/**
 * Transfers items in the trade from the npc to the player
 * @param playerItemsToReceive An array of item entities that the player will receive
 * @param shopkeeperId The id of the shopkeeper
 */
export function transferItemsToPlayer(
  playerItemsToReceive: GameEntity[],
  shopkeeperId: string
) {
  const shopkeeper = world.entityManager.getEntityByName(shopkeeperId);
  playerItemsToReceive.forEach((itemToReceive) => {
    // If it has this component, it only exists in the context of the trade
    // This currently only occurs when gold is split to balance a trade
    const slotIndex = itemToReceive.pickedUp.slotIndex;

    if (!itemToReceive.hasComponent(TradeIdComponent)) {
      removeFromInventory(shopkeeper, slotIndex);
    }

    // Remove this because it's going to be replaced when we add it to the next inventory
    itemToReceive.removeComponent(PickedUpComponent);

    // If it's any item except gold, we can just add it directly to the inventory
    if (!itemToReceive.hasComponent(GoldComponent)) {
      addToInventory(playerEntity, itemToReceive);

      return;
    }

    const playerInventory = playerEntity.inventory_mutable;
    const { itemWithMatchingQuantityType } = getItemWithQuantityOfType(
      itemToReceive,
      playerInventory.slots
    );

    // If it's gold, let's add the quantity to an already existing gold stack (if exists)
    if (itemWithMatchingQuantityType) {
      applyNewItemQuantity(
        itemWithMatchingQuantityType,
        itemWithMatchingQuantityType.quantity.value +
          itemToReceive.quantity.value,
        HudContext.playerShopInventory
      );

      // If it has this component, it exists only in the context of the trade
      if (!itemToReceive.hasComponent(TradeIdComponent)) {
        removeFromInventory(playerEntity, slotIndex);
      }
      return;
    }

    addToInventory(playerEntity, itemToReceive);
  });
}

/**
 * Attempts to balance an offer between the player and the npc
 */
export function balanceOffer() {
  const playerInPlayValue = getValueOfItemsInSlots(
    playerEntity.shopWindow.inPlay
  );
  const npcInPlayValue = getValueOfItemsInSlots(
    playerEntity.shopWindow.npcInPlay
  );

  if (playerInPlayValue === npcInPlayValue) return;

  if (playerInPlayValue < npcInPlayValue) {
    // balance offer with the players gold
    balanceOfferWithPlayerGold(npcInPlayValue - playerInPlayValue);
  } else {
    balanceOfferWithNpcGold(playerInPlayValue - npcInPlayValue);
  }
}

/**
 * Attempts to balance the offer using the player's gold
 */
export function balanceOfferWithPlayerGold(differenceInValue: number) {
  const playerGoldEntities = getPlayerShopGoldEntities();
  const availableGold = calculateAvailableGold(playerGoldEntities);

  if (availableGold < differenceInValue) {
    // Not enough gold to balance the offer
    return;
  }

  const goldItemsSorted = sortGoldByQuantity(playerGoldEntities);
  balancePlayerGold(goldItemsSorted, differenceInValue);
}

/**
 *  Attempts to balance the offer using the npc's gold
 */
export function balanceOfferWithNpcGold(differenceInValue: number) {
  const goldEntities = getShopGoldEntities();
  const availableGold = calculateAvailableGold(goldEntities);

  if (availableGold < differenceInValue) {
    // Not enough gold to balance the offer
    return;
  }

  const goldItemsSorted = sortGoldByQuantity(goldEntities);
  balanceNpcGold(goldItemsSorted, differenceInValue);
}

/**
 * Transfers items in the trade from the player to the npc
 * @param npcItemsToReceive An array of item entities that the npc will receive
 * @param shopkeeperId The id of the shopkeeper
 */
export function transferItemsToNpc(
  npcItemsToReceive: GameEntity[],
  shopkeeperId: string
) {
  const shopkeeper = world.entityManager.getEntityByName(shopkeeperId);
  npcItemsToReceive.forEach((itemToReceive) => {
    // If it has this component, it only exists in the context of the trade
    // This currently only occurs when gold is split to balance a trade
    const slotIndex = itemToReceive.pickedUp.slotIndex;

    if (!itemToReceive.hasComponent(TradeIdComponent)) {
      removeFromInventory(playerEntity, slotIndex);
    }

    // Remove this because it's going to be replaced when we add it to the next inventory
    itemToReceive.removeComponent(PickedUpComponent);

    // If it's any item except gold, we can just add it directly to the inventory
    if (!itemToReceive.hasComponent(GoldComponent)) {
      addToInventory(shopkeeper, itemToReceive);

      return;
    }

    const npcInventory = shopkeeper.inventory;
    const { itemWithMatchingQuantityType } = getItemWithQuantityOfType(
      itemToReceive,
      npcInventory.slots
    );

    // If it's gold, let's add the quantity to an already existing gold stack (if exists)
    if (itemWithMatchingQuantityType) {
      applyNewItemQuantity(
        itemWithMatchingQuantityType,
        itemWithMatchingQuantityType.quantity.value +
          itemToReceive.quantity.value,
        HudContext.shopInventory
      );

      // If it has this component, it exists only in the context of the trade
      if (!itemToReceive.hasComponent(TradeIdComponent)) {
        removeFromInventory(playerEntity, slotIndex);
      }

      return;
    }

    addToInventory(shopkeeper, itemToReceive);
  });
}

/**
 * Gets the array of items that will be transferred to the npc
 * @returns The array of items that will be transferred to the npc
 */
export function getNpcItemsToReceive(): GameEntity[] {
  const shopWindow = playerEntity.shopWindow;

  const npcItemsToReceive: GameEntity[] = [];

  shopWindow.inPlay
    .filter((s) => s.hasItem())
    .forEach((s) => {
      const item = s.removeItem();
      npcItemsToReceive.push(world.entityManager.getEntityByName(item));
    });

  return npcItemsToReceive;
}

/**
 * Gets the array of items that will be transferred to the player
 * @returns The array of items that will be transferred to the player
 */
export function getPlayerItemsToReceive(): GameEntity[] {
  const shopWindow = playerEntity.shopWindow;

  const playerItemsToReceive: GameEntity[] = [];

  shopWindow.npcInPlay
    .filter((s) => s.hasItem())
    .forEach((s) => {
      const item = s.removeItem();
      playerItemsToReceive.push(world.entityManager.getEntityByName(item));
    });

  return playerItemsToReceive;
}

/**
 *
 * @param itemToAdd The item with quantity to add to another stack
 * @param slotsToCheck The slots to search to find a matching item type and stack
 */
export const getItemWithQuantityOfType = (
  itemToAdd: GameEntity,
  slotsToCheck: ItemSlot[]
): {
  itemWithMatchingQuantityType: GameEntity | null;
  slot: ItemSlot | null;
} => {
  let itemToReturn: GameEntity | null = null;
  let itemSlot: ItemSlot | null = null;
  slotsToCheck.find((s) => {
    if (!s.item) return false;

    const itemEntity = world.entityManager.getEntityByName(s.item);

    if (
      itemEntity.hasComponent(QuantityComponent) &&
      itemEntity.entityId.itemBase === itemToAdd.entityId.itemBase
    ) {
      itemToReturn = itemEntity;
      itemSlot = s;
      return true;
    }
  });

  return { itemWithMatchingQuantityType: itemToReturn, slot: itemSlot };
};

/**
 * This will clone an item slot and return a new instance.
 * If the item in the slot is gold, it will clone the gold, and insert into the slot.
 * This is so that modifying the quantity of the gold only happens within the context of the trade
 * @param s The item slot to clone
 * @param tradeId The id of the trade
 * @returns a new item slot
 */
export function mapInventorySlot(s: ItemSlot, tradeId: string) {
  let itemId = "";
  if (!s.hasItem()) {
    return new ItemSlot(itemId, s.slotIndex);
  }

  const item = world.entityManager.getEntityByName(s.item);
  itemId = item.entityId.value;

  // Clone the gold so that we are not modifying the state of the actual npcs inventory
  if (item.hasComponent(GoldComponent)) {
    const clonedGold = getGold(item.quantity.value);
    const clonedGoldEntity = initializeEntity(clonedGold);
    clonedGoldEntity.addComponent<TradeIdComponent>(TradeIdComponent, {
      tradeId: tradeId,
    });

    clonedGoldEntity.addComponent<PickedUpComponent>(PickedUpComponent, {
      slotIndex:
        item.getComponent<PickedUpComponent>(PickedUpComponent).slotIndex,
    });

    itemId = clonedGoldEntity.entityId.value;
  }

  return new ItemSlot(itemId, s.slotIndex);
}

export function getGoldValueInSlots(slots: ItemSlot[]) {
  let value = 0;
  slots.forEach((slot) => {
    if (slot.hasItem()) {
      const item = world.entityManager.getEntityByName(slot.item);
      if (item.hasComponent(GoldComponent)) value += item.quantity.value;
    }
  });

  return value;
}

export function getValueOfItemsInSlots(slots: ItemSlot[]): number {
  let value = 0;
  slots.forEach((slot) => {
    if (slot.hasItem()) {
      const item = world.entityManager.getEntityByName(slot.item);
      const valuable = item.valuable;
      const qty = item.getComponent<QuantityComponent>(QuantityComponent);
      if (qty) {
        value += valuable!.value * qty.value;
      } else {
        value += valuable!.value;
      }
    }
  });

  return value;
}
