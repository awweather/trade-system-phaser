import Phaser from "phaser";
import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import TradeScene from "./TradeScene.ts";

export const config = {
  type: Phaser.WEBGL,
  backgroundColor: "black",
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
  },
  scene: [TradeScene],
  plugins: {
    global: [
      {
        key: "dragPlugin",
        plugin: DragPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: { y: 0 },
    },
  },
  callbacks: {},
  disableContextMenu: false,
} as Phaser.Types.Core.GameConfig;
