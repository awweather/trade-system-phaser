import { GameEntity } from "../../GameEntity.ts";
import ItemSlot from "../../ItemSlot.ts";
import {
  GoldComponent,
  InventoryComponent,
  ItemIdComponent,
  PickedUpComponent,
  QuantityComponent,
} from "../../components/Components.ts";
import { world } from "../../main.ts";
import { getGoldEntities, getNpcGoldEntities } from "../shop/ShopUtilities.ts";

export function getPlayerInventoryGoldEntities(): GameEntity[] {
  const inventory = gameSystem.player.value.getComponent(InventoryComponent);
  // Assuming gameSystem is accessible in this scope
  return gameSystem.world.entityManager
    .queryComponents([GoldComponent])
    .entities.filter((entity) => {
      const itemId = entity.getComponent(ItemIdComponent).value;
      return inventory.slots.some(
        (slot) => slot.hasItem() && slot.item.value === itemId
      );
    });
}

export function sumPlayerInventoryGoldEntities(): number {
  let value = 0;
  const playerGoldEntities = getPlayerInventoryGoldEntities();
  playerGoldEntities.forEach((entity) => {
    value += entity.quantity.value.value;
  });

  return value;
}

export function sumInventoryGoldEntities(slots: ItemSlot[]): number {
  let value = 0;
  const goldEntities = getGoldEntities(slots);
  goldEntities.forEach((entity) => {
    value += entity.quantity.value.value;
  });

  return value;
}

export function sumNpcInventoryGoldEntities(): number {
  let value = 0;
  const playerGoldEntities = getNpcGoldEntities();
  playerGoldEntities.forEach((entity) => {
    value += entity.quantity.value.value;
  });

  return value;
}

export function getItemInSlot(
  slotIndex: number,
  actor: string
): GameEntity | null {
  const inventory = gameSystem
    .getPlayerEntity(actor)
    .getComponent<InventoryComponent>(InventoryComponent);

  const slot = inventory.slots[slotIndex];

  if (slot.item.value) {
    return gameSystem.getItemEntityById(slot.item.value);
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
  inventory.items.find((i) => {
    const item = world.entityManager.getEntityByName(i);
    if (!item.hasComponent(QuantityComponent)) return false;

    if (item.quantity.value.value >= minQty) {
      itemWithMinQty = item;
      return true;
    }

    return false;
  });

  return itemWithMinQty;
}

export const addToInventory = (message: ItemAdded) => {
  const entity = world.entityManager.getEntityByName(message.actor);
  const itemEntity = message.item;

  const inventory = entity.getComponent<InventoryComponent>(InventoryComponent);

  const pickedUp =
    itemEntity.getComponent<PickedUpComponent>(PickedUpComponent);

  const slot = pickedUp?.slotIndex || inventory.firstAvailableSlot().slotIndex;
  if (!pickedUp) {
    itemEntity.addComponent<PickedUpComponent>(PickedUpComponent, {
      slotIndex: slot,
    });
  }

  const itemId = itemEntity.entityId.value;
  inventory.slots[slot].item = itemId;
  inventory.items.push(itemId);

  // if (entity == playerEntity) inventoryViewModel.addItem(itemEntity);
};
