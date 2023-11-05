import { Component, Types } from "ecsy";
interface ItemIdProps {}
class ItemId extends Component<ItemIdProps> {
  itemBase: string = "";
}
ItemId.schema = {
  itemBase: { type: Types.String },
};

export default ItemId;
