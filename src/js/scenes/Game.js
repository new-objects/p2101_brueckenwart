import Phaser from 'phaser';
import { HandTracking, mergeObjects, webcamGui } from '@new-objects/libs';

export class Brueckenwart extends Phaser.Scene {
  ROPES_TOTAL = 2;
  constructor() {
    super('Brueckenwart');
    this.handTracking = null;
    this._hands = {
      left: {},
      right: {},
    };
  }

  preload() {
    this.load.image('background', 'assets/Klappbruecke_Test1_BG.jpg');
    this.load.spritesheet('fullscreenCtrl', 'assets/fullscreen.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('bridge', 'assets/Klappbruecke_Test1_Bridge_small.png');
    this.load.image('level1', 'assets/Klappbruecke_Test1_Ebene1.png');
    this.load.image('middleL', 'assets/Klappbruecke_Test1_MitteL.png');
    this.load.image('middleR', 'assets/Klappbruecke_Test1_MitteR.png');
    this.load.image('displays', 'assets/Klappbruecke_Displays.png');
    this.load.image('arrowUp', 'assets/Klappbruecke_Pfeile_up.png');
    this.load.image('arrowDown', 'assets/Klappbruecke_Pfeile_down.png');
    this.load.image('rope', 'assets/Seil_Griff.png');
    this.load.image('car', 'assets/Klappbruecke_Test1_Auto_small.png');

    const { width, height } = this.sys.game.canvas;
    this._width = width;
    this._height = height;
  }

  create() {
    // switch scenes
    this.input.keyboard.once(
      'keydown-SPACE',
      () => {
        this.scene.start('Intro');
      },
      this,
    );

    this.background = this.add.image(0, 0, 'background').setOrigin(0);
    this.background.setDisplaySize(this._width, this._height);

    // create a group of ropes
    this.createRopes();

    // adding a car
    this.car = this.physics.add
      .sprite(30, this._height * 0.36, 'car')
      .setOrigin(0);
    // this.car.setTint(0x00ff00);
    this.car.flipX = true;

    this.bridge = this.add
      .sprite(0, this._width * 0.225, 'bridge')
      .setOrigin(0);
    this.bridge.displayWidth = this._width;

    this.middleL = this.add
      .sprite(this._width * 0.33, this._height * 0.5, 'middleL')
      .setOrigin(0, 1);
    this.middleL.setScale(0.7);
    this.middleL.setRotation(0);

    this.middleR = this.add
      .sprite(this._width * 0.67, this._height * 0.5, 'middleR')
      .setOrigin(1, 1);

    this.middleR.setScale(0.7);
    this.middleR.setRotation(0);

    this.add
      .image(this._width * 0.5, this._height * 0.5, 'level1')
      .setOrigin(0);

    this.displays = this.add.image(
      this._width * 0.5,
      this._height * 0.5,
      'displays',
    );
    this.displays.setScale(0.65);

    this.arrowsUp = this.add.image(
      this._width * 0.5,
      this._height * 0.5,
      'arrowUp',
    );
    this.arrowsUp.setScale(0.65);
    this.arrowsUp.visible = false;

    this.arrowsDown = this.add.image(
      this._width * 0.5,
      this._height * 0.5,
      'arrowDown',
    );
    this.arrowsDown.setScale(0.65);
    this.arrowsDown.visible = false;

    // UI

    this.targetRotation = this.add.text(10, 10, '0', {
      fontSize: 24,
    });

    // left hand
    this._hands.left = this.add.circle(
      this._width * 0.5,
      this._height * 0.5,
      20,
      0xe4bfc8,
    );
    this._hands.left.name = 'left';
    this._hands.left.setStrokeStyle(6, 0xe4bfc8);
    this.physics.add.existing(this._hands.left);

    // right hand
    this._hands.right = this.add.circle(
      this._width * 0.6,
      this._height * 0.5,
      20,
      0xe4bfc8,
    );
    this._hands.right.name = 'right';
    this._hands.right.setStrokeStyle(6, 0xe4bfc8);
    this.physics.add.existing(this._hands.right);

    // overlap of hands and ropes
    // this.physics.add.overlap(this.sprite, this.healthGroup, this.spriteHitHealth, null, this);
    this.physics.add.overlap(
      this._hands.left,
      this.ropes,
      this.handleCollision,
      null,
      this,
    );
    this.physics.add.overlap(
      this._hands.right,
      this.ropes,
      this.handleCollision,
      null,
      this,
    );

    this.fullscreenBtn = this.add
      .image(this._width - 16, this._height - 16, 'fullscreenCtrl', 0)
      .setOrigin(1, 1)
      .setInteractive();

    this.fullscreenBtn.on(
      'pointerup',
      function () {
        if (this.scale.isFullscreen) {
          this.fullscreenBtn.setFrame(0);

          this.scale.stopFullscreen();
        } else {
          this.fullscreenBtn.setFrame(1);

          this.scale.startFullscreen();
        }
      },
      this,
    );

    HandTracking.initialize({
      hands: 2,
      width: this._width,
      height: this._height,
      webcamOptions: { video: { width: this._width, height: this._height } },
    }).then(tracker => {
      this._handTracking = tracker;

      // gui
      // !!! - (debug) - replaced it with my local variant
      webcamGui();
    });

    // tweens

    // this.middleRTweenUp = this.tweens.add({
    //   targets: this.middleR,
    //   duration: 1000,
    //   ease: 'Linear',
    //   angle: 90,
    //   paused: true,
    // });

    // this.middleRTweenDown = this.tweens.add({
    //   targets: this.middleR,
    //   duration: 1000,
    //   ease: 'Linear',
    //   angle: 90,
    //   paused: true,
    // });
  }

  update() {
    if (!this._handTracking) return;

    const results = this._handTracking.getHands(this._width, this._height);
    if (results.detected) {
      this.updateHand(results.handLeft, this._hands.left, 220);
      this.updateHand(results.handRight, this._hands.right, 320);

      const ropesHeight = this._height * 0.2;
      this.middleL.setRotation(
        (this.ropes.children.entries[0].y - ropesHeight) * -0.005,
      );

      this.middleR.setRotation(
        (this.ropes.children.entries[1].y - ropesHeight) * 0.005,
      );
      console.log(this.middleL.getTopLeft());
      console.log(this.middleR.getTopRight());
      console.log(this.middleR.rotation);
    }
    if (
      this.middleL.rotation >= 0.1 ||
      this.middleL.rotation <= -0.1 ||
      (this.middleR.rotation <= 0.1 && this.middleR.rotation > 0) ||
      (this.middleR.rotation >= -0.1 && this.middleR.rotation < 0)
    )
      this.car.x += 0;
    else {
      this.car.x += 1;
    }
    if (this.car.x >= this._width) this.car.x = -10;
    // // Get current rotation of the bridge parts
    // const middleLRot = this.middleL.rotation;
    // const middleRRot = this.middleR.rotation;
    // const bridgeIsElevated =
    //   Math.abs(middleLRot) > 0.05 || // Tweak the values according to when you consider the bridge "elevated"
    //   Math.abs(middleRRot) > 0.05; // Same for this
    // if (bridgeIsElevated) {
    //   // Stop the car or make it move slowly
    //   this.car.setVelocityX(0);
    // } else {
    //   // If bridge is not elevated, move the car from left to right
    //   this.car.setVelocityX(100); // Set speed value as needed
    // }
    // get hand tracking results
    /** @type {import('@mediapipe/tasks-vision').GestureRecognizerResult} */
    // const trackedHandsMediapipe = this.handTracking.getResult().result;
    // map mediapipe results to game coordinates
    //this.trackedHands = this.calculateCoordinates(trackedHandsMediapipe);
    // update hands
    // const { handLeft: leftHandTracked, handRight: rightHandTracked } =
    //   this.trackedHands ?? {};
    // this.updateHandPosition(this.leftHandSprite, leftHandTracked);
    // this.updateHandPosition(this.rightHandSprite, rightHandTracked);
    // if (
    //   rightHandTracked &&
    //   rightHandTracked.gesture === 'Closed_Fist' &&
    //   this.rightHandCollides
    // ) {
    //   console.log('right hand gesture: ', rightHandTracked.gesture);
    //   if (!this.rightHandUp) {
    //     console.log('bridge is DOWN');
    //     if (!this.middleRTweenDown.isPlaying()) {
    //       this.middleRTweenDown.reset();
    //       this.middleRTweenDown.pause();
    //     }
    //     this.middleRTweenUp.play();
    //     this.rightHandUp = true;
    //   }
    //   if (this.rightHandUp) {
    //     console.log('bridge is UP');
    //     if (!this.middleRTweenUp.isPlaying()) {
    //       this.middleRTweenUp.reset();
    //       this.middleRTweenUp.pause();
    //     }
    //     this.middleRTweenDown.play();
    //     this.rightHandUp = false;
    //   }
    // }
    // if (
    //   leftHandTracked &&
    //   leftHandTracked.gesture === 'Closed_Fist' &&
    //   this.leftHandCollides
    // ) {
    //   console.log('left hand gesture: ', leftHandTracked.gesture);
    //   this.tweens.add({
    //     targets: this.middleL,
    //     rotation: -Math.PI * 0.5,
    //     duration: 1000,
    //     yoyo: false,
    //   });
    // }
  }

  createRopes() {
    // create a group of ropes
    this.ropes = this.physics.add.staticGroup();

    for (let i = 0; i < this.ROPES_TOTAL; ++i) {
      // splits the width of the screen into equal parts
      const x = (this._width / (this.ROPES_TOTAL + 1)) * (i + 1);
      const y = this._height * 0.2;

      const rope = this.ropes.create(x, y, 'rope').setScale(0.5).setOrigin(1);
      rope.body.updateFromGameObject();
    }
  }

  selectClosestRope(hand, ropes) {
    let closestRope = null;
    let _closestDist = Number.POSITIVE_INFINITY;

    this.ropes.children.each(rope => {
      const ropeBottomCenter = rope.getBottomCenter();
      const _dist = Phaser.Math.Distance.Between(
        hand.x,
        0,
        ropeBottomCenter.x,
        0,
      );
      if (_dist < _closestDist) {
        closestRope = rope;
        _closestDist = _dist;
      }
    });

    return closestRope;
  }

  updateHand(trackedHand, handObject, targetY) {
    if (trackedHand) {
      handObject.setX(trackedHand.x);
      handObject.setY(trackedHand.y);

      if (trackedHand.gesture === 'Closed_Fist') {
        handObject.fillColor = 0xffff00;

        const closestRope = this.selectClosestRope(handObject, this.ropes);
        closestRope.setY(trackedHand.y);
      } else {
        handObject.fillColor = 0xe4bfc8;
      }
    }
  }
}
