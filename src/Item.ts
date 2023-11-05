import Phaser, { Scene } from "phaser";
import type { GameEntity } from "../../../../ecs/Entities";

export interface ItemConfig {
  scene: Scene;
  x: number;
  y: number;
  texture: string;
  frame: any;
  entityID: number;
  entity: GameEntity;
  name: string;
  description: string;
}

export default class Item extends Phaser.GameObjects.Sprite {
  entityID: number;
  entity: GameEntity;
  description: string;
  slotIndex: number;
  drag: any;
  constructor(config) {
    super(config.scene, config.x, config.y, config.texture, config.frame);

    this.entityID = config.entityID;
    this.entity = config.entity;
    this.name = config.name;
    this.description = config.description;
  }
}
