import { Component, World } from "ecsy";
import { GameEntity } from "./GameEntity.ts";
import * as components from "./components/Components.ts";
import ShopSystem from "./systems/shop/ShopSystem.ts";

export default function initializeWorld() {
  const world = new World({ entityClass: GameEntity });

  Object.values(components).forEach((c) => {
    if (typeof c === typeof Component) {
      world.registerComponent(c as any);
    }
  });

  world.registerSystem(ShopSystem);

  return world;
}
