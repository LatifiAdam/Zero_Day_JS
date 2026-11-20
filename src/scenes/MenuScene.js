import { buildOfficeBackground, buildPersonTexture } from '../art/office-art.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const bg = buildOfficeBackground(this);
    this.add.image(0, 0, bg).setOrigin(0, 0).setDepth(0);

    const staff = [
      { x: 73, y: 142, shirt: '#77538c', hair: '#292a36', key: 'zdi-person-purple' },
      { x: 237, y: 142, shirt: '#568c66', hair: '#3b2c25', key: 'zdi-person-green' },
      { x: 398, y: 142, shirt: '#c17a42', hair: '#392a25', key: 'zdi-person-orange' }
    ];
    for (const person of staff) {
      buildPersonTexture(this, person.key, person.shirt, person.hair);
      this.add.ellipse(person.x, person.y + 6, 18, 5, 0x14202a, .45).setDepth(2);
      this.add.image(person.x, person.y, person.key).setOrigin(.5, .75).setDepth(3);
    }

    // A colleague quietly crosses the central aisle on a repeating patrol.
    buildPersonTexture(this, 'zdi-person-walker', '#8f6282', '#2f2935');
    this.walkerShadow = this.add.ellipse(80, 250, 18, 5, 0x14202a, .45).setDepth(4);
    this.walker = this.add.image(80, 246, 'zdi-person-walker').setOrigin(.5, .8).setDepth(5);
    this.tweens.add({
      targets: [this.walker, this.walkerShadow], x: 420, duration: 19000,
      ease: 'Linear', yoyo: true, repeat: -1,
      onYoyo: () => this.walker.setFlipX(true),
      onRepeat: () => this.walker.setFlipX(false)
    });

    // Tiny active indicators give the room life without obscuring the artwork.
    this.statusLeds = [];
    for (const [x, y] of [[455, 20], [455, 34], [455, 48], [455, 62], [26, 117], [188, 117], [349, 117]]) {
      const led = this.add.rectangle(x, y, 2, 2, 0x69e0c4).setDepth(6);
      this.statusLeds.push(led);
    }
    this.tweens.add({ targets: this.statusLeds, alpha: .2, duration: 730, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(8, 259, 'INTERNAL NETWORK  /  FLOOR 02', {
      fontFamily: 'monospace', fontSize: '5px', color: '#d8e7e8', letterSpacing: 1
    }).setDepth(7).setAlpha(.8);
    this.add.text(472, 259, 'SHIFT ACTIVE', {
      fontFamily: 'monospace', fontSize: '5px', color: '#d8e7e8', align: 'right'
    }).setOrigin(1, 0).setDepth(7).setAlpha(.8);

    this.input.keyboard?.on('keydown-ESC', () => window.dispatchEvent(new Event('zdi:escape')));
    this.events.on('shutdown', () => window.dispatchEvent(new Event('zdi:menu-scene')));
  }
}
