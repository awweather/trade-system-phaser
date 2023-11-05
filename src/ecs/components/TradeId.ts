import { Component, Types } from "ecsy";
interface TradeIdSchemaProps {}
class TradeId extends Component<TradeIdSchemaProps> {
  tradeId: string = "";
}

TradeId.schema = {
  tradeId: { type: Types.String },
};

export default TradeId;
