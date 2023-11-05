import { Component, Types } from "ecsy";

interface QuantityProps {}
class Quantity extends Component<QuantityProps> {
  value: number;
  maxValue?: number;

  constructor() {
    super();
    this.value = 0;
  }
}

Quantity.schema = {
  value: { type: Types.Number },
  maxValue: { type: Types.Number },
};

export default Quantity;
