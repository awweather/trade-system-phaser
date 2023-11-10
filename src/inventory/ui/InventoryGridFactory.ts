import type { ScrollablePanel } from "phaser3-rex-plugins/templates/ui/ui-components";
import { alignGrid } from "../../AlignGrid.js";
import { HudContext } from "../../HudContext.ts";
import { keys } from "../../config/Keys.ts";
import TradeScene from "../../scenes/TradeScene.ts";
import ShopWindowDragManager from "../../shop/managers/ShopWindowDragManager.ts";
import InventoryGridManager from "../managers/InventoryGridManager.ts";
import InventoryGridSlotItemManager from "../managers/InventoryGridSlotItemManager.ts";
import InventoryGridSlotPointerEventManager from "../managers/InventoryGridSlotPointerEventManager.ts";
import ItemInfoPanelManager from "../managers/ItemInfoPanelManager.ts";
import InventoryGridSlot from "./InventoryGridSlot.ts";

export interface InventoryGridConfig {
  slots: number;
  // The type of slots.  Inventory grids can be used in many different contexts,
  // including shops, inventory equipment, etc
  context: HudContext;
  panelHeader: Phaser.GameObjects.GameObject;
  columns: number;
  rows: number;
  height: number;
}

export default class InventoryGridFactory {
  static create(
    scene: TradeScene,
    config: InventoryGridConfig
  ): InventoryGridManager {
    const slots = this.createSlots(scene, config.slots, config.context);

    const panel = this.createPanel(scene, slots, config);

    const sizer = scene.rexUI.add.scrollablePanel({
      orientation: 1,
      panel: {
        child: panel,
        mask: {
          padding: 1,
        },
      },
      space: {
        top: 0,
        right: 0,
      },
      expand: {
        header: false,
        footer: true,
      },

      align: {
        header: "center",
        footer: "center",
      },
      header: config.panelHeader,
      scrollMode: 0,
      width: config.columns ? config.columns * 50 : 206,
      height: config.height ?? 400,
    }) as ScrollablePanel;

    sizer.layout();

    alignGrid.center(sizer);

    // We have to sort these because the rexUI plugin adds item slots to the grid column by column, instead of row by row
    // This ensures that slots[index] gives you the correct item slot as if you were counting from left to right
    slots.sort((slotA, slotB) => {
      return slotA.slotIndex - slotB.slotIndex;
    });

    return new InventoryGridManager(sizer, panel, slots);
  }

  static createSlots(scene: TradeScene, amount: number, context: HudContext) {
    const slots = [];
    for (let x = 0; x < amount ?? 50; x++) {
      const slotSprite = scene.rexUI.add.overlapSizer({
        x: 0,
        y: 0,
        width: 32,
        height: 32,
      });

      slotSprite.addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 32, 32, 2, 0x221c1a)
      );

      const slot = new InventoryGridSlot(slotSprite, context, x);

      slot.registerManagers(
        new InventoryGridSlotItemManager(scene, slot),
        new ShopWindowDragManager(scene, slot),
        new InventoryGridSlotPointerEventManager(scene, slot),
        new ItemInfoPanelManager(scene, slot)
      );

      slots.push(slot);
    }

    return slots;
  }

  static createPanel(
    scene: TradeScene,
    slots: InventoryGridSlot[],
    config: InventoryGridConfig
  ) {
    const sizer = scene.rexUI.add
      .sizer({
        orientation: "y",
      })
      .add(
        this.createTable(scene, slots, config.rows ?? 5, config.columns ?? 10),
        {
          key: keys.ui.inventoryTable,
        }
      );

    sizer.setDepth(200);

    return sizer;
  }

  static createHeader(scene: TradeScene, text: string) {
    const title = scene.rexUI.add
      .label({
        orientation: "x",
        text: scene.add.text(0, 0, text),
      })
      .setDepth(100);

    return scene.rexUI.add
      .sizer({
        orientation: "y",
        space: { left: 5, right: 5, top: 10 },
      })
      .add(title);
  }

  static createTable(
    scene: TradeScene,
    itemSlots: InventoryGridSlot[],
    rows: number,
    columns: number
  ) {
    const cols = Math.ceil(itemSlots.length / rows);
    const table = scene.rexUI.add.gridSizer({
      column: cols,
      row: rows,
      space: { column: 0, row: 0 },
      name: "table", // Search this name to get table back
    });

    for (let i = 0; i < itemSlots.length; i++) {
      const itemSlot = itemSlots[i];
      const row = i % rows;
      const column = (i - row) / rows;

      const rightPadding = column === columns - 1 ? 5 : 0;
      const bottompadding = row === rows - 1 ? 5 : 0;

      itemSlot.setSlotIndex(row * cols + column);

      table.add(itemSlot.slotSprite, {
        column: column,
        row: row,
        padding: {
          top: 5,
          right: rightPadding,
          left: 5,
          bottom: bottompadding,
        },
        key: itemSlot.slotIndex.toString(),
        align: "center",
      });
    }

    return scene.rexUI.add
      .sizer({
        orientation: "y",
        space: { left: 0, right: 0, top: 10, bottom: 10, item: 5 },
      })
      .add(table, { key: keys.ui.inventoryGrid });
  }
}
