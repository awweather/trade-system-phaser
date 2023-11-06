import { Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import type RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { alignGrid } from "../AlignGrid.js";
import Controls from "../Controls.ts";
import { eventEmitter } from "../EventEmitter.ts";
import { keys } from "../config/Keys.ts";
import { shopkeeperEntity, world } from "../main.ts";
import { shopViewModel } from "../shop/ShopViewModel.ts";
import ShopWindow from "../shop/ShopWindow.ts";
import ShopWindowFactory from "../shop/ShopWindowFactory.ts";

export default class TradeScene extends Phaser.Scene {
  shopWindow: ShopWindow | undefined;
  rexUI!: RexUIPlugin;
  startTradeText!: Phaser.GameObjects.Text;
  itemInfoPanel: Sizer;
  controls!: Controls;

  constructor() {
    super("TradeScene");
  }

  preload() {
    // Quick work around to load asset paths correctly
    // const itemAtlasMeta = itemsAtlas.meta as any;
    // itemAtlasMeta.image = itemsImage;
    this.load.atlas("icons", "/icons.png", "/icons.json");

    alignGrid.create({
      rows: 20,
      cols: 20,
      scene: this,
    });
  }

  create() {
    this.shopWindow = ShopWindowFactory.create(this);
    this.controls = new Controls(
      this.input.keyboard!.createCursorKeys(),
      this.cameras.main,
      this
    );

    this.startTradeText = this.add
      .text(0, 0, "Start Trade")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit(
          keys.menu.CLICKED("trade"),
          shopkeeperEntity.entityId?.value
        );

        this.startTradeText.setVisible(false);
      });

    alignGrid.center(this.startTradeText);

    shopViewModel.registerScene(this);
  }

  update(time: number, delta: number): void {
    world.execute(delta, time);
  }
}
