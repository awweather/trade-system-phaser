import { GameEntity } from "../../ecs/GameEntity.ts";
import {
  GoldComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
} from "../../ecs/components/Components.ts";
import { playerEntity, world } from "../../main.ts";
import { ItemSlot } from "./ItemSlot.ts";

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
  inventory.slots[slot].addItem(itemId);
  inventory.items.push(itemId);
};

export const removeFromInventory = (actor: GameEntity, index: number): void => {
  const inventory = actor.inventory_mutable;

  if (actor == playerEntity) {
    const itemToRemove = inventory.slots[index].removeItem();
    inventory.items = inventory.items.filter((item) => item !== itemToRemove);
  } else {
    const itemToRemove = inventory.slots[index].removeItem();
    inventory.items = inventory.items.filter((item) => item !== itemToRemove);
  }
};

export function getItemsFromSlots(slots: ItemSlot[]) {
  return slots
    .filter((s) => s.hasItem())
    .map((s) => world.entityManager.getEntityByName(s.item));
}
