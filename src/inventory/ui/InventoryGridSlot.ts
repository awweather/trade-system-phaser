import { OverlapSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { HudContext } from "../../HudContext.ts";
import { GameEntity } from "../../ecs/GameEntity.ts";
import {
  DescriptorComponent,
  PickedUpComponent,
  QuantityComponent,
  RenderableComponent,
  TradeIdComponent,
} from "../../ecs/components/Components.ts";
import DragManager from "../../shop/managers/ShopWindowDragManager.ts";
import {
  InventoryGridSlotEvent,
  InventoryGridSlotEventEmitter,
} from "../events/InventoryGridSlotEventEmitter.ts";
import { ItemManager } from "../managers/InventoryGridSlotItemManager.ts";
import { PointerEventManager } from "../managers/InventoryGridSlotPointerEventManager.ts";
import { ItemInfoPanelManager } from "../managers/ShopWindowItemInfoPanelManager.ts";

export interface AddItemConfig {
  renderable: RenderableComponent;
  descriptor: DescriptorComponent;
  frame: string;
  entity: GameEntity;
  pickedUp?: PickedUpComponent;
  quantity?: QuantityComponent;
  tradeId?: TradeIdComponent;
  itemId: string;
}

/**
 * The core class for all inventory slots
 * This class can be composed by constructing managers to handle the item, drag, pointer events, and item hover
 * Functionality can be extended by adding additional managers
 */
export default class InventoryGridSlot {
  private itemManager: ItemManager | undefined;
  private dragManager: DragManager | undefined;
  private pointerEventManager: PointerEventManager | undefined;
  private itemInfoPanelManager: ItemInfoPanelManager | undefined;
  public readonly events: InventoryGridSlotEventEmitter =
    new InventoryGridSlotEventEmitter();
  constructor(
    public readonly slotSprite: OverlapSizer,
    public readonly slotType: HudContext,
    public slotIndex: number
  ) {
    this.slotSprite.setData("slotIndex", slotIndex);
    this.slotSprite.setData("slotType", slotType);
  }

  addItem(item: AddItemConfig) {
    this.assertInitialized();

    const addedItem = this.itemManager!.addItem(item);
    this.slotSprite.layout();

    this.events.emit(InventoryGridSlotEvent.ITEM_ADDED, addedItem);

    return addedItem;
  }

  removeItem() {
    this.assertInitialized();
    this.itemManager!.removeItem();
  }

  getItem() {
    this.assertInitialized();

    return this.itemManager!.getItem();
  }

  hasItem() {
    this.assertInitialized();

    return this.itemManager!.hasItem();
  }

  updateQuantity(newQuantity: number) {
    this.itemManager?.updateQuantity(newQuantity);
  }

  setSlotIndex(slotIndex: number) {
    this.slotIndex = slotIndex;
    this.slotSprite.setData("slotIndex", slotIndex);
  }

  showItemInfo() {
    this.assertInitialized();

    this.itemInfoPanelManager!.showItemInfoPanel();
  }

  registerManagers(
    itemManager: ItemManager,
    dragManager: DragManager,
    pointerEventManager: PointerEventManager,
    itemInfoPanelManager: ItemInfoPanelManager
  ) {
    this.itemManager = itemManager;
    this.dragManager = dragManager;
    this.pointerEventManager = pointerEventManager;
    this.itemInfoPanelManager = itemInfoPanelManager;
  }

  handleSlotClick() {
    const item = this.itemManager?.getItem();

    if (!item) return;

    this.events.emit(InventoryGridSlotEvent.ITEM_CLICKED, {
      slotType: this.slotType,
      slotIndex: this.slotIndex,
      item: item.entity,
    });
  }

  handleDrag(pointer: Phaser.Input.Pointer) {
    this.assertInitialized();
    this.dragManager!.handleDrag(pointer);
  }

  handlePointerOver(pointer: Phaser.Input.Pointer) {
    this.assertInitialized();
    this.pointerEventManager?.handlePointerOver(pointer);
  }

  handlePointerOut(pointer: Phaser.Input.Pointer) {
    this.assertInitialized();
    this.pointerEventManager?.handlePointerOut(pointer);
  }

  assertInitialized() {
    if (
      !this.dragManager ||
      !this.itemManager ||
      !this.pointerEventManager ||
      !this.itemInfoPanelManager
    ) {
      throw new Error(
        "You must call register managers before using this behavior"
      );
    }
  }
}
