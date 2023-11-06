import type { ScrollablePanel } from "phaser3-rex-plugins/templates/ui/ui-components";
import { alignGrid } from "../AlignGrid.js";
import { HudContext } from "../HudContext.ts";
import constants from "../config/Constants.ts";
import TradeScene from "../scenes/TradeScene.ts";
import InventoryPanel from "./InventoryPanel.ts";
import ItemSlot from "./ItemSlot.ts";
import OverlapItemSlot from "./OverlapItemSlot.ts";
export default class InventoryPanelFactory {
  static create(scene: any, config: any = {}): InventoryPanel {
    const slots = this.createSlots(
      scene,
      config.slots || 50,
      config.context || HudContext.inventory
    );

    const sizer = scene.rexUI.add.scrollablePanel({
      orientation: 1,
      panel: {
        child: this.createPanel(scene, slots, config),
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
      header: config.header,
      scrollMode: 0,
      width: config.columns ? config.columns * 50 : 206,
      height: config.height ?? 400,
    }) as ScrollablePanel;

    sizer.layout();

    alignGrid.center(sizer);
    return new InventoryPanel(sizer);
  }

  static createSlots(scene: TradeScene, amount: number, context: HudContext) {
    const slots = [];
    for (let x = 0; x < amount ?? 50; x++) {
      const itemSlot = new OverlapItemSlot(
        0,
        0,
        32,
        32,
        {
          orientation: "x",
          slotIndex: x,
          width: 32,
          height: 32,
          overlapChildren: [],
          background: scene.rexUI.add.roundRectangle(0, 0, 45, 45, 2, 0x221c1a),
        },
        scene,
        context
      );

      itemSlot
        .setInteractive({
          dropZone: true,
          hitArea: new Phaser.Geom.Rectangle(0, 0, 45, 45),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        })
        .on("pointerover", function () {
          itemSlot.handle_pointerOver(
            scene,
            context !== HudContext.insignia ? "above" : "below"
          );
        })
        .on("pointerout", function () {
          itemSlot.handle_pointerOut(scene);
        })
        .on("pointerdown", function (pointer) {
          itemSlot.handle_pointerDown(scene, pointer, context);
        })
        .on("pointerup", function (pointer) {
          itemSlot.handle_pointerUp(scene);
        });

      slots.push(itemSlot);
    }

    return slots;
  }

  static createPanel(scene: TradeScene, slots: ItemSlot[], config: any) {
    const sizer = scene.rexUI.add
      .sizer({
        orientation: "y",
      })
      .add(
        this.createTable(scene, slots, config.rows ?? 5, config.columns ?? 10),
        {
          key: constants.ui.keys.inventoryPanel,
        }
      );

    sizer.setDepth(200);

    return sizer;
  }

  static createHeader(scene: TradeScene, text: string) {
    const title = scene.rexUI.add
      .label({
        orientation: "x",
        text: scene.add.text(0, 0, text, constants.styles.text),
      })
      .setDepth(100);

    return scene.rexUI.add
      .sizer({
        orientation: "y",
        space: { left: 5, right: 5, top: 10 },
      })
      .add(
        title // child
      );
  }

  static createTable(
    scene: TradeScene,
    itemSlots: ItemSlot[],
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

    window.table = table;

    for (let i = 0; i < itemSlots.length; i++) {
      const item = itemSlots[i];
      const row = i % rows;
      const column = (i - row) / rows;

      const rightPadding = column === columns - 1 ? 5 : 0;
      const bottompadding = row === rows - 1 ? 5 : 0;

      item.slotIndex = row * cols + column;
      table.add(item, {
        column: column,
        row: row,
        padding: {
          top: 5,
          right: rightPadding,
          left: 5,
          bottom: bottompadding,
        },
        key: item.slotIndex,
        align: "center",
      });
      scene.add.existing(item);
    }

    return scene.rexUI.add
      .sizer({
        orientation: "y",
        space: { left: 0, right: 0, top: 10, bottom: 10, item: 5 },
      })
      .add(
        table, // child
        { key: constants.ui.keys.inventoryGrid }
        // "center", // align
        // 0, // paddingConfig
        // true // expand
      );
    // .setDepth(105);
  }
}
