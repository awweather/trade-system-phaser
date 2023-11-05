import { GameEntity } from "./GameEntity.ts";
import ItemSlot from "./ItemSlot.ts";
import TradeScene from "./TradeScene.ts";
import {
  DescriptorComponent,
  GoldComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
  ShopWindowComponent,
  TradeIdComponent,
} from "./components/Components.ts";
import { playerEntity, world } from "./main.ts";

class ShopViewModel {
  scene: TradeScene | null;

  itemsInPlay: GameEntity[] = [];
  shopItemsInPlay: GameEntity[] = [];

  constructor() {
    this.scene = null;
  }

  registerScene(tradeScene: TradeScene) {
    this.scene = tradeScene;
  }

  closeShopWindow() {
    // this.scene!.shopWindow.close();
    this.itemsInPlay = [];
    this.shopItemsInPlay = [];

    const tradeItems = world.entityManager.queryComponents([TradeIdComponent]);

    tradeItems.entities.forEach((item: GameEntity) => {
      item.renderable!.tradeModel?.destroy(true);
    });

    // gameSystem.player.value.removeComponent(ShopWindowComponent);
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

    this.scene!.shopWindow.initialize(
      shopName,
      playerName,
      shopItems,
      playerItems,
      this.playerCoins,
      this.shopCoins,
      this.shopInPlayValue,
      this.inPlayValue
    );
    this.scene!.shopWindow.open();
    // this.scene.populateItems(shopItems, playerItems);
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
    this.scene!.shopWindow.removeItemFromPlayerInventory(slot);
  }

  removeItemFromPlayerInPlay(slotIndex: number, removedItemId: string) {
    this.scene!.shopWindow.removeItemFromPlayerInPlay(slotIndex);
    this.itemsInPlay = this.itemsInPlay.filter(
      (i: GameEntity) => i.entityId.value === removedItemId
    );
  }

  moveItemInPlay(entity: GameEntity, newSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    const item = this.scene!.shopWindow.addToPlayerInPlay(
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
    const item = this.scene!.shopWindow.addToShopInPlay(
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
    this.scene!.shopWindow.removeItemFromShopInventory(slot);
  }
  removeItemFromShopInPlay(slot: number, removedItemId: string) {
    const item = this.scene!.shopWindow.removeItemFromShopInPlay(slot);
    this.shopItemsInPlay.value = this.shopItemsInPlay.filter(
      (i: GameEntity) => i.entityId.value === removedItemId
    );
  }
  moveItemToShopInventory(entity: GameEntity, targetSlotIndex: number) {
    const renderable = entity.renderable_mutable;
    const descriptor =
      entity.getComponent<DescriptorComponent>(DescriptorComponent);
    const quantity = entity.getComponent<QuantityComponent>(QuantityComponent);
    const item = this.scene!.shopWindow.addToShopInventory(
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
    const item = this.scene!.shopWindow.addToPlayerInventory(
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
