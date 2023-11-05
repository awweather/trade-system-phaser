import { v4 as uuidv4 } from "uuid";
import { initializeItem } from "./InitializeItem.ts";
import { ItemKey, itemPresets } from "./Items.ts";

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
