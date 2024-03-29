import '../css/style.css';

import Phaser from 'phaser';
import { Brueckenwart } from './scenes/Game';
import { Intro } from './scenes/Intro';

export default new Phaser.Game({
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game',
    width: 1280,
    height: 720,
  },
  scene: [Intro, Brueckenwart],
});
