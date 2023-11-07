import { alignGrid } from "../AlignGrid.js";
import { eventEmitter } from "../EventEmitter.ts";
import { HudContext } from "../HudContext.ts";
import constants from "../config/Constants.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridFactory from "../inventory/InventoryGridFactory.ts";
import TradeScene from "../scenes/TradeScene.ts";
import ShopWindow from "./ShopWindow";

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

    const playerShopInventory = InventoryGridFactory.create(scene, {
      panelHeader: playerHeader,
      height: 390,
      context: HudContext.playerShopInventory,
      rows: 5,
      columns: 5,
      slots: 25,
    });

    const coinsInPlay = scene.add.text(0, 0, "0g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const playerInPlay = InventoryGridFactory.create(scene, {
      height: 390,
      slots: 14,
      rows: 7,
      columns: 2,
      panelHeader: coinsInPlay,
      context: HudContext.playerInPlay,
    });

    const npcCoinsInPlay = scene.add.text(0, 0, "0g", {
      fontFamily: constants.styles.text.fontFamily,
      fontSize: `12px`,
    });

    const npcInPlay = InventoryGridFactory.create(scene, {
      height: 390,
      slots: 14,
      rows: 7,
      columns: 2,
      panelHeader: npcCoinsInPlay,
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

    const npcShopInventory = InventoryGridFactory.create(scene, {
      panelHeader: npcHeader,
      height: 390,
      rows: 5,
      columns: 5,
      slots: 25,
      context: HudContext.shopInventory,
    });

    horizontalSizer
      .add(playerShopInventory.scrollableContainer, {
        key: leftKey,
        padding: {
          right: 5,
        },
      })
      .add(playerInPlay.scrollableContainer, {
        key: "middleLeft",
        padding: {
          left: 10,
        },
      })
      .add(npcInPlay.scrollableContainer, {
        key: "middleRight",
        padding: {
          left: 5,
        },
      })
      .add(npcShopInventory.scrollableContainer, {
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
        eventEmitter.emit(keys.menu.CLICKED("balanceOffer"));
      });

    const closeWindowButton = scene.add
      .text(0, 0, "Close")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit(keys.menu.CLICKED("closeShop"));
      });

    const acceptButton = scene.add
      .text(0, 0, "Accept")
      .setInteractive()
      .on("pointerup", () => {
        eventEmitter.emit(keys.menu.CLICKED("acceptTrade"));
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
      playerShopInventory.grid,
      playerInPlay.grid,
      npcInPlay.grid,
      npcShopInventory.grid,
      npcCoins,
      npcName,
      npcCoinsInPlay
    );

    alignGrid.center(shopWindow.sizer);
    return shopWindow;
  }
}
