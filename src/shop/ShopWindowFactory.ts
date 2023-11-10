import { alignGrid } from "../AlignGrid.js";
import { eventEmitter } from "../EventEmitter.ts";
import { HudContext } from "../HudContext.ts";
import { keys } from "../config/Keys.ts";
import InventoryGridFactory from "../inventory/InventoryGridFactory.ts";
import { shopSystem } from "../main.ts";
import TradeScene from "../scenes/TradeScene.ts";
import ShopWindow from "./ShopWindow";
import { ShopWindowManager } from "./ShopWindowManager.ts";

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
      fontSize: `12px`,
    });

    const playerCoins = scene.add.text(0, 0, "0g", {
      fontSize: `12px`,
    });

    playerHeader.add(name).add(playerCoins);

    const playerShopInventory = InventoryGridFactory.create(scene, {
      panelHeader: playerHeader,
      height: 390,
      context: HudContext.playerShopInventory,
      rows: 10,
      columns: 5,
      slots: 50,
    });

    const coinsInPlay = scene.add.text(0, 0, "0g", {
      fontSize: `12px`,
    });

    const playerInPlay = InventoryGridFactory.create(scene, {
      height: 390,
      slots: 20,
      rows: 10,
      columns: 2,
      panelHeader: coinsInPlay,
      context: HudContext.playerInPlay,
    });

    const npcCoinsInPlay = scene.add.text(0, 0, "0g", {
      fontSize: `12px`,
    });

    const npcInPlay = InventoryGridFactory.create(scene, {
      height: 390,
      slots: 20,
      rows: 10,
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
      fontSize: `12px`,
    });

    const npcCoins = scene.add.text(0, 0, "2,000g", {
      fontSize: `12px`,
    });

    npcHeader.add(npcName).add(npcCoins);

    const npcShopInventory = InventoryGridFactory.create(scene, {
      panelHeader: npcHeader,
      height: 390,
      rows: 10,
      columns: 5,
      slots: 50,
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
      npcCoins,
      npcName,
      npcCoinsInPlay
    );

    alignGrid.center(shopWindow.sizer);
    const shopWindowManager = new ShopWindowManager(
      scene,
      shopWindow,
      playerShopInventory,
      playerInPlay,
      npcInPlay,
      npcShopInventory,
      shopSystem
    );

    return shopWindow;
  }
}
