import { GameEntity } from "../../GameEntity.ts";
import { initializeItem } from "../../InitializeItem.ts";
import { getGold } from "../../Items.ts";
import { shopViewModel } from "../../ShopViewModel.ts";
import {
  EntityIdComponent,
  GoldComponent,
  InventoryComponent,
  ItemIdComponent,
  PickedUpComponent,
  QuantityComponent,
  ShopWindowComponent,
  TradeIdComponent,
} from "../../components/Components.ts";
import EntityId from "../../components/EntityId.ts";
import { ItemSlot } from "../../components/Inventory.ts";
import { playerEntity, world } from "../../main.ts";
import {
  addToInventory,
  getItemInInventoryWithMinQuantity,
  removeFromInventory,
  sumInventoryGoldEntities,
} from "../inventory/InventoryUtilities.ts";

export function calculateValueDifference(): number {
  // Assuming shopViewModel is accessible in this scope
  const playerValue = shopViewModel.inPlayValue;
  const npcValue = shopViewModel.shopInPlayValue;
  return npcValue - playerValue;
}

export function getPlayerGoldEntities(): GameEntity[] {
  const shopwindow = playerEntity.getComponent(ShopWindowComponent);
  // Assuming gameSystem is accessible in this scope
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return shopwindow!.inventory.some(
        (slot) => slot.hasItem() && slot.item === itemId
      );
    });
}

export function getGoldEntities(slots: ItemSlot[]): GameEntity[] {
  // Assuming gameSystem is accessible in this scope
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return slots.some((slot) => slot.hasItem() && slot.item === itemId);
    });
}

export function getNpcGoldEntities(): GameEntity[] {
  const shopwindow = playerEntity.getComponent(ShopWindowComponent);
  // Assuming gameSystem is accessible in this scope
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return shopwindow!.npcInventory.some(
        (slot) => slot.hasItem() && slot.item === itemId
      );
    });
}

export function calculateAvailableGold(goldEntities: GameEntity[]): number {
  return goldEntities.reduce((totalGold, entity) => {
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
  amount: number
): GameEntity {
  baseItem.quantity_mutable!.value -= amount;

  const splitItem = getGold(amount);
  const entity = initializeItem(splitItem);

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
      slots.find((s) => s.item === entity.entityId!.value).slotIndex
    );
  }
}

export function balancePlayerGold(
  goldItems: GameEntity[],
  differenceInValue: number,
  shopKeeper: GameEntity
): void {
  const shopWindow = playerEntity.shopWindow;

  goldItems.forEach((goldItem) => {
    if (differenceInValue <= 0) return;
    const quantityOfGoldItem = goldItem.quantity.value;

    if (differenceInValue - quantityOfGoldItem < 0) {
      const { item, slot } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.inPlay
      );

      if (item && slot) {
        item.quantity.value += differenceInValue;
        goldItem.quantity_mutable.value -= differenceInValue;

        removeItemIfQuantityZero(goldItem, shopWindow.inventory);
      } else {
        const splitItem = splitGoldStack(
          goldItem,
          differenceInValue,
          shopKeeper
        );
        // Do this so that we can call itemMovedInPlay
        shopWindow.inventory.find((i) => !i.hasItem())?.addItem(splitItem.entityId.value);
        const slotToAddTo = shopWindow.inPlay.find((i) => !i.hasItem());

        itemMovedInPlay(splitItem);

        splitItem.addComponent(TradeIdComponent, {
          tradeId: shopWindow.tradingWithEntityId,
        });
        splitItem.addComponent<PickedUpComponent>(PickedUpComponent, {
          slotIndex: slotToAddTo.slotIndex,
        });
      }
    } else {
      const { item } = getItemWithQuantityOfType(goldItem, shopWindow.inPlay);

      if (item) {
        item.quantity.value += quantityOfGoldItem;
        goldItem.quantity_mutable.value -= differenceInValue;

        removeItemIfQuantityZero(goldItem, shopWindow.inventory);
      } else {
        itemMovedInPlay(goldItem);
      }
    }

    differenceInValue -= quantityOfGoldItem;
  });
}

export function balanceNpcGold(
  goldItems: GameEntity[],
  differenceInValue: number,
  shopKeeper: GameEntity
): void {
  const shopWindow = playerEntity.shopWindow;

  goldItems.forEach((goldItem) => {
    if (differenceInValue <= 0) return;
    const quantityOfGoldItem = goldItem.quantity.value;

    if (differenceInValue - quantityOfGoldItem < 0) {
      const { item, slot } = getItemWithQuantityOfType(
        goldItem,
        shopWindow.npcInPlay
      );

      if (item && slot) {
        item.quantity.value += differenceInValue;
        goldItem.quantity_mutable.value -= differenceInValue;

        removeItemIfQuantityZero(goldItem, shopWindow.inventory);
      } else {
        const splitItem = splitGoldStack(
          goldItem,
          differenceInValue,
          shopKeeper
        );

        shopWindow.npcInventory.find((i) => !i.hasItem())?.addItem(splitItem.entityId.value);
        const slotToAddTo = shopWindow.npcInPlay.find((i) => !i.hasItem());

        itemMovedShopInPlay(splitItem);

        splitItem.addComponent(TradeIdComponent, {
          tradeId: shopWindow.tradingWithEntityId,
        });
        splitItem.addComponent<PickedUpComponent>(PickedUpComponent, {
          slotIndex: slotToAddTo.slotIndex,
        });
      }
    } else {
      const { item } = getItemWithQuantityOfType(goldItem, shopWindow.inPlay);

      if (item) {
        item.quantity.value += quantityOfGoldItem;
        goldItem.quantity_mutable.value -= differenceInValue;

        removeItemIfQuantityZero(goldItem, shopWindow.npcInventory);
      } else {
        itemMovedShopInPlay(goldItem);
      }
    }

    differenceInValue -= quantityOfGoldItem;
  });
}

/**
 * Removes the item from the player shop inventory
 * @param message
 */
export function itemRemovedFromPlayerInventory(slotIndex: number) {
  const slot = playerEntity.shopWindow.inventory[slotIndex];
  slot.removeItem();
  shopViewModel.removeItemFromPlayerInventory(slotIndex);
}

/**
 * Moves an item to the npc shop in play
 * @param message
 */
export function itemMovedShopInPlay(item: GameEntity) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.npcInventory.find(
    (i) => i.item === item.entityId.value
  );

  const removedItem = slot!.removeItem();

  const targetSlotIndex = shopWindow.npcInPlay.find(
    (s) => !s.hasItem()
  ).slotIndex;

  shopWindow.npcInPlay[targetSlotIndex].item = item.entityId.value;

  shopViewModel.moveItemShopInPlay(item, targetSlotIndex);
  shopViewModel.removeItemFromShopInventory(slot.slotIndex, removedItem);
  shopViewModel.updateShopWindow();
}

/**
 * Removes an item from the npc shop inventory
 * @param message
 */
export function itemRemovedFromShopInventory(message: ItemRemoved) {
  const shopWindow = playerEntity.shopWindow;
  shopWindow.npcInventory[message.slotIndex].item = "";
  shopViewModel.removeItemFromShopInventory(message.slotIndex);
  shopViewModel.updateShopWindow();
}

/**
 * Moves an item to the player in play
 * @param message
 */
export function itemMovedInPlay(item: GameEntity) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.inventory.find((i) => i.item === item.entityId.value);

  const removedItem = slot!.removeItem();

  const targetSlot = shopWindow.inPlay.find((s) => !s.hasItem());

  shopWindow.inPlay[targetSlot!.slotIndex].item = removedItem;

  shopViewModel.moveItemInPlay(item, targetSlot!.slotIndex);
  shopViewModel.removeItemFromPlayerInventory(slot!.slotIndex);
  shopViewModel.updateShopWindow();
}

export function itemRemovedFromShopInPlay(message: ItemRemoved) {
  const shopWindow = playerEntity.shopWindow;

  const removedItem = shopWindow.npcInPlay[message.slotIndex].removeItem();

  shopViewModel.removeItemFromShopInPlay(message.slotIndex, removedItem);
}
export function itemRemovedFromPlayerInPlay(message: ItemRemoved) {
  const shopWindow = playerEntity.shopWindow;
  const removedItem = shopWindow.inPlay[message.slotIndex].removeItem();
  shopViewModel.removeItemFromPlayerInPlay(message.slotIndex, removedItem);
}
export function itemAddedToShopInventory(message: ItemAdded) {
  const entity = gameSystem.initializeItem(message.item);

  const shopWindow =
    gameSystem.player.value.getMutableComponent<ShopWindowComponent>(
      ShopWindowComponent
    );

  const pickedUp = entity.getComponent<PickedUpComponent>(PickedUpComponent);
  // pickedUp.slotIndex = message.targetSlotIndex;
  shopWindow.npcInventory[pickedUp.slotIndex].item.value =
    entity.getComponent<ItemIdComponent>(ItemIdComponent).value;

  shopViewModel.moveItemToShopInventory(entity, pickedUp.slotIndex);
}
export function itemMovedToShopInventory(item: GameEntity) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.npcInPlay.find((slot) => {
    return slot.item === item.entityId.value;
  });

  const removedItem = slot!.removeItem();

  const targetSlotIndex = shopWindow.npcInventory.find(
    (s) => !s.hasItem()
  ).slotIndex;

  shopWindow.npcInventory[targetSlotIndex].item = removedItem;

  shopViewModel.moveItemToShopInventory(item, targetSlotIndex);
  shopViewModel.removeItemFromShopInPlay(slot.slotIndex, removedItem);
  shopViewModel.updateShopWindow();
}
export function itemMovedToPlayerShopInventory(item: GameEntity) {
  const shopWindow = playerEntity.shopWindow;

  const slot = shopWindow.inPlay.find((slot) => {
    return slot.item === item.entityId.value;
  });

  const removedItem = slot!.removeItem();

  const targetSlot = shopWindow.inventory.find((s) => !s.hasItem());

  shopWindow.inventory[targetSlot!.slotIndex].item = removedItem;

  shopViewModel.moveItemToPlayerInventory(item, targetSlot!.slotIndex);
  shopViewModel.removeItemFromPlayerInPlay(slot!.slotIndex, removedItem);
  shopViewModel.updateShopWindow();
}

export function executeTrade() {
  const playerItemsToReceive = getPlayerItemsToReceive();
  const npcItemsToReceive = getNpcItemsToReceive();
  const shopkeeperId = playerEntity.shopWindow.tradingWithEntityId;

  transferItemsToPlayer(playerItemsToReceive, shopkeeperId);
  transferItemsToNpc(npcItemsToReceive, shopkeeperId);
  applyNewPlayerGoldValues();
  applyNewNpcGoldValues();
  shopViewModel.closeShopWindow();
}

export function applyNewPlayerGoldValues() {
  const shopWindow = playerEntity.shopWindow;
  const playerShopGoldValue = shopViewModel.playerCoins;
  const playerInventoryGoldValue = sumInventoryGoldEntities(
    playerEntity.inventory.slots
  );
  const differenceInValue = playerShopGoldValue - playerInventoryGoldValue;

  if (differenceInValue > 0) {
    // const item = getItemInInventoryWithMinQuantity(
    //   differenceInValue,
    //   gameSystem.getPlayerId()
    // );
    // if (item) {
    //   item.quantity.value.value += differenceInValue;
    // }
  } else if (differenceInValue < 0) {
    const item = getItemInInventoryWithMinQuantity(
      differenceInValue,
      playerEntity.entityId.value
    );

    if (item) {
      item.quantity_mutable.value += differenceInValue;
    }
  }
}

export function applyNewNpcGoldValues() {
  const shopWindow = playerEntity.shopWindow;
  const npcShopGoldValue = shopViewModel.shopCoins;

  const npcInventoryGoldValue = sumInventoryGoldEntities(
    world.entityManager.getEntityByName(shopWindow.tradingWithEntityId)
      .inventory.slots
  );
  const differenceInValue = npcShopGoldValue - npcInventoryGoldValue;

  if (differenceInValue > 0) {
    // const item = getItemInInventoryWithMinQuantity(
    //   differenceInValue,
    //   shopWindow.tradingWithEntityId
    // );
    // if (item) {
    //   item.quantity.value.value += differenceInValue;
    // }
  } else if (differenceInValue < 0) {
    const item = getItemInInventoryWithMinQuantity(
      differenceInValue,
      shopWindow.tradingWithEntityId
    );

    if (item) {
      item.quantity_mutable.value += differenceInValue;
    }
  }
}

export function transferItemsToPlayer(
  playerItemsToReceive: GameEntity[],
  shopkeeperId: string
) {
  const shopkeeper = world.entityManager.getEntityByName(shopkeeperId);
  playerItemsToReceive.forEach((item) => {
    removeFromInventory(
      shopkeeper,
      item.pickedUp.slotIndex
    );

    // Remove this because it's going to be replaced when we add it to the next inventory
    item.removeComponent(PickedUpComponent);
    addToInventory(playerEntity, item);
  });
}

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
    const { item } = getItemWithQuantityOfType(
      itemToReceive,
      npcInventory.slots
    );

    // If it's gold, let's add the quantity to an already existing gold stack (if exists)
    if (item) {
      item.quantity_mutable.value += itemToReceive.quantity.value;

      removeFromInventory(playerEntity, slotIndex);
      return;
    }

    addToInventory(shopkeeper, itemToReceive);
  });
}

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
): { item: GameEntity | undefined; slot: ItemSlot | undefined } => {
  let itemToReturn: GameEntity = null;
  let itemSlot: ItemSlot = null;
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

  return { item: itemToReturn, slot: itemSlot };
};
