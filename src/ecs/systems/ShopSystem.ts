import { Entity, System } from "ecsy";
import { eventEmitter } from "../../EventEmitter.ts";
import { HudContext } from "../../HudContext.ts";
import ItemGenerator from "../../ItemGenerator.ts";
import { keys } from "../../config/Keys.ts";
import {
  addToInventory,
  getItemsFromSlots,
} from "../../inventory/InventoryUtilities.ts";
import { playerEntity, shopkeeperEntity } from "../../main.ts";
import { getGold } from "../../prefabs/Items.ts";
import {
  balanceOffer,
  executeTrade,
  itemMoved,
  itemMovedInPlay,
  itemMovedShopInPlay,
  itemMovedToPlayerShopInventory,
  itemMovedToShopInventory,
  mapInventorySlot,
} from "../../shop/ShopUtilities.ts";
import { shopViewModel } from "../../shop/ShopViewModel.ts";
import { GameEntity } from "../GameEntity.ts";
import { initializeEntity } from "../InitializeEntity.ts";
import {
  CurrencyComponent,
  InventoryComponent,
  QuantityComponent,
  ShopWindowComponent,
  ShopkeeperComponent,
} from "../components/Components.ts";
import { ItemSlot, createItemSlots } from "../components/Inventory.ts";

class ShopSystem extends System {
  init() {
    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.playerInPlay),
      (entity: GameEntity) => {
        itemMovedToPlayerShopInventory(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.playerShopInventory),
      (entity: GameEntity) => {
        itemMovedInPlay(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.shopInventory),
      (entity: GameEntity) => {
        itemMovedShopInPlay(entity);
      }
    );

    eventEmitter.on(
      keys.itemSlots.CLICKED(HudContext.shopInPlay),
      (entity: GameEntity) => {
        itemMovedToShopInventory(entity);
      }
    );

    eventEmitter.on(
      keys.items.DROPPED(HudContext.playerInPlay),
      (entity: GameEntity, droppedInSlotIndex: number) => {
        itemMoved(
          entity,
          playerEntity.shopWindow.inventory,
          playerEntity.shopWindow.inPlay,
          HudContext.playerInPlay,
          droppedInSlotIndex
        );
      }
    );

    eventEmitter.on(
      keys.items.DROPPED(HudContext.shopInPlay),
      (entity: GameEntity, droppedInSlotIndex: number) => {
        itemMoved(
          entity,
          playerEntity.shopWindow.npcInventory,
          playerEntity.shopWindow.npcInPlay,
          HudContext.shopInPlay,
          droppedInSlotIndex
        );
      }
    );

    eventEmitter.on(
      keys.items.DROPPED(HudContext.playerShopInventory),
      (entity: GameEntity, droppedInSlotIndex: number) => {
        itemMoved(
          entity,
          playerEntity.shopWindow.inPlay,
          playerEntity.shopWindow.inventory,
          HudContext.playerShopInventory,
          droppedInSlotIndex
        );
      }
    );

    eventEmitter.on(
      keys.items.DROPPED(HudContext.shopInventory),
      (entity: GameEntity, droppedInSlotIndex: number) => {
        itemMoved(
          entity,
          playerEntity.shopWindow.npcInPlay,
          playerEntity.shopWindow.npcInventory,
          HudContext.shopInventory,
          droppedInSlotIndex
        );
      }
    );

    eventEmitter.on(keys.menu.CLICKED("balanceOffer"), () => {
      balanceOffer();
    });

    eventEmitter.on(keys.menu.CLICKED("acceptTrade"), () => {
      if (shopViewModel.inPlayValue < shopViewModel.shopInPlayValue) {
        return;
      }

      executeTrade();

      this.tradeInitiated(shopkeeperEntity.entityId.value);
    });

    eventEmitter.on(keys.menu.CLICKED("closeShop"), () => {
      shopViewModel.closeShopWindow();
    });

    eventEmitter.on(keys.menu.CLICKED("trade"), (shopkeeperId: string) => {
      this.tradeInitiated(shopkeeperId);
    });
  }

  tradeInitiated(shopKeeperId: string) {
    const tradingWith = this.world.entityManager.getEntityByName(shopKeeperId);

    // Clone player inventory slots
    const playerShopInventorySlots = playerEntity.inventory.slots.map(
      (s: ItemSlot) => {
        return mapInventorySlot(s, shopKeeperId);
      }
    );

    // Clone npc inventory slots
    const npcShopInventorySlots = tradingWith.inventory.slots.map(
      (s: ItemSlot) => {
        return mapInventorySlot(s, shopKeeperId);
      }
    );

    // Initialize in play slots
    const playerInPlaySlots = createItemSlots(10);
    const shopInPlaySlots = createItemSlots(10);

    // Adds the shop window component to the player to track the state of the shop window
    playerEntity.addComponent<ShopWindowComponent>(ShopWindowComponent, {
      inventory: playerShopInventorySlots,
      inPlay: playerInPlaySlots,
      npcInPlay: shopInPlaySlots,
      npcInventory: npcShopInventorySlots,
      tradingWithEntityId: shopKeeperId,
    });

    // Get all item entities from the npc's inventory
    const shopItemEntities = getItemsFromSlots(
      playerEntity.shopWindow.npcInventory
    );

    // Get all item entities from the player's inventory
    const playerItemEntities = getItemsFromSlots(
      playerEntity.shopWindow.inventory
    );

    // Initialize shop window
    shopViewModel.showShopWindow(
      tradingWith.inventory,
      tradingWith.descriptor.name,
      shopItemEntities,
      playerEntity.descriptor.name,
      playerEntity.inventory,
      playerItemEntities
    );
  }

  execute() {
    /**
     * This query runs whenever the shopkeeper component gets added to an entity
     * This would occur in main.ts getShopkeeper() when the shopkeeper entity is initialized
     */
    this.queries.shopkeeper.added!.forEach((entity: Entity) => {
      const gameEntity = entity as GameEntity;
      const shopkeeper = gameEntity.shopkeeper;

      // Generate item from baseItemIds
      shopkeeper.baseItemIds.forEach((itemId) => {
        const item = ItemGenerator.generateItem(
          itemId,
          gameEntity.entityId?.value
        );

        addToInventory(gameEntity, item);
      });

      // Initialize gold entity from starting gold amount
      const currency =
        entity.getComponent<CurrencyComponent>(CurrencyComponent);
      const goldItem = getGold(currency!.gold);
      const goldEntity = initializeEntity(goldItem);
      addToInventory(gameEntity, goldEntity);
    });

    /**
     * This query runs whenever the quantity component on an item changes
     */
    this.queries.quantity.changed!.forEach((entity: Entity) => {
      const gameEntity = entity as GameEntity;
      const quantity = gameEntity.quantity;

      // Notify subscribers that quantity value has changed
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
