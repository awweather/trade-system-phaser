import { v4 as uuidv4 } from "uuid";
import { ItemKey, itemPresets } from "./prefabs/Items.ts";
import { initializeItem } from "./ecs/InitializeItem.ts";

export default class ItemGenerator {
  public static generateItem(baseItemId: ItemKey, actor: string) {
    const preset = itemPresets.items[baseItemId];

    const id = uuidv4();

    const item = initializeItem({
      components: preset,
      entityID: id,
    });

    return item;
  }
}
