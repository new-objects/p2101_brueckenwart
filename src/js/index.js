import '../css/style.css';

import Phaser from 'phaser';

function preload() {
  this.load.image('bg', 'assets/Klappbruecke_Test1_BG.webp');
  this.load.image('bridge', 'assets/Klappbruecke_Test1_Bridge.webp');
  this.load.image('displays', 'assets/Klappbruecke_Displays.webp');
}

function create() {
  this.add.image(0, 0, 'bg').setOrigin(0).setScale(0.5);
  this.add.image(0, 0, 'bridge').setOrigin(0).setScale(0.5);
  this.add.image(0, 0, 'displays').setOrigin(0).setScale(0.5);
}

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload,
    create,
  },
};

// eslint-disable-next-line no-unused-vars
const game = new Phaser.Game(config);
