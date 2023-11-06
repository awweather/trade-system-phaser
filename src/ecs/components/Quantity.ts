import { Component, Types } from "ecsy";

interface QuantityProps {}
class Quantity extends Component<QuantityProps> {
  value: number = 0;
  maxValue?: number;
}

Quantity.schema = {
  value: { type: Types.Number },
  maxValue: { type: Types.Number },
};

export default Quantity;
