import { Component, Types } from "ecsy";
interface ValuableProps {}
class Valuable extends Component<ValuableProps> {
  value: number = 0;
}
Valuable.schema = {
  value: { type: Types.Number },
};

export default Valuable;
