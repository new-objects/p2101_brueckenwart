import '../css/style.css';

import Phaser from 'phaser';
import Game from './scenes/Game';
import TitleScreen from './scenes/TitleScreen';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);

game.scene.add('title', TitleScreen);
game.scene.add('game', Game);

game.scene.start('game');
