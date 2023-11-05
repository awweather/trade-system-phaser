import { Component, Types } from "ecsy";

export interface ISprite {
  height: number;
  width: number;
  texture: string;
  frame: string;
  name: string;
  animations: any[];
}

interface RenderableSchemaProps {}
class Renderable extends Component<RenderableSchemaProps> {
  sprite!: ISprite;
  model: Phaser.GameObjects.Sprite | undefined;
  tradeModel: Phaser.GameObjects.Sprite | undefined;
  spriteKey!: string;
}
Renderable.schema = {
  sprite: { type: Types.Ref },
  scale: { type: Types.Number },
  model: { type: Types.Ref },
  tradeModel: { type: Types.Ref },
};

export default Renderable;
