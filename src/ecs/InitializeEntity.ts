import { world } from "../main.ts";
import { componentLookup } from "././ecs/components/Components.tsokup.ts";
import { GameEntity } from "./GameEntity.ts";
import { EntityIdComponent } from "./components/Components.ts";

export interface RawEntity {
  components: any;
  entityID: string;
}

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
