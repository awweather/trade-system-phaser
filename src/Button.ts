import type Phaser from "phaser";
import { OverlapSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { alignGrid } from "./AlignGrid.ts";
import constants from "./Constants.ts";
import { eventEmitter } from "./EventEmitter.ts";
import { keys } from "./Keys.ts";
import TradeScene from "./TradeScene.ts";

interface ButtonClickHandler {
  key: "pointerover" | "pointerout";
  action: any;
}

interface ButtonSpriteConfig {
  base: string;
  hover: string;
}
export default class Button extends OverlapSizer {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y, width, height, {});
  }
}

export class ButtonBuilder {
  withIcon(texture: string, frame: string) {
    const icon = this.button.scene.add.image(0, 0, texture, frame);
    icon.setDisplaySize(35, 35);
    this.button.add(icon, {});
    this.button.layout();
    return this;
  }
  private button: Button;
  private scene: TradeScene;
  private np: any;
  constructor(
    scene: TradeScene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.scene = scene;
    this.button = new Button(scene, x, y, width, height);
  }

  asStandard(texture: string, config: ButtonSpriteConfig) {
    const np = this.scene.add.nineslice(
      0,
      0,
      texture,
      config.base,
      this.button.width,
      this.button.height,
      7,
      7,
      0,
      0
    );

    np.setInteractive()
      .on("pointerover", function (this: any) {
        np.setTexture(texture, config.hover);
        np.update();
      })
      .on("pointerout", function (this: any) {
        np.setTexture(texture, config.base);
        np.update();
      });

    alignGrid.center(np);
    this.np = np;
    this.button.addBackground(np);

    return this;
  }

  withText(text: string, color?: any): ButtonBuilder {
    const btnText = this.scene.add.text(0, 0, text, {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
      color: color || "white",
    });

    this.button.add(btnText.setDepth(805), {
      align: "center",
      expand: false,
    } as any);

    return this;
  }

  emitOnPointerDown(action: any, event?: any) {
    this.np.on("pointerdown", function () {
      eventEmitter.emit(keys.menu.button.CLICKED);
    });

    return this;
  }

  withPointerDown(action: string | Function) {
    this.np.on("pointerdown", function () {
      eventEmitter.emit(keys.menu.button.CLICKED);
      if (action instanceof Function) {
        action();
      } else {
        eventEmitter.emit(action);
      }
    });

    return this;
  }

  create(): Button {
    this.button.layout();
    return this.button;
  }
}
