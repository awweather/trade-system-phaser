import Phaser from "phaser";

export default class Controls extends Phaser.Cameras.Controls.FixedKeyControl {
  ctrl: Phaser.Input.Keyboard.Key;
  shift: Phaser.Input.Keyboard.Key;
  constructor(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    camera: Phaser.Cameras.Scene2D.Camera,
    scene: Phaser.Scene
  ) {
    super({
      camera: camera,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5,
    });

    this.shift = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );
    this.ctrl = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.CTRL
    );
  }

  justDown(key: Phaser.Input.Keyboard.Key) {
    return Phaser.Input.Keyboard.JustDown(key);
  }
}
