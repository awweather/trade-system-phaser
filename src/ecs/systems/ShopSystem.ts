import { Entity, System } from "ecsy";
import { eventEmitter } from "../../EventEmitter.ts";
import { keys } from "../../config/Keys.ts";
import {
  addToInventory,
  getItemsFromSlots,
} from "../../inventory/state/InventoryUtilities.ts";
import { ItemSlot, createItemSlots } from "../../inventory/state/ItemSlot.ts";
import { playerEntity, shopkeeperEntity } from "../../main.ts";
import ItemGenerator from "../../prefabs/ItemGenerator.ts";
import { getGold } from "../../prefabs/Items.ts";
import {
  ShopEvent,
  ShopEventEmitter,
} from "../../shop/events/ShopEventEmitter.ts";
import {
  balanceOffer,
  executeTrade,
  getValueOfItemsInSlots,
  mapInventorySlot,
} from "../../shop/state/ShopUtilities.ts";
import { GameEntity } from "../GameEntity.ts";
import { initializeEntity } from "../InitializeEntity.ts";
import {
  CurrencyComponent,
  InventoryComponent,
  ShopWindowComponent,
  ShopkeeperComponent,
} from "../components/Components.ts";

class ShopSystem extends System {
  public readonly events: ShopEventEmitter = new ShopEventEmitter();
  init() {
    // eventEmitter.on(
    //   keys.itemSlots.CLICKED(HudContext.playerInPlay),
    //   (entity: GameEntity) => {
    //     movedItemToPlayerShopInventory(entity);
    //   }
    // );

    // eventEmitter.on(
    //   keys.itemSlots.CLICKED(HudContext.playerShopInventory),
    //   (entity: GameEntity) => {
    //     moveItemInPlay(entity);
    //   }
    // );

    // eventEmitter.on(
    //   keys.itemSlots.CLICKED(HudContext.shopInventory),
    //   (entity: GameEntity) => {
    //     moveItemToShopInPlay(entity);
    //   }
    // );

    // eventEmitter.on(
    //   keys.itemSlots.CLICKED(HudContext.shopInPlay),
    //   (entity: GameEntity) => {
    //     moveItemToShopInventory(entity);
    //   }
    // );

    eventEmitter.on(keys.menu.CLICKED("balanceOffer"), () => {
      balanceOffer();
    });

    eventEmitter.on(keys.menu.CLICKED("acceptTrade"), () => {
      const inPlayValue = getValueOfItemsInSlots(
        playerEntity.shopWindow.inPlay
      );
      const shopInPlayValue = getValueOfItemsInSlots(
        playerEntity.shopWindow.npcInPlay
      );

      if (inPlayValue !== shopInPlayValue) return;

      executeTrade();

      this.tradeInitiated(shopkeeperEntity.entityId.value);
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
    const playerInPlaySlots = createItemSlots(12);
    const shopInPlaySlots = createItemSlots(12);

    // Adds the shop window component to the player to track the state of the shop window
    playerEntity.addComponent<ShopWindowComponent>(ShopWindowComponent, {
      inventory: playerShopInventorySlots,
      inPlay: playerInPlaySlots,
      npcInPlay: shopInPlaySlots,
      npcInventory: npcShopInventorySlots,
      tradingWithEntityId: shopKeeperId,
    });

    // Get all item entities from the npc's inventory
    const shopkeeperItemEntities = getItemsFromSlots(
      playerEntity.shopWindow.npcInventory
    );

    // Get all item entities from the player's inventory
    const playerItemEntities = getItemsFromSlots(
      playerEntity.shopWindow.inventory
    );

    this.events.emit(ShopEvent.TRADE_INITIATED, {
      shopkeeperName: tradingWith.descriptor.name,
      shopkeeperItemEntities,
      playerItemEntities,
      playerName: playerEntity.descriptor.name,
    });
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
        const item = ItemGenerator.generateItem(itemId);

        addToInventory(gameEntity, item);
      });

      // Initialize gold entity from starting gold amount
      const currency =
        entity.getComponent<CurrencyComponent>(CurrencyComponent);
      const goldItem = getGold(currency!.gold);
      const goldEntity = initializeEntity(goldItem);
      addToInventory(gameEntity, goldEntity);
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
};

export default ShopSystem;
