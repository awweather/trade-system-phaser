import { alignGrid } from "./AlignGrid.ts";
import constants from "./Constants.ts";
import { eventEmitter } from "./EventEmitter.ts";
import { HudContext } from "./HudContext.ts";
import InventoryPanelFactory from "./inventory/InventoryPanelFactory.ts";
import ShopWindow from "./ShopWindow";
import TradeScene from "./TradeScene.ts";

export default class ShopWindowFactory {
  static create(scene: TradeScene): ShopWindow {
    const verticalSizer = scene.rexUI.add.sizer({ orientation: "y" });
    const horizontalSizer = scene.rexUI.add.sizer({
      orientation: "x",
      width: 824,
      height: 432,
      space: {
        top: 45,
      },
    });

    verticalSizer.addBackground(
      scene.rexUI.add.roundRectangle(0, 0, 2, 2, 2, 0x141013)
    );

    const rightKey = "tradingWith";
    const leftKey = "player";

    const playerHeader = scene.rexUI.add.sizer({
      orientation: "x",
      space: {
        item: 40,
      },
    });

    const name = scene.add.text(0, 0, "Player", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const playerCoins = scene.add.text(0, 0, "0g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    playerHeader.add(name).add(playerCoins);

    const leftSizer = InventoryPanelFactory.create(scene, {
      header: playerHeader,
      height: 390,
      context: HudContext.playerShopInventory,
    });

    const coinsInPlay = scene.add.text(0, 0, "0g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const middleLeft = InventoryPanelFactory.create(scene, {
      height: 390,
      slots: 14,
      rows: 7,
      columns: 2,
      header: coinsInPlay,
      context: HudContext.playerInPlay,
    });

    const npcCoinsInPlay = scene.add.text(0, 0, "0g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const middleRight = InventoryPanelFactory.create(scene, {
      height: 390,
      slots: 14,
      rows: 7,
      columns: 2,
      header: npcCoinsInPlay,
      context: HudContext.shopInPlay,
    });

    const npcHeader = scene.rexUI.add.sizer({
      orientation: "x",
      space: {
        item: 40,
      },
    });

    const npcName = scene.add.text(0, 0, "NPC", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const npcCoins = scene.add.text(0, 0, "2,000g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    npcHeader.add(npcName).add(npcCoins);

    const rightSizer = InventoryPanelFactory.create(scene, {
      header: npcHeader,
      height: 390,

      context: HudContext.shopInventory,
    });

    horizontalSizer
      .add(leftSizer.sizer, {
        key: leftKey,
        padding: {
          right: 5,
        },
      })
      .add(middleLeft.sizer, {
        key: "middleLeft",
        padding: {
          left: 10,
        },
      })
      .add(middleRight.sizer, {
        key: "middleRight",
        padding: {
          left: 5,
        },
      })
      .add(rightSizer.sizer, {
        key: rightKey,
        padding: {
          left: 15,
        },
      });

    const actionBar = scene.rexUI.add.sizer({
      orientation: "x",
      height: 55,
      width: 250,
      space: {
        item: 5,
      },
    });

    const balanceOfferButton = scene.add
      .text(0, 0, "Balance")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit("balance_offer_button_clicked");
      });

    const closeWindowButton = scene.add
      .text(0, 0, "Close")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit("close_shop_window_clicked");
      });

    const acceptButton = scene.add
      .text(0, 0, "Accept")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit("trade_offer_accepted");
      });

    actionBar.add(acceptButton).add(balanceOfferButton).add(closeWindowButton);

    verticalSizer.add(horizontalSizer);
    verticalSizer.add(actionBar);

    verticalSizer.setVisible(false);
    verticalSizer.layout();

    const shopWindow = new ShopWindow(
      verticalSizer,
      playerCoins,
      name,
      coinsInPlay,
      leftSizer.grid,
      middleLeft.grid,
      middleRight.grid,
      rightSizer.grid,
      npcCoins,
      npcName,
      npcCoinsInPlay
    );

    alignGrid.center(shopWindow.sizer);
    return shopWindow;
  }
}
