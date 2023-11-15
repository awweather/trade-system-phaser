import Phaser from "phaser";
import { GameEntity } from "../../ecs/GameEntity.js";
import { AddItemConfig } from "./InventoryGridSlot.js";

export default class Item {
  itemSprite: Phaser.GameObjects.Sprite;

  entity: GameEntity;
  itemId: string;
  slotIndex: number = 0;
  constructor(itemSprite: Phaser.GameObjects.Sprite, config: AddItemConfig) {
    this.itemSprite = itemSprite;
    this.itemId = config.itemId;
    this.entity = config.entity;
  }
}
