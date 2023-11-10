import Phaser from "phaser";
import { GameEntity } from "../ecs/GameEntity.js";
import { AddItemConfig } from "./InventoryGridSlot.js";

export default class Item {
  itemSprite: Phaser.GameObjects.Sprite;

  entity: GameEntity;
  description: string;
  itemId: string;
  value: number;
  slotIndex: number = 0;
  drag: any;
  constructor(itemSprite: Phaser.GameObjects.Sprite, config: AddItemConfig) {
    this.itemSprite = itemSprite;
    this.itemId = config.itemId;
    this.entity = config.entity;
    this.name = config.name;
    this.value = config.value;
    this.description = config.description;
  }
}
