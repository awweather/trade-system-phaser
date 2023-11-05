import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";
import { Dialog } from "phaser3-rex-plugins/templates/ui/ui-components";
import { type Ref } from "vue";
import Item from "./Item.ts";
import ItemSlot from "./ItemSlot.ts";
import OverlapItemSlot from "./OverlapItemSlot.ts";

export default class ShopWindow implements Dialog {
  playerInventoryGrid: Sizer;
  shopInventoryGrid: Sizer;
  playerInPlay: Sizer;

  coinsInPlay: Phaser.GameObjects.Text;

  playerName: Phaser.GameObjects.Text;
  playerInventoryHeader: Phaser.GameObjects.Text;
  playerCoins: Phaser.GameObjects.Text;
  shopCoins: Phaser.GameObjects.Text;
  shopCoinsInPlay: Phaser.GameObjects.Text;

  shopInPlay: Sizer;
  shopInventoryHeader: Phaser.GameObjects.Text;
  shopName: Phaser.GameObjects.Text;

  sizer: Sizer;

  constructor(
    shopWindow: Sizer,
    playerCoins: Phaser.GameObjects.Text,
    playerName: Phaser.GameObjects.Text,
    coinsInPlay: Phaser.GameObjects.Text,
    playerInventory: Sizer,
    playerInPlay: Sizer,
    npcInPlay: Sizer,
    npcInventory: Sizer,
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

    this.playerInventoryGrid.getAllChildren().forEach((element) => {
      if (element instanceof OverlapItemSlot) {
        const slot = element as OverlapItemSlot;
        slot.removeItem();
      }
    });

    this.shopInventoryGrid.getAllChildren().forEach((element) => {
      if (element instanceof OverlapItemSlot) {
        const slot = element as OverlapItemSlot;
        slot.removeItem();
      }
    });

    this.playerInPlay.getAllChildren().forEach((element) => {
      if (element instanceof OverlapItemSlot) {
        const slot = element as OverlapItemSlot;
        slot.removeItem();
      }
    });

    this.shopInPlay.getAllChildren().forEach((element) => {
      if (element instanceof OverlapItemSlot) {
        const slot = element as OverlapItemSlot;
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
    shopCoins: number,
    shopCoinsInPlay: Ref<number>,
    coinsInPlay: Ref<number>
  ): void {
    this.updateShopName(shopName);
    this.updateShopItems(shopItems);
    this.updatePlayerItems(playerItems);

    // watch(playerCoins, (newValue) => {
    //   this.updatePlayerCoins(newValue);
    // });

    // watch(shopCoins, (newValue) => {
    //   this.updateShopCoins(newValue);
    // });

    // watch(coinsInPlay, (newValue) => {
    //   this.updateCoinsInPlay(newValue);
    // });

    // watch(shopCoinsInPlay, (newValue) => {
    //   this.updateShopCoinsInPlay(newValue);
    // });

    this.updatePlayerCoins(playerCoins);
    this.updateShopCoins(shopCoins);

    this.playerInventoryGrid
      .getChildren()
      .forEach((child: any) => child.setDepth(1));
    this.shopInventoryGrid
      .getChildren()
      .forEach((child: any) => child.setDepth(1));

    // this.playerInventoryGrid.setDepth(500);
    // this.shopInventoryGrid.setDepth(500);
    // this.shopCoins.setDepth(500);
    // this.playerCoins.setDepth(500);
    // this.coinsInPlay.setDepth(500);
    // this.shopCoinsInPlay.setDepth(500);
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

  addToSlot(grid: Sizer, slotIndex: number, itemConfig: any) {
    const slot = grid.getElement(`items`)[slotIndex] as ItemSlot;

    if (slot) {
      const item = slot.addItem(itemConfig);
      grid.layout();
      return item.setDepth(201);
    }

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

  removeFromSlot(grid: Sizer, slotIndex: number) {
    const slot = grid.getElement("items")[slotIndex] as ItemSlot;
    const item = slot?.removeItem();
    grid.layout();

    return item;
  }

  removeItemFromPlayerInPlay(slotIndex: number) {
    return this.removeFromSlot(this.playerInPlay, slotIndex);
  }
  removeItemFromPlayerInventory(slotIndex: number): Item {
    return this.removeFromSlot(this.playerInventoryGrid, slotIndex);
  }
  removeItemFromShopInPlay(slotIndex: any) {
    return this.removeFromSlot(this.shopInPlay, slotIndex);
  }
  removeItemFromShopInventory(index: number) {
    return this.removeFromSlot(this.shopInventoryGrid, index);
  }
}
