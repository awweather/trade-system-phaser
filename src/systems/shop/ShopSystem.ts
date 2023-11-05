import { System } from "ecsy";
import { eventEmitter } from "../../EventEmitter.ts";
import { GameEntity } from "../../GameEntity.ts";
import { HudContext } from "../../HudContext.ts";
import { initializeItem } from "../../InitializeItem.ts";
import ItemGenerator from "../../ItemGenerator.ts";
import { getGold } from "../../Items.ts";
import { keys } from "../../Keys.ts";
import { shopViewModel } from "../../ShopViewModel.ts";
import {
  CurrencyComponent,
  DescriptorComponent,
  GoldComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
  ShopWindowComponent,
  ShopkeeperComponent,
  TradeIdComponent,
} from "../../components/Components.ts";
import { ItemSlot, createItemSlots } from "../../components/Inventory.ts";
import { playerEntity } from "../../main.ts";
import { addToInventory } from "../inventory/InventoryUtilities.ts";
import {
  balanceOffer,
  executeTrade,
  itemMovedInPlay,
  itemMovedShopInPlay,
  itemMovedToPlayerShopInventory,
  itemMovedToShopInventory,
  itemRemovedFromPlayerInPlay,
  itemRemovedFromPlayerInventory,
  itemRemovedFromShopInPlay,
  itemRemovedFromShopInventory,
} from "./ShopUtilities.ts";

class ShopSystem extends System {
  init() {
    eventEmitter.on(keys.menu.CLICKED("trade"), (entityId: string) => {
      this.tradeInitiated(playerEntity.entityId!.value, entityId);
    });

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.playerInPlay),
      (originalSlotIndex: number, entity: GameEntity) => {
        itemMovedToPlayerShopInventory(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.playerShopInventory),
      (originalSlotIndex: number, entity: GameEntity) => {
        itemMovedInPlay(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.shopInventory),
      (originalSlotIndex: number, entity: GameEntity) => {
        itemMovedShopInPlay(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.shopInPlay),
      (originalSlotIndex, entity: GameEntity) => {
        itemMovedToShopInventory(entity);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInventory}_itemAdded`,
      (message: ItemAdded) => {
        // this.itemMovedToShopInventory();
      }
    );

    eventEmitter.on(
      `${HudContext.playerInPlay}_itemAdded`,
      (message: ItemAdded) => {
        // this.itemMovedInPlay()
      }
    );

    eventEmitter.on(
      `${HudContext.playerInPlay}_itemDropped`,
      (destinationSlot: number, originalSlotIndex) => {
        this.networkService.notifyServer(
          new ItemDroppedOnSlot(
            originalSlotIndex,
            destinationSlot,
            HudContext.playerInPlay
          )
        );
      }
    );

    eventEmitter.on(
      `${HudContext.shopInPlay}_itemDropped`,
      (destinationSlot: number, originalSlotIndex) => {
        this.networkService.notifyServer(
          new ItemDroppedOnSlot(
            originalSlotIndex,
            destinationSlot,
            HudContext.shopInPlay
          )
        );
      }
    );

    eventEmitter.on("itemQuantityUpdated", (message) =>
      this.updateItemQuantity(message)
    );

    eventEmitter.on(
      `${HudContext.playerShopInventory}_itemMoved`,
      (message: ItemMoved) => {
        itemMovedToPlayerShopInventory(message);
      }
    );

    eventEmitter.on(
      `${HudContext.playerInPlay}_itemMoved`,
      (message: ItemMoved) => {
        itemMovedInPlay(message);
      }
    );

    eventEmitter.on(
      `${HudContext.playerShopInventory}_itemRemoved`,
      (message: ItemRemoved) => {
        itemRemovedFromPlayerInventory(message);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInventory}_itemMoved`,
      (message: ItemMoved) => {
        itemMovedToShopInventory(message);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInPlay}_itemMoved`,
      (message: ItemMoved) => {
        itemMovedShopInPlay(message);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInventory}_itemRemoved`,
      (message: ItemRemoved) => {
        itemRemovedFromShopInventory(message);
      }
    );

    eventEmitter.on(
      `${HudContext.playerInPlay}_itemRemoved`,
      (message: ItemRemoved) => {
        itemRemovedFromPlayerInPlay(message);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInPlay}_itemRemoved`,
      (message: ItemRemoved) => {
        itemRemovedFromShopInPlay(message);
      }
    );

    eventEmitter.on(
      `${HudContext.playerShopInventory}_returnToSlot`,
      (itemEntity: GameEntity, slotIndex: number) => {
        shopViewModel.removeItemFromPlayerInventory(slotIndex);
        shopViewModel.moveItemToPlayerInventory(itemEntity, slotIndex);
      }
    );

    eventEmitter.on(
      `${HudContext.playerInPlay}_returnToSlot`,
      (itemEntity: GameEntity, slotIndex: number) => {
        shopViewModel.removeItemFromPlayerInPlay(slotIndex);
        shopViewModel.moveItemInPlay(itemEntity, slotIndex);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInPlay}_returnToSlot`,
      (itemEntity: GameEntity, slotIndex: number) => {
        shopViewModel.removeItemFromShopInPlay(slotIndex);
        shopViewModel.moveItemShopInPlay(itemEntity, slotIndex);
      }
    );

    eventEmitter.on(
      `${HudContext.shopInventory}_returnToSlot`,
      (itemEntity: GameEntity, slotIndex: number) => {
        shopViewModel.removeItemFromShopInventory(slotIndex);
        shopViewModel.moveItemToShopInventory(itemEntity, slotIndex);
      }
    );

    eventEmitter.on("balance_offer_button_clicked", () => {
      const tradingWithEntityId =
        playerEntity.getComponent<ShopWindowComponent>(
          ShopWindowComponent
        )!.tradingWithEntityId;
      balanceOffer(tradingWithEntityId);
    });

    eventEmitter.on(`trade_offer_accepted`, () => {
      if (shopViewModel.inPlayValue < shopViewModel.shopInPlayValue) {
        return;
      }

      executeTrade();
    });

    eventEmitter.on("close_shop_window_clicked", () => {
      shopViewModel.closeShopWindow();
    });
  }

  acceptTrade() {}

  /**
   *
   * @param baseItem the gold item to split
   * @param amount the amount to split off the base item
   * @param actor the player who's inventory the gold is in
   * @returns the split out gold amount
   */
  splitGoldStack(
    baseItem: GameEntity,
    amount: number,
    actor: GameEntity
  ): GameEntity {
    baseItem.quantity.value -= amount;

    const splitItem = getGold(amount);
    const entity = initializeItem(splitItem);

    return entity;
  }

  updateItemQuantity(message) {
    const entity = this.world.entityManager.getEntityByName(
      `item_${message.item}`
    );

    entity.quantity.value = message.quantity;
  }

  refreshInventory(entities): void {
    const clientItemEntities = entities.map((item) => {
      return this.world.entityManager.getEntityByName(`item_${item.entityID}`);
    });

    shopViewModel.updateShopWindow(clientItemEntities);
  }

  tradeInitiated(actor: string, shopKeeper: string) {
    const playerInventory =
      playerEntity.getComponent<InventoryComponent>(InventoryComponent);

    const tradingWith = this.world.entityManager.getEntityByName(shopKeeper);

    const tradingWithInventory =
      tradingWith.getComponent<InventoryComponent>(InventoryComponent);

    const playerShopInventorySlots = playerInventory.slots.map(
      (s: ItemSlot) => {
        let itemId = "";
        if (!s.hasItem()) {
          return {
            slotIndex: s.slotIndex,
            item: itemId,
          };
        }

        const item = this.world.entityManager.getEntityByName(s.item);
        itemId = item.entityId.value;

        // Clone the gold so that we are not modifying the state of the actual players inventory
        if (item.hasComponent(GoldComponent)) {
          const clonedGold = getGold(item.quantity.value);
          const clonedGoldEntity = initializeItem(clonedGold);
          clonedGoldEntity.addComponent<TradeIdComponent>(TradeIdComponent, {
            tradeId: shopKeeper,
          });

          clonedGoldEntity.addComponent<PickedUpComponent>(PickedUpComponent, {
            slotIndex:
              item.getComponent<PickedUpComponent>(PickedUpComponent).slotIndex,
          });
          itemId = clonedGoldEntity.entityId!.value;
        }

        return {
          slotIndex: s.slotIndex,
          item: itemId,
        };
      }
    );

    const npcShopInventorySlots = tradingWithInventory.slots.map(
      (s: ItemSlot) => {
        let itemId = "";
        if (!s.hasItem()) {
          return {
            slotIndex: s.slotIndex,
            item: itemId,
          };
        }

        const item = this.world.entityManager.getEntityByName(s.item);
        itemId = item.entityId.value;

        // Clone the gold so that we are not modifying the state of the actual npcs inventory
        if (item.hasComponent(GoldComponent)) {
          const clonedGold = getGold(item.quantity.value);
          const clonedGoldEntity = initializeItem(clonedGold);
          clonedGoldEntity.addComponent<TradeIdComponent>(TradeIdComponent, {
            tradeId: shopKeeper,
          });

          clonedGoldEntity.addComponent<PickedUpComponent>(PickedUpComponent, {
            slotIndex:
              item.getComponent<PickedUpComponent>(PickedUpComponent).slotIndex,
          });

          itemId = clonedGoldEntity.entityId.value;
        }

        return {
          slotIndex: s.slotIndex,
          item: itemId,
        };
      }
    );

    const playerInPlaySlots = createItemSlots(10);
    const shopInPlaySlots = createItemSlots(10);

    playerEntity.addComponent<ShopWindowComponent>(ShopWindowComponent, {
      inventory: playerShopInventorySlots,
      inPlay: playerInPlaySlots,
      npcInPlay: shopInPlaySlots,
      npcInventory: npcShopInventorySlots,
      tradingWithEntityId: shopKeeper,
    });

    const tradingWithName =
      tradingWith.getComponent<DescriptorComponent>(DescriptorComponent).name;

    const playerName =
      playerEntity.getComponent<DescriptorComponent>(DescriptorComponent).name;

    const shopWindow =
      playerEntity.getComponent<ShopWindowComponent>(ShopWindowComponent);
    const shopItemEntities = shopWindow.npcInventory
      .filter((s: ItemSlot) => s.hasItem())
      .map((s: ItemSlot) => this.world.entityManager.getEntityByName(s.item));
    const playerItemEntities = shopWindow.inventory
      .filter((s: ItemSlot) => s.hasItem())
      .map((s: ItemSlot) => this.world.entityManager.getEntityByName(s.item));

    shopViewModel.showShopWindow(
      tradingWithInventory,
      tradingWithName,
      shopItemEntities,
      playerName,
      playerInventory,
      playerItemEntities
    );
  }

  execute() {
    this.queries!.shopkeeper!.added!.forEach((entity: GameEntity) => {
      const shopkeeper =
        entity.getComponent<ShopkeeperComponent>(ShopkeeperComponent)!;

      shopkeeper.baseItemIds.forEach((itemId) => {
        const item = ItemGenerator.generateItem(itemId, entity.entityId?.value);

        addToInventory(entity, item);
      });

      const currency =
        entity.getComponent<CurrencyComponent>(CurrencyComponent);
      const goldItem = getGold(currency!.gold);

      const goldEntity = initializeItem(goldItem);
      addToInventory(entity, goldEntity);
    });

    this.queries!.quantity!.changed!.forEach((entity: GameEntity) => {
      const quantity = entity.quantity;

      eventEmitter.emit(
        keys.items.QTY_CHANGED(entity.entityId.value),
        quantity.value
      );
    });
  }
}

ShopSystem.queries = {
  shopkeeper: {
    components: [ShopkeeperComponent, InventoryComponent],
    listen: {
      added: true,
    },
  },
  quantity: {
    components: [QuantityComponent],
    listen: {
      changed: true,
    },
  },
};

export default ShopSystem;
