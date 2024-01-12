import Phaser from 'phaser';
import HandTracking from './game/HandTracking';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
    // init mediapipe hand tracking
    this.handTracking = new HandTracking({ hands: 2 });
    this.rightHandUp = false;
  }

  preload() {
    this.load.spritesheet('fullscreen', 'assets/fullscreen.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('bg', 'assets/Klappbruecke_Test1_BG.jpg');
    this.load.image('bridge', 'assets/Klappbruecke_Test1_Bridge.png');
    this.load.image('level1', 'assets/Klappbruecke_Test1_Ebene1.png');
    this.load.image('middleL', 'assets/Klappbruecke_Test1_MitteL.png');
    this.load.image('middleR', 'assets/Klappbruecke_Test1_MitteR.png');
    this.load.image('displays', 'assets/Klappbruecke_Displays.png');
    this.load.image('arrowUp', 'assets/Klappbruecke_Pfeile_up.png');
    this.load.image('arrowDown', 'assets/Klappbruecke_Pfeile_down.png');
    // this.load.image('handLeft', 'assets/bird.png');
    // this.load.image('handRight', 'assets/bird.png');
    this.load.image('rope', 'assets/Seil_einzeln2.png');
    this.load.image('car', 'assets/bird.png');
  }

  create() {
    const { width, height } = this.scale;
    this.width = width;
    this.height = height;

    this.add.image(width / 2, height / 2, 'bg').setScale(width / 1920);

    // create a group of ropes
    this.ropes = this.physics.add.staticGroup();

    // adding a car
    this.car = this.physics.add.sprite(0, height / 2, 'car');
    this.car.setTint(0x00ff00);

    for (let i = 0; i < 2; ++i) {
      // splits the width of the screen into equal parts
      const x = (this.width / 3) * (i + 1);
      const y = -150;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const rope = this.ropes.create(x, y, 'rope').setScale(0.5);
      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = rope.body;
      body.updateFromGameObject();
    }

    this.bridge = this.add
      .image(width / 2, height / 2, 'bridge')
      .setScale(height / 1080);

    this.middleL = this.add
      .sprite(width / 2 - 150, height / 2 + 50, 'middleL')
      .setScale(0.5)
      .setOrigin(0, 1);

    this.middleL.setOrigin(0, 1);

    this.middleR = this.add
      .sprite(width / 2 + 150, height / 2 + 50, 'middleR')
      .setScale(0.5)
      .setOrigin(1);

    this.add.image(width / 2, height / 2, 'level1').setScale(0.5);
    this.add.image(width / 2, height / 2, 'displays').setScale(0.5);
    this.add.image(width / 2, height / 2, 'arrowUp').setScale(0.5);
    this.add.image(width / 2, height / 2, 'arrowDown').setScale(0.5);

    // UI

    this.targetRotation = this.add.text(10, 10, '0', {
      fontSize: 24,
    });

    // left hand
    this.leftHandSprite = this.add.circle(width * 0.5, height * 0.5, 30);
    this.leftHandSprite.setStrokeStyle(6, 0xe4bfc8);

    this.physics.add.existing(this.leftHandSprite);

    // right hand
    this.rightHandSprite = this.add.circle(width * 0.5 + 100, height * 0.5, 30);
    this.rightHandSprite.setStrokeStyle(6, 0xe4bfc8);

    this.physics.add.existing(this.rightHandSprite);

    // add collision between hands and ropes
    this.physics.add.collider(this.leftHandSprite, this.ropes, (_, rope) => {
      this.leftHandCollides = true;
      this.lastLeftHandRope = rope; // Store the collided rope
    });
    this.physics.add.collider(this.rightHandSprite, this.ropes, (_, rope) => {
      this.rightHandCollides = true;
      this.lastRightHandRope = rope; // Store the collided rope
    });

    const button = this.add
      .image(800 - 16, 16, 'fullscreen', 0)
      .setOrigin(1, 0)
      .setInteractive();

    button.on(
      'pointerup',
      function () {
        if (this.scale.isFullscreen) {
          button.setFrame(0);

          this.scale.stopFullscreen();
        } else {
          button.setFrame(1);

          this.scale.startFullscreen();
        }
      },
      this,
    );

    // tweens

    this.middleRTweenUp = this.tweens.add({
      targets: this.middleR,
      duration: 1000,
      ease: 'Linear',
      angle: 90,
      paused: true,
    });

    this.middleRTweenDown = this.tweens.add({
      targets: this.middleR,
      duration: 1000,
      ease: 'Linear',
      angle: 90,
      paused: true,
    });
  }

  update() {
    this.car.x += 2;

    if (this.car.x >= this.width) this.car.x = 0;

    // Get current rotation of the bridge parts
    const middleLRot = this.middleL.rotation;
    const middleRRot = this.middleR.rotation;

    const bridgeIsElevated =
      Math.abs(middleLRot) > 0.05 || // Tweak the values according to when you consider the bridge "elevated"
      Math.abs(middleRRot) > 0.05; // Same for this

    if (bridgeIsElevated) {
      // Stop the car or make it move slowly
      this.car.setVelocityX(0);
    } else {
      // If bridge is not elevated, move the car from left to right
      this.car.setVelocityX(100); // Set speed value as needed
    }

    // get hand tracking results
    /** @type {import('@mediapipe/tasks-vision').GestureRecognizerResult} */
    const trackedHandsMediapipe = this.handTracking.getResult().result;

    // map mediapipe results to game coordinates
    this.trackedHands = this.calculateCoordinates(trackedHandsMediapipe);
    // update hands
    const { handLeft: leftHandTracked, handRight: rightHandTracked } =
      this.trackedHands ?? {};
    this.updateHandPosition(this.leftHandSprite, leftHandTracked);
    this.updateHandPosition(this.rightHandSprite, rightHandTracked);

    if (
      rightHandTracked &&
      rightHandTracked.gesture === 'Closed_Fist' &&
      this.rightHandCollides
    ) {
      console.log('right hand gesture: ', rightHandTracked.gesture);

      if (!this.rightHandUp) {
        console.log('bridge is DOWN');
        if (!this.middleRTweenDown.isPlaying()) {
          this.middleRTweenDown.reset();
          this.middleRTweenDown.pause();
        }
        this.middleRTweenUp.play();
        this.rightHandUp = true;
      }

      if (this.rightHandUp) {
        console.log('bridge is UP');
        if (!this.middleRTweenUp.isPlaying()) {
          this.middleRTweenUp.reset();
          this.middleRTweenUp.pause();
        }
        this.middleRTweenDown.play();
        this.rightHandUp = false;
      }
    }

    if (
      leftHandTracked &&
      leftHandTracked.gesture === 'Closed_Fist' &&
      this.leftHandCollides
    ) {
      console.log('left hand gesture: ', leftHandTracked.gesture);

      this.tweens.add({
        targets: this.middleL,
        rotation: -Math.PI * 0.5,
        duration: 1000,
        yoyo: false,
      });
    }
  }

  updateHandPosition(hand, handData) {
    if (!handData) return;

    const { x, y } = handData;
    hand.setX(x);
    hand.setY(y);
    hand.body.reset(x, y);
  }

  calculateCoordinates(modelData) {
    const hands = {};
    if (modelData && modelData.landmarks && modelData.landmarks.length > 0) {
      const { width } = this.game.config;

      modelData.handedness.forEach((hand, index) => {
        const handName =
          hand[0].categoryName === 'Left' ? 'handLeft' : 'handRight'; // left or right
        const { x, y } = modelData.landmarks[index][8];
        const gesture = modelData.gestures[index][0].categoryName;
        hands[handName] = {
          x: width - x * width || 0,
          y: y * width || 0,
          gesture,
        };
      });
    }

    return hands;
  }
}
