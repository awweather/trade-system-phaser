import { Component, Types } from "ecsy";

interface DescriptorProps {}

class Descriptor extends Component<DescriptorProps> {
  description: string = "";
  name: string = "";
}
Descriptor.schema = {
  description: { type: Types.String },
  name: { type: Types.String },
};

export default Descriptor;
