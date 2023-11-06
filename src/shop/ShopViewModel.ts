import TradeScene from "../scenes/TradeScene.ts";
import { GameEntity } from "../ecs/GameEntity.ts";
import {
  DescriptorComponent,
  GoldComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
  ShopWindowComponent,
  TradeIdComponent,
} from "../ecs/components/Components.ts";
import { ItemSlot } from "../ecs/components/Inventory.ts";

import { playerEntity, world } from "../main.ts";

class ShopViewModel {
  scene!: TradeScene;

  itemsInPlay: GameEntity[] = [];
  shopItemsInPlay: GameEntity[] = [];

  registerScene(tradeScene: TradeScene) {
    this.scene = tradeScene;
  }

  closeShopWindow() {
    this.scene!.shopWindow!.close();
    this.itemsInPlay = [];
    this.shopItemsInPlay = [];

    const tradeItems = world.entityManager.queryComponents([TradeIdComponent]);

    tradeItems.entities.forEach((item: GameEntity) => {
      item.renderable!.tradeModel?.destroy(true);
    });

    this.updateShopWindow();

    playerEntity.removeComponent(ShopWindowComponent);
  }

  calculateInPlayValue(itemEntities: GameEntity[]): number {
    let value = 0;
    itemEntities.forEach((entity) => {
      const valuable = entity.valuable;
      const qty = entity.getComponent<QuantityComponent>(QuantityComponent);
      if (qty) {
        value += valuable!.value * qty.value;
      } else {
        value += valuable!.value;
      }
    });

    return value;
  }

  updateShopWindow() {
    this.scene?.shopWindow?.updatePlayerCoins(this.playerCoins);
    this.scene?.shopWindow?.updateShopCoins(this.shopCoins);
    this.scene?.shopWindow?.updateCoinsInPlay(this.inPlayValue);
    this.scene?.shopWindow?.updateShopCoinsInPlay(this.shopInPlayValue);
  }

  showShopWindow(
    tradingWithInventory: InventoryComponent,
    shopName: string,
    shopItemEntities: GameEntity[],
    playerName: string,
    playerInventory: InventoryComponent,
    playerItemEntities: GameEntity[]
  ) {
    const shopItems = shopItemEntities.map((item) => {
      return {
        entity: item,
        pickedUp: item.getComponent(PickedUpComponent),
        descriptor: item.getComponent(DescriptorComponent),
        renderable: item.renderable_mutable,
        quantity: item.getComponent(QuantityComponent),
        tradeId: item.getComponent(TradeIdComponent),
      };
    });
    const playerItems = playerItemEntities.map((item) => {
      return {
        entity: item,
        pickedUp: item.getComponent(PickedUpComponent),
        descriptor: item.getComponent(DescriptorComponent),
        renderable: item.renderable_mutable,
        quantity: item.getComponent(QuantityComponent),
        tradeId: item.getComponent(TradeIdComponent),
      };
    });

    this.scene.shopWindow!.initialize(
      shopName,
      playerName,
      shopItems,
      playerItems,
      this.playerCoins,
      this.shopCoins
    );

    this.scene.shopWindow!.open();
  }

  get playerCoins(): number {
    const itemEntities: GameEntity[] = [];
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    shopWindow.inventory.forEach((itemSlot: ItemSlot) => {
      if (itemSlot.hasItem()) {
        itemEntities.push(
          world.entityManager.getEntityByName(`${itemSlot.item}`)
        );
      }
    });

    let value = 0;
    itemEntities.forEach((item: GameEntity) => {
      if (item.hasComponent(GoldComponent)) value += item.quantity.value;
    });

    return value;
  }

  get playerCoinsInPlay(): number {
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    let value = 0;
    shopWindow.inPlay.forEach((itemSlot: ItemSlot) => {
      if (itemSlot.hasItem()) {
        const item = world.entityManager.getEntityByName(`${itemSlot.item}`);
        if (item.hasComponent(GoldComponent)) value += item.quantity.value;
      }
    });

    return value;
  }

  get shopCoinsInPlay(): number {
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    let value = 0;
    shopWindow.npcInPlay.forEach((itemSlot: ItemSlot) => {
      if (itemSlot.hasItem()) {
        const item = world.entityManager.getEntityByName(`${itemSlot.item}`);
        if (item.hasComponent(GoldComponent)) value += item.quantity.value;
      }
    });

    return value;
  }

  get shopCoins(): number {
    const itemEntities: GameEntity[] = [];
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    shopWindow.npcInventory.forEach((itemSlot) => {
      if (itemSlot.hasItem()) {
        itemEntities.push(
          world.entityManager.getEntityByName(`${itemSlot.item}`)
        );
      }
    });

    let value = 0;
    itemEntities.forEach((item) => {
      if (item.hasComponent(GoldComponent)) value += item.quantity.value;
    });

    return value;
  }

  get inPlayValue() {
    const itemEntities: GameEntity[] = [];
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    shopWindow.inPlay.forEach((itemSlot) => {
      if (itemSlot.hasItem()) {
        itemEntities.push(
          world.entityManager.getEntityByName(`${itemSlot.item}`)
        );
      }
    });

    return this.calculateInPlayValue(itemEntities);
  }

  get shopInPlayValue() {
    const itemEntities: GameEntity[] = [];
    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent)!;
    shopWindow.npcInPlay.forEach((itemSlot) => {
      if (itemSlot.hasItem()) {
        itemEntities.push(
          world.entityManager.getEntityByName(`${itemSlot.item}`)
        );
      }
    });

    return this.calculateInPlayValue(itemEntities);
  }

  removeItemFromPlayerInventory(slot: number) {
    this.scene.shopWindow!.removeItemFromPlayerInventory(slot);
  }

  removeItemFromPlayerInPlay(slotIndex: number, removedItemId: string) {
    this.scene.shopWindow!.removeItemFromPlayerInPlay(slotIndex);
    this.itemsInPlay = this.itemsInPlay.filter(
      (i: GameEntity) => i.entityId.value === removedItemId
    );
  }

  moveItemInPlay(entity: GameEntity, newSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    this.scene.shopWindow!.addToPlayerInPlay(
      {
        renderable,
        descriptor,
        entity,
        quantity,
      },
      newSlotIndex
    );

    this.itemsInPlay.push(entity);
  }

  moveItemShopInPlay(entity: GameEntity, newSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    this.scene.shopWindow!.addToShopInPlay(
      {
        renderable,
        descriptor,
        entity,
        quantity,
      },
      newSlotIndex
    );

    this.shopItemsInPlay.push(entity);
  }
  removeItemFromShopInventory(slot: number) {
    this.scene.shopWindow!.removeItemFromShopInventory(slot);
  }
  removeItemFromShopInPlay(slot: number, removedItemId: string) {
    this.scene.shopWindow!.removeItemFromShopInPlay(slot);
    this.shopItemsInPlay = this.shopItemsInPlay.filter(
      (i: GameEntity) => i.entityId.value === removedItemId
    );
  }
  moveItemToShopInventory(entity: GameEntity, targetSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    this.scene.shopWindow!.addToShopInventory(
      {
        renderable,
        descriptor,
        entity,
        quantity,
      },
      targetSlotIndex
    );
  }
  moveItemToPlayerInventory(entity: GameEntity, targetSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    this.scene.shopWindow!.addToPlayerInventory(
      {
        renderable,
        descriptor,
        entity,
        quantity,
      },
      targetSlotIndex
    );
  }
}

export const shopViewModel = new ShopViewModel();
