import Phaser, { Scene } from "phaser";
import { GameEntity } from "../ecs/GameEntity.ts";

export interface ItemConfig {
  scene: Scene;
  x: number;
  y: number;
  texture: string;
  frame: any;
  itemId: string;
  entity: GameEntity;
  name: string;
  value: number;
  description: string;
}

export default class ItemNew {
  itemSprite: Phaser.GameObjects.Sprite;

  entity: GameEntity;
  description: string;
  itemId: string;
  value: number;
  slotIndex: number = 0;
  drag: any;
  constructor(itemSprite: Phaser.GameObjects.Sprite, config: ItemConfig) {
    this.itemSprite = itemSprite;
    this.itemId = config.itemId;
    this.entity = config.entity;
    this.name = config.name;
    this.value = config.value;
    this.description = config.description;
  }
}
