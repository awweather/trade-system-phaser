import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";

export default class ShopWindow {
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
    npcCoins: Phaser.GameObjects.Text,
    npcName: Phaser.GameObjects.Text,
    npcCoinsInPlay: Phaser.GameObjects.Text
  ) {
    this.sizer = shopWindow;
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
  }

  isOpen(): boolean {
    return this.sizer.visible;
  }

  initialize(
    shopName: string,
    playerName: string,
    playerCoins: number,
    shopCoins: number
  ): void {
    this.updateShopName(shopName);
    this.updatePlayerName(playerName);
    this.updatePlayerCoins(playerCoins);
    this.updateShopCoins(shopCoins);
    this.open();
  }

  updateShopCoins(amount: number) {
    this.shopCoins.setText(`${amount}g`);
  }

  updatePlayerName(name: string) {
    this.playerName.setText(name);
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
}
