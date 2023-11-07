import { world } from "../main.ts";
import { GameEntity } from "./GameEntity.ts";
import { componentLookup } from "./components/ComponentLookup.ts";
import { EntityIdComponent } from "./components/Components.ts";

export interface RawEntity {
  components: any;
  entityID: string;
}

/**
 * Initializes an entity by taking the javascript object form and turning it into a game entity.
 * @param rawEntity The raw javascript object
 * @returns A game entity created from the raw entity
 */
export function initializeEntity(rawEntity: RawEntity): GameEntity {
  const entity = world.createEntity(rawEntity.entityID);

  Object.keys(rawEntity.components).forEach((componentKey) => {
    const component = componentLookup.getComponent(componentKey);
    if (component) {
      entity.addComponent(component, rawEntity.components[componentKey]);
    } else {
      console.log(
        `${componentKey} was not registered to player because it did not exist`
      );
    }
  });

  entity.addComponent<EntityIdComponent>(EntityIdComponent, {
    value: rawEntity.entityID,
  });

  return entity as GameEntity;
}
