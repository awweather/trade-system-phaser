import TradeScene from "../scenes/TradeScene.ts";
import InventoryGridSlot from "./InventoryGridSlot.ts";
import ItemInfoPanelFactory from "./ItemInfoPanelFactory.ts";

export default class ItemInfoPanelManager {
  constructor(
    private readonly scene: TradeScene,
    private readonly itemSlot: InventoryGridSlot
  ) {}

  showItemInfoPanel() {
    if (this.scene.itemInfoPanel) {
      this.scene.itemInfoPanel.destroy();
    }

    const itemEntity = this.itemSlot.getItem()!.entity;

    this.scene.itemInfoPanel = ItemInfoPanelFactory.create(
      this.scene,
      itemEntity
    ).layout();

    const y =
      this.itemSlot.slotSprite.y +
      this.itemSlot.slotSprite.height / 2 +
      this.scene.itemInfoPanel.height / 2;

    this.scene.itemInfoPanel
      .setX(this.itemSlot.slotSprite.x)
      .setY(y)
      .setDepth(205);
  }
}
