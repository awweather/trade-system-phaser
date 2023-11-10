import Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import type RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { alignGrid } from "../AlignGrid.js";
import Controls from "../Controls.ts";
import { eventEmitter } from "../EventEmitter.ts";
import itemsAtlas from "../assets/items.json";
// import itemsImage from "../assets/items.png";
import { keys } from "../config/Keys.ts";
import { shopkeeperEntity, world } from "../main.ts";
import ShopWindow from "../shop/ui/ShopWindow.ts";
import ShopWindowFactory from "../shop/ui/ShopWindowFactory.ts";

export default class TradeScene extends Phaser.Scene {
  shopWindow: ShopWindow | undefined;
  rexUI!: RexUIPlugin;
  startTradeText!: Phaser.GameObjects.Text;
  itemInfoPanel!: Sizer;
  controls!: Controls;

  constructor() {
    super("TradeScene");
  }

  preload() {
    // const itemAtlasMeta = itemsAtlas.meta as any;
    // itemAtlasMeta.image = itemsImage;

    const imgUrl = new URL("./items.png", import.meta.url).href;

    this.load.atlas("icons", imgUrl, itemsAtlas);

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

        this.add.text(
          300,
          50,
          "Shift + left click to move items, or click and drag"
        );

        this.startTradeText.setVisible(false);
      });

    alignGrid.center(this.startTradeText);
  }

  update(time: number, delta: number): void {
    world.execute(delta, time);
  }
}
