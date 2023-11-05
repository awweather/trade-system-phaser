import { initializeEntity } from "./InitializeEntity.ts";
import initializeWorld from "./InitializeWorld.ts";
import { config } from "./PhaserConfig.ts";
import getPlayer, { getPlayerItems } from "./Player.ts";
import getShopkeeper from "./Shopkeeper.ts";
import "./style.css";

const game = new Phaser.Game(config);

export const world = initializeWorld();

const player = getPlayer();
const playerItems = getPlayerItems();
const shopkeeper = getShopkeeper();

playerItems.forEach((item) => initializeEntity(item));

export const playerEntity = initializeEntity(player);
export const shopkeeperEntity = initializeEntity(shopkeeper);

window.game = game;
