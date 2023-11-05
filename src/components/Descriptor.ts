import { Component, Types } from "ecsy";

interface DescriptorSchemaProps {}

class Descriptor extends Component<DescriptorSchemaProps> {
  description: string = "";
  name: string = "";
}
Descriptor.schema = {
  description: { type: Types.String },
  name: { type: Types.String },
};

export default Descriptor;
