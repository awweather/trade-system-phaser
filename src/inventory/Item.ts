import Phaser, { Scene } from "phaser";
import { GameEntity } from "../ecs/GameEntity.ts";

export interface ItemConfig {
  scene: Scene;
  x: number;
  y: number;
  texture: string;
  frame: any;
  entity: GameEntity;
  name: string;
  description: string;
}

export default class Item extends Phaser.GameObjects.Sprite {
  entity: GameEntity;
  description: string;
  slotIndex: number = 0;
  drag: any;
  constructor(config: ItemConfig) {
    super(config.scene, config.x, config.y, config.texture, config.frame);

    this.entity = config.entity;
    this.name = config.name;
    this.description = config.description;
  }
}
