import { OverlapSizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { HudContext } from "../HudContext.ts";
import DragManager from "../common/ShopWindowDragManager.ts";
import { GameEntity } from "../ecs/GameEntity.ts";
import {
  DescriptorComponent,
  PickedUpComponent,
  QuantityComponent,
  RenderableComponent,
  TradeIdComponent,
} from "../ecs/components/Components.ts";
import {
  InventoryGridSlotEvent,
  InventoryGridSlotEventEmitter,
} from "./InventoryGridSlotEventEmitter.ts";
import InventoryGridSlotItemManager from "./InventoryGridSlotItemManager.ts";
import InventoryGridSlotPointerEventManager from "./InventoryGridSlotPointerEventManager.ts";
import ItemInfoPanelManager from "./ItemInfoPanelManager.ts";

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
 * This class contains the UI logic for the ItemSlot
 * Used for all inventory grids
 */
export default class InventoryGridSlot {
  private itemManager: InventoryGridSlotItemManager | undefined;
  private dragManager: DragManager | undefined;
  private pointerEventManager: InventoryGridSlotPointerEventManager | undefined;
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

  getItem() {
    this.assertInitialized();

    return this.itemManager!.getItem();
  }

  hasItem() {
    this.assertInitialized();

    return this.itemManager!.hasItem();
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
    itemManager: InventoryGridSlotItemManager,
    dragManager: DragManager,
    pointerEventManager: InventoryGridSlotPointerEventManager,
    itemInfoPanelManager: ItemInfoPanelManager
  ) {
    this.itemManager = itemManager;
    this.dragManager = dragManager;
    this.pointerEventManager = pointerEventManager;
    this.itemInfoPanelManager = itemInfoPanelManager;
  }

  removeItem() {
    this.assertInitialized();
    this.itemManager!.removeItem();
  }

  handleSlotClick() {
    const item = this.itemManager?.getItem();

    if (!item) return;

    this.events.emit(InventoryGridSlotEvent.ITEM_CLICKED, {
      slotContext: this.slotType,
      slotIndex: this.slotIndex,
      item: item.entity,
    });
  }

  handleDrag(pointer: Phaser.Input.Pointer) {
    this.assertInitialized();
    this.dragManager!.handleDrag(pointer);
  }

  handlePointerOver() {
    this.assertInitialized();
    this.pointerEventManager!.handlePointerOver();
  }

  handlePointerOut() {
    this.assertInitialized();
    this.pointerEventManager!.handlePointerOut();
  }

  handlePointerUp() {
    this.assertInitialized();
    this.pointerEventManager!.handlePointerUp();
  }

  handlePointerDown() {
    this.assertInitialized();
    this.pointerEventManager!.handlePointerDown();
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
