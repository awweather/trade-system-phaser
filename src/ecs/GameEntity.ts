import { _Entity } from "ecsy";
import {
  DescriptorComponent,
  EntityIdComponent,
  InventoryComponent,
  PickedUpComponent,
  QuantityComponent,
  RenderableComponent,
  ShopWindowComponent,
  ShopkeeperComponent,
  ValuableComponent,
} from "./components/Components.ts";

export class GameEntity extends _Entity {
  get entityId(): EntityIdComponent {
    const component = this.getComponent<EntityIdComponent>(EntityIdComponent);
    if (!component) {
      throw new Error("EntityIdComponent does not exist on this entity.");
    }
    return component;
  }

  get pickedUp(): PickedUpComponent {
    const component = this.getComponent<PickedUpComponent>(PickedUpComponent);
    if (!component) {
      throw new Error("PickedUpComponent does not exist on this entity.");
    }
    return component;
  }

  get quantity(): QuantityComponent {
    const component = this.getComponent<QuantityComponent>(QuantityComponent);
    if (!component) {
      throw new Error("QuantityComponent does not exist on this entity.");
    }
    return component;
  }

  get quantity_mutable(): QuantityComponent {
    const component =
      this.getMutableComponent<QuantityComponent>(QuantityComponent);
    if (!component) {
      throw new Error("QuantityComponent does not exist on this entity.");
    }
    return component;
  }

  get renderable(): RenderableComponent {
    const component =
      this.getComponent<RenderableComponent>(RenderableComponent);
    if (!component) {
      throw new Error("RenderableComponent does not exist on this entity.");
    }
    return component;
  }

  get renderable_mutable(): RenderableComponent {
    const component =
      this.getMutableComponent<RenderableComponent>(RenderableComponent);
    if (!component) {
      throw new Error("RenderableComponent does not exist on this entity.");
    }
    return component;
  }

  get valuable(): ValuableComponent {
    const component = this.getComponent<ValuableComponent>(ValuableComponent);
    if (!component) {
      throw new Error("ValuableComponent does not exist on this entity.");
    }
    return component;
  }

  get shopWindow(): ShopWindowComponent {
    const component =
      this.getComponent<ShopWindowComponent>(ShopWindowComponent);
    if (!component) {
      throw new Error("ShopWindowComponent does not exist on this entity.");
    }
    return component;
  }

  get inventory(): InventoryComponent {
    const component = this.getComponent<InventoryComponent>(InventoryComponent);
    if (!component) {
      throw new Error("InventoryComponent does not exist on this entity.");
    }
    return component;
  }

  get inventory_mutable(): InventoryComponent {
    const component =
      this.getMutableComponent<InventoryComponent>(InventoryComponent);
    if (!component) {
      throw new Error("InventoryComponent does not exist on this entity.");
    }
    return component;
  }

  get descriptor(): DescriptorComponent {
    const component =
      this.getComponent<DescriptorComponent>(DescriptorComponent);
    if (!component) {
      throw new Error("DescriptorComponent does not exist on this entity.");
    }
    return component;
  }

  get shopkeeper(): ShopkeeperComponent {
    const component =
      this.getComponent<ShopkeeperComponent>(ShopkeeperComponent);
    if (!component) {
      throw new Error("ShopkeeperComponent does not exist on this entity.");
    }
    return component;
  }
}
