import { GameEntity } from "./GameEntity.ts";
import { RawEntity } from "./InitializeEntity.ts";
import { componentLookup } from "./components/ComponentLookup.ts";
import { EntityIdComponent } from "./components/Components.ts";
import { world } from "./main.ts";

export function initializeItem(item: RawEntity): GameEntity {
  const entity = world.createEntity(`${item.entityID}`) as GameEntity;

  Object.keys(item.components)
    .filter((compKey) => item.components[compKey] !== null)
    .forEach((componentKey) => {
      const component = componentLookup.getComponent(componentKey);

      if (component) {
        entity.addComponent(component, item.components[componentKey]);
      } else {
        console.log(
          `${componentKey} was not registered to item because it did not exist`
        );
      }
    });

  entity.addComponent<EntityIdComponent>(EntityIdComponent, {
    value: item.entityID,
  });

  return entity;
}
