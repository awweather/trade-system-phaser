import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import { GridSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import InventoryGrid from "../inventory/InventoryGrid.ts";
import ItemGridSlot from "../inventory/ItemGridSlot.ts";

export default class ShopWindow {
  playerInventoryGrid: InventoryGrid;
  shopInventoryGrid: InventoryGrid;
  playerInPlay: InventoryGrid;
  shopInPlay: InventoryGrid;

  coinsInPlay: Phaser.GameObjects.Text;

  playerName: Phaser.GameObjects.Text;
  playerCoins: Phaser.GameObjects.Text;
  shopCoins: Phaser.GameObjects.Text;
  shopCoinsInPlay: Phaser.GameObjects.Text;

  shopName: Phaser.GameObjects.Text;

  sizer: Sizer;

  constructor(
    shopWindow: Sizer,
    playerCoins: Phaser.GameObjects.Text,
    playerName: Phaser.GameObjects.Text,
    coinsInPlay: Phaser.GameObjects.Text,
    playerInventory: InventoryGrid,
    playerInPlay: InventoryGrid,
    npcInPlay: InventoryGrid,
    npcInventory: InventoryGrid,
    npcCoins: Phaser.GameObjects.Text,
    npcName: Phaser.GameObjects.Text,
    npcCoinsInPlay: Phaser.GameObjects.Text
  ) {
    this.sizer = shopWindow;
    this.playerInventoryGrid = playerInventory;
    this.shopInventoryGrid = npcInventory;
    this.playerInPlay = playerInPlay;
    this.shopInPlay = npcInPlay;
    this.shopCoins = npcCoins;
    this.coinsInPlay = coinsInPlay;
    this.playerName = playerName;
    this.playerCoins = playerCoins;
    this.shopCoinsInPlay = npcCoinsInPlay;
    this.shopName = npcName;
  }
  open(): void {
    this.sizer.setVisible(true);
  }
  close(): void {
    this.sizer.setVisible(false);

    this.playerInventoryGrid.grid.getAllChildren().forEach((element) => {
      if (element instanceof ItemGridSlot) {
        const slot = element as ItemGridSlot;
        slot.removeItem();
      }
    });

    this.shopInventoryGrid.grid.getAllChildren().forEach((element) => {
      if (element instanceof ItemGridSlot) {
        const slot = element as ItemGridSlot;
        slot.removeItem();
      }
    });

    this.playerInPlay.grid.getAllChildren().forEach((element) => {
      if (element instanceof ItemGridSlot) {
        const slot = element as ItemGridSlot;
        slot.removeItem();
      }
    });

    this.shopInPlay.grid.getAllChildren().forEach((element) => {
      if (element instanceof ItemGridSlot) {
        const slot = element as ItemGridSlot;
        slot.removeItem();
      }
    });
  }

  isOpen(): boolean {
    return this.sizer.visible;
  }

  initialize(
    shopName: string,
    playerName: string,
    shopItems: any[],
    playerItems: any,
    playerCoins: number,
    shopCoins: number
  ): void {
    this.updateShopName(shopName);
    this.updateShopItems(shopItems);
    this.updatePlayerItems(playerItems);
    this.updatePlayerCoins(playerCoins);
    this.updateShopCoins(shopCoins);

    this.playerInventoryGrid.grid
      .getChildren()
      .forEach((child: any) => child.setDepth(1));
    this.shopInventoryGrid.grid
      .getChildren()
      .forEach((child: any) => child.setDepth(1));
  }

  updateShopCoins(amount: number) {
    this.shopCoins.setText(`${amount}g`);
  }
  updatePlayerItems(items: any[]) {
    items.forEach((item) => {
      return this.addToSlot(
        this.playerInventoryGrid,
        item.pickedUp.slotIndex,
        item
      );
    });
  }
  updateShopItems(items: any[]) {
    items.forEach((item) => {
      return this.addToSlot(
        this.shopInventoryGrid,
        item.pickedUp.slotIndex,
        item
      );
    });
  }
  updatePlayerCoins(amount: number) {
    this.playerCoins.setText(`${amount}g`);
  }
  updateShopName(name: string) {
    this.shopName.setText(name);
  }

  updateCoinsInPlay(amount: number) {
    this.coinsInPlay.setText(`${amount}g`);
  }
  updateShopCoinsInPlay(amount: number) {
    this.shopCoinsInPlay.setText(`${amount}g`);
  }
  addToPlayerInPlay(itemConfig: any, newslotIndex: number) {
    return this.addToSlot(this.playerInPlay, newslotIndex, itemConfig);
  }

  addToSlot(grid: InventoryGrid, slotIndex: number, itemConfig: any) {
    // const itemGrid = grid.getElement(
    //   "items"
    // ) as Phaser.GameObjects.GameObject[];
    // const slot = itemGrid[slotIndex] as ItemGridSlot;

    grid.addItem(itemConfig, slotIndex);

    return null;
  }
  addToShopInPlay(itemConfig: any, newSlotIndex: number) {
    return this.addToSlot(this.shopInPlay, newSlotIndex, itemConfig);
  }
  addToPlayerInventory(itemConfig: any, newslotIndex: number) {
    return this.addToSlot(this.playerInventoryGrid, newslotIndex, itemConfig);
  }

  addToShopInventory(itemConfig: any, newslotIndex: number) {
    return this.addToSlot(this.shopInventoryGrid, newslotIndex, itemConfig);
  }

  removeFromSlot(grid: GridSizer, slotIndex: number) {
    const itemGrid = grid.getElement(
      "items"
    ) as Phaser.GameObjects.GameObject[];
    const slot = itemGrid[slotIndex] as ItemGridSlot;
    const item = slot?.removeItem();
    grid.layout();

    return item;
  }

  removeItemFromPlayerInPlay(slotIndex: number) {
    return this.removeFromSlot(this.playerInPlay, slotIndex);
  }
  removeItemFromPlayerInventory(slotIndex: number) {
    this.removeFromSlot(this.playerInventoryGrid, slotIndex);
  }
  removeItemFromShopInPlay(slotIndex: any) {
    this.removeFromSlot(this.shopInPlay, slotIndex);
  }
  removeItemFromShopInventory(index: number) {
    this.removeFromSlot(this.shopInventoryGrid, index);
  }
}
