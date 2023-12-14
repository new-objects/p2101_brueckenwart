import Phaser from 'phaser';

export default class TitleScreen extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    this.add.text(100, 100, 'Title Screen');
  }
}
