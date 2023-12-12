import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  preload() {
    this.load.image('bg', 'assets/Klappbruecke_Test1_BG.jpg');
    this.load.image('bridge', 'assets/Klappbruecke_Test1_Bridge.png');
    this.load.image('level1', 'assets/Klappbruecke_Test1_Ebene1.png');
    this.load.image('middleL', 'assets/Klappbruecke_Test1_MitteL.png');
    this.load.image('middleR', 'assets/Klappbruecke_Test1_MitteR.png');
    this.load.image('displays', 'assets/Klappbruecke_Displays.png');
    this.load.image('arrowUp', 'assets/Klappbruecke_Pfeile_up.png');
    this.load.image('arrowDown', 'assets/Klappbruecke_Pfeile_down.png');
  }

  create() {
    // const { width, height } = this.scale;

    this.add.image(480, 275, 'bg').setScale(0.5);
    this.add.image(480, 275, 'bridge').setScale(0.5);
    this.middleL = this.add.sprite(480, 275, 'middleL').setScale(0.5);
    this.middleR = this.add.sprite(480, 275, 'middleR').setScale(0.5);
    this.add.image(480, 275, 'level1').setScale(0.5);
    this.add.image(480, 275, 'displays').setScale(0.5);
    this.add.image(480, 275, 'arrowUp').setScale(0.5);
    this.add.image(480, 275, 'arrowDown').setScale(0.5);

    this.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
    this.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      this.handlePointerMove,
      this,
    );
  }
  /**
   * @param {Phaser.Input.Pointer} pointer
   */

  handlePointerUp(pointer) {
    const targetRad = Phaser.Math.Angle.Between(
      this.middleL.x,
      this.middleL.y,
      pointer.x,
      pointer.y,
    );

    const currentRad = this.middleL.rotation;

    let diff = targetRad - currentRad;

    if (diff < -Math.PI) {
      diff += Math.PI * 2;
    } else if (diff > Math.PI) {
      diff -= Math.PI * 2;
    }

    this.tweens.add({
      targets: this.middleL,
      rotation: currentRad + diff,
      duration: 500,
      onUpdate: tween => {
        const value = tween.getValue();
        this.degrees.text = Math.round(Phaser.Math.RadToDeg(value)).toString();
        this.radians.text = value.toFixed(2);
      },
    });
  }
  /**
   *
   * @param {Phaser.Input.Pointer} pointer
   */

  handlePointerMove(pointer) {
    const px = pointer.x;
    const py = pointer.y;

    const ox = this.middleL.x;
    const oy = this.middleL.y;

    const targetAngle = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.Between(ox, oy, px, py),
    );
    const target = (targetAngle + 360) % 360;

    this.middleL.angle = target;
  }
}
