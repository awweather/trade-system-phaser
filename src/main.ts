import { config } from "./config/PhaserConfig.ts";
import { initializeEntity } from "./ecs/InitializeEntity.ts";
import initializeWorld from "./ecs/InitializeWorld.ts";
import ShopSystem from "./ecs/systems/ShopSystem.ts";
import getPlayer, { getPlayerItems } from "./prefabs/Player.ts";
import getShopkeeper from "./prefabs/Shopkeeper.ts";
import "./style.css";

export const game = new Phaser.Game(config);

export const world = initializeWorld();

const player = getPlayer();
const playerItems = getPlayerItems();
const shopkeeper = getShopkeeper();

playerItems.forEach((item) => initializeEntity(item));

export const playerEntity = initializeEntity(player);
export const shopkeeperEntity = initializeEntity(shopkeeper);

export const shopSystem = world.getSystem<ShopSystem>(ShopSystem);
