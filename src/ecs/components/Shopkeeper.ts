import { Component, Types } from "ecsy";
import { ItemKey } from "../../prefabs/Items.ts";

interface ShopkeeperProps {
  baseItemIds: string[];
}
class Shopkeeper extends Component<ShopkeeperProps> {
  baseItemIds: ItemKey[] = [];
}
Shopkeeper.schema = {
  baseItemIds: { type: Types.Array },
};

export default Shopkeeper;
