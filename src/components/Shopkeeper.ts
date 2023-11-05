import { Component, Types } from "ecsy";

interface ShopkeeperProps {
  baseItemIds: string[];
  startingGold: number;
}
class Shopkeeper extends Component<ShopkeeperProps> {
  baseItemIds: string[];
  startingGold: number;
}
Shopkeeper.schema = {
  baseItemIds: { type: Types.Array },
  startingGold: { type: Types.Number },
};

export default Shopkeeper;
