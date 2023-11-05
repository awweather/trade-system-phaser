import type RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { alignGrid } from "./AlignGrid.ts";
import Controls from "./Controls.ts";
import { eventEmitter } from "./EventEmitter.ts";
import { keys } from "./Keys.ts";
import { shopViewModel } from "./ShopViewModel.ts";
import ShopWindow from "./ShopWindow.ts";
import ShopWindowFactory from "./ShopWindowFactory.ts";
import itemsAtlas from "./assets/items.json";
import itemsImage from "./assets/items.png";
import { shopkeeperEntity, world } from "./main.ts";

export default class TradeScene extends Phaser.Scene {
  shopWindow: ShopWindow | undefined;
  rexUI: RexUIPlugin | undefined;
  controls: Controls;

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
    shopViewModel.registerScene(this);
    alignGrid.center(this.shopWindow.sizer);

    this.time.delayedCall(2000, () => {
      eventEmitter.emit(
        keys.menu.CLICKED("trade"),
        shopkeeperEntity.entityId?.value
      );
    });
  }

  update(time: number, delta: number): void {
    world.execute(delta, time);
  }
}
