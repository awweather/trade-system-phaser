import { Component, Types } from "ecsy";
interface CurrencyProps {}

class Currency extends Component<CurrencyProps> {
  gold: number = 0;
}
Currency.schema = {
  gold: { type: Types.Number },
};

export default Currency;
