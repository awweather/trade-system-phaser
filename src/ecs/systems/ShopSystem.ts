import { Entity, System } from "ecsy";
import { eventEmitter } from "../../EventEmitter.ts";
import { HudContext } from "../../HudContext.ts";
import ItemGenerator from "../../ItemGenerator.ts";
import { getGold } from "../../prefabs/Items.ts";
import { keys } from "../../config/Keys.ts";
import { addToInventory } from "../../inventory/InventoryUtilities.ts";
import { playerEntity, shopkeeperEntity } from "../../main.ts";
import {
  balanceOffer,
  executeTrade,
  itemMovedInPlay,
  itemMovedShopInPlay,
  itemMovedToPlayerShopInventory,
  itemMovedToShopInventory,
} from "../../shop/ShopUtilities.ts";
import { shopViewModel } from "../../shop/ShopViewModel.ts";
import { GameEntity } from "../GameEntity.ts";
import { initializeItem } from "../InitializeItem.ts";
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
} from "../components/Components.ts";
import { ItemSlot, createItemSlots } from "../components/Inventory.ts";

class ShopSystem extends System {
  init() {
    eventEmitter.on(keys.menu.CLICKED("trade"), (shopkeeperId: string) => {
      this.tradeInitiated(shopkeeperId);
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
      (originalSlotIndex: number, entity: GameEntity) => {
        itemMovedToShopInventory(entity);
      }
    );

    eventEmitter.on("balance_offer_button_clicked", () => {
      balanceOffer();
    });

    eventEmitter.on(`trade_offer_accepted`, () => {
      if (shopViewModel.inPlayValue < shopViewModel.shopInPlayValue) {
        return;
      }

      executeTrade();

      this.tradeInitiated(shopkeeperEntity.entityId.value);
    });

    eventEmitter.on("close_shop_window_clicked", () => {
      shopViewModel.closeShopWindow();
    });
  }

  tradeInitiated(shopKeeper: string) {
    const playerInventory = playerEntity.inventory;

    const tradingWith = this.world.entityManager.getEntityByName(shopKeeper);

    const tradingWithInventory =
      tradingWith.getComponent<InventoryComponent>(InventoryComponent);

    const playerShopInventorySlots = playerInventory.slots.map(
      (s: ItemSlot) => {
        let itemId = "";
        if (!s.hasItem()) {
          return new ItemSlot(itemId, s.slotIndex);
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

        return new ItemSlot(itemId, s.slotIndex);
      }
    );

    const npcShopInventorySlots = tradingWithInventory.slots.map(
      (s: ItemSlot) => {
        let itemId = "";
        if (!s.hasItem()) {
          return new ItemSlot(itemId, s.slotIndex);
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

        return new ItemSlot(itemId, s.slotIndex);
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

    const playerName = playerEntity.descriptor.name;

    const shopWindow = playerEntity.shopWindow;

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
    this.queries.shopkeeper.added!.forEach((entity: Entity) => {
      const gameEntity = entity as GameEntity;
      const shopkeeper = gameEntity.shopkeeper;

      shopkeeper.baseItemIds.forEach((itemId) => {
        const item = ItemGenerator.generateItem(
          itemId,
          gameEntity.entityId?.value
        );

        addToInventory(gameEntity, item);
      });

      const currency =
        entity.getComponent<CurrencyComponent>(CurrencyComponent);
      const goldItem = getGold(currency!.gold);

      const goldEntity = initializeItem(goldItem);
      addToInventory(gameEntity, goldEntity);
    });

    this.queries.quantity.changed!.forEach((entity: Entity) => {
      const gameEntity = entity as GameEntity;
      const quantity = gameEntity.quantity;

      eventEmitter.emit(
        keys.items.QTY_CHANGED(gameEntity.entityId.value),
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
