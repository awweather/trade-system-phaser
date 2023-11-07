import { v4 as uuidv4 } from "uuid";
import { initializeEntity } from "../ecs/InitializeEntity.ts";
import { ItemKey, itemPresets } from "./Items.ts";

export default class ItemGenerator {
  public static generateItem(baseItemId: ItemKey) {
    const preset = itemPresets.items[baseItemId];

    const id = uuidv4();

    const item = initializeEntity({
      components: preset,
      entityID: id,
    });

    return item;
  }
}
