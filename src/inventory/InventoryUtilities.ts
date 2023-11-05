import { GameEntity } from "../ecs/GameEntity.ts";
import {
  GoldComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
} from "../ecs/components/Components.ts";
import { ItemSlot } from "../ecs/components/Inventory.ts";
import { playerEntity, world } from "../main.ts";
import { getGoldEntities, getShopGoldEntities } from "../shop/ShopUtilities.ts";

export function getPlayerInventoryGoldEntities(): GameEntity[] {
  const inventory = playerEntity.inventory;
  return world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity: GameEntity) => {
      const itemId = entity.entityId.value;
      return inventory.slots.some(
        (slot) => slot.hasItem() && slot.item === itemId
      );
    });
}

export function sumPlayerInventoryGoldEntities(): number {
  let value = 0;
  const playerGoldEntities = getPlayerInventoryGoldEntities();
  playerGoldEntities.forEach((entity) => {
    value += entity.quantity.value;
  });

  return value;
}

export function sumInventoryGoldEntities(slots: ItemSlot[]): number {
  let value = 0;
  const goldEntities = getGoldEntities(slots);
  goldEntities.forEach((entity) => {
    value += entity.quantity.value;
  });

  return value;
}

export function sumNpcInventoryGoldEntities(): number {
  let value = 0;
  const playerGoldEntities = getShopGoldEntities();
  playerGoldEntities.forEach((entity) => {
    value += entity.quantity.value;
  });

  return value;
}

export function getItemInSlot(
  slotIndex: number,
  actor: string
): GameEntity | null {
  const inventory = playerEntity.inventory;

  const slot = inventory.slots[slotIndex];

  if (slot.hasItem()) {
    return world.entityManager.getEntityByName(slot.item);
  }

  return null;
}

export function getItemInInventoryWithMinQuantity(
  minQty: number,
  actor: string
): GameEntity | null {
  const inventory = world.entityManager
    .getEntityByName(actor)
    .getComponent<InventoryComponent>(InventoryComponent);

  let itemWithMinQty: GameEntity | null = null;
  inventory.items.find((i: string) => {
    const item = world.entityManager.getEntityByName(i) as GameEntity;
    if (!item.hasComponent(QuantityComponent)) return false;

    if (item.quantity.value >= minQty) {
      itemWithMinQty = item;
      return true;
    }

    return false;
  });

  return itemWithMinQty;
}

export const addToInventory = (actor: GameEntity, item: GameEntity) => {
  const inventory = actor.inventory_mutable;

  const hasPickedUp = item.hasComponent(PickedUpComponent);

  const slot = hasPickedUp
    ? item.pickedUp.slotIndex
    : inventory.firstAvailableSlot()!.slotIndex;
  if (!hasPickedUp) {
    item.addComponent<PickedUpComponent>(PickedUpComponent, {
      slotIndex: slot,
    });
  }

  const itemId = item.entityId.value;
  inventory.slots[slot].item = itemId;
  inventory.items.push(itemId);

  // if (entity == playerEntity) inventoryViewModel.addItem(itemEntity);
};

export const removeFromInventory = (actor: GameEntity, index: number): void => {
  const inventory = actor.inventory_mutable;

  if (actor == playerEntity) {
    const itemToRemove = inventory.slots[index].removeItem();
    inventory.items = inventory.items.filter((item) => item !== itemToRemove);
    // inventoryViewModel.removeFromSlot(index);
  } else {
    const itemToRemove = inventory.slots[index].removeItem();
    inventory.items = inventory.items.filter((item) => item !== itemToRemove);
  }
};
