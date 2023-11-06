import type RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { alignGrid } from "../AlignGrid.ts";
import Controls from "../Controls.ts";
import { eventEmitter } from "../EventEmitter.ts";
import itemsAtlas from "../assets/items.json";
import { keys } from "../config/Keys.ts";
import { shopkeeperEntity, world } from "../main.ts";
import { shopViewModel } from "../shop/ShopViewModel.ts";
import ShopWindow from "../shop/ShopWindow.ts";
import ShopWindowFactory from "../shop/ShopWindowFactory.ts";

export default class TradeScene extends Phaser.Scene {
  shopWindow: ShopWindow | undefined;
  rexUI!: RexUIPlugin;
  startTradeText: Phaser.GameObjects.Text | undefined;
  controls!: Controls;

  constructor() {
    super("TradeScene");
  }

  preload() {
    itemsAtlas.meta.image = itemsImage;
    this.load.atlas("icons", itemsImage, itemsAtlas);

    alignGrid.create({
      rows: 10,
      cols: 10,
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

        this.startTradeText!.setVisible(false);
      });

    alignGrid.center(this.startTradeText);
    shopViewModel.registerScene(this);
  }

  update(time: number, delta: number): void {
    world.execute(delta, time);
  }
}
