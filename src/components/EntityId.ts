import { Component, Types } from "ecsy";
interface EntityIdProps {}
class EntityId extends Component<EntityIdProps> {
  value: string;
  itemBase: string;
}
EntityId.schema = {
  value: { type: Types.String },
  itemBase: { type: Types.String },
};

export default EntityId;
