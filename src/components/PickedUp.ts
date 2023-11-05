import { Component, Types } from "ecsy";
interface PickedUpSchemaProps {}
class PickedUp extends Component<PickedUpSchemaProps> {
  slotIndex: number = 0;
}
PickedUp.schema = {
  slotIndex: { type: Types.Number },
};

export default PickedUp;
