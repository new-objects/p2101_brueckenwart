import '../css/style.css';

import Phaser from 'phaser';
import Game from './scenes/Game';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: Game,
});
