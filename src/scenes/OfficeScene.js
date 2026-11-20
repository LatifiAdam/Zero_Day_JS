import { buildOfficeBackground, buildPersonTexture, addOfficeLabels } from '../art/office-art.js';

const INTERACTABLES = [
  { id: 'security', x: 78, y: 161, name: 'SECURITY OPERATIONS', prompt: 'ACCESS SECURITY TERMINAL' },
  { id: 'network', x: 238, y: 161, name: 'NETWORK TEAM', prompt: 'CHECK NETWORK MONITOR' },
  { id: 'support', x: 400, y: 161, name: 'IT SUPPORT', prompt: 'VISIT IT SUPPORT' },
  { id: 'incident-board', x: 324, y: 53, name: 'INCIDENT BOARD', prompt: 'READ INCIDENT BOARD' }
];

export class OfficeScene extends Phaser.Scene {
  constructor() { super('OfficeScene'); }

  init(data) {
    this.resumeData = data?.resumeData || null;
    this.assignmentComplete = Boolean(data?.resumeData?.assignmentComplete);
    this.interactionEnabled = true;
  }

  create() {
    const bg = buildOfficeBackground(this);
    this.add.image(0, 0, bg).setOrigin(0, 0).setDepth(0);
    addOfficeLabels(this);

    // NPCs are seated at their workstations. The moving character is the player.
    const npcs = [
      [72, 142, '#77538c', '#292a36', 'npc-purple'],
      [237, 142, '#568c66', '#3b2c25', 'npc-green'],
      [399, 142, '#c17a42', '#392a25', 'npc-orange']
    ];
    for (const [x, y, shirt, hair, key] of npcs) {
      buildPersonTexture(this, key, shirt, hair);
      this.add.ellipse(x, y + 6, 18, 5, 0x14202a, .45).setDepth(2);
      this.add.image(x, y, key).setOrigin(.5, .75).setDepth(3);
    }

    buildPersonTexture(this, 'zdi-player', '#3d83a5', '#242c3a', '#d8a27e');
    this.playerShadow = this.add.ellipse(240, 247, 18, 5, 0x14202a, .55).setDepth(8);
    const saved = this.resumeData;
    this.player = this.add.image(saved?.x ?? 240, saved?.y ?? 246, 'zdi-player')
      .setOrigin(.5, .8).setDepth(9);
    this.playerLogicalY = this.player.y;
    this.playerBaseY = this.player.y;

    this.targets = INTERACTABLES.map((target) => {
      const marker = this.add.rectangle(target.x, target.y, 22, 12, 0x6bcbd0, .08)
        .setStrokeStyle(1, 0x6bcbd0, .35).setDepth(4);
      const dot = this.add.circle(target.x, target.y, 2, 0xf1bc69, .7).setDepth(5);
      this.tweens.add({ targets: marker, alpha: .25, scaleX: 1.15, scaleY: 1.15, duration: 1000, yoyo: true, repeat: -1 });
      return { ...target, marker, dot };
    });

    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      up2: 'UP', down2: 'DOWN', left2: 'LEFT', right2: 'RIGHT',
      interact: 'E', escape: 'ESC'
    });
    this.nearestTarget = null;
    this.gameTime = 0;
    this.lastPromptId = '';
    this.input.keyboard.on('keydown-ESC', () => window.dispatchEvent(new Event('zdi:escape')));
    this.events.once('shutdown', () => { if (window.ZDI?.officeScene === this) window.ZDI.officeScene = null; });
    window.dispatchEvent(new CustomEvent('zdi:office-start', {
      detail: { assignmentComplete: this.assignmentComplete, day: saved?.day || 1 }
    }));
    window.ZDI = window.ZDI || {};
    window.ZDI.saveGame = () => this.saveGame();
    window.ZDI.officeScene = this;
  }

  update(_time, delta) {
    const dt = Math.min(delta / 1000, .05);
    this.gameTime += dt;
    const speed = 86;
    let dx = 0, dy = 0;
    if (this.keys.left.isDown || this.keys.left2.isDown) dx -= 1;
    if (this.keys.right.isDown || this.keys.right2.isDown) dx += 1;
    if (this.keys.up.isDown || this.keys.up2.isDown) dy -= 1;
    if (this.keys.down.isDown || this.keys.down2.isDown) dy += 1;
    if (dx && dy) { dx *= .7071; dy *= .7071; }
    this.player.x = Phaser.Math.Clamp(this.player.x + dx * speed * dt, 12, 468);
    this.playerLogicalY = Phaser.Math.Clamp(this.playerLogicalY + dy * speed * dt, 86, 258);
    if (dx < 0) this.player.setFlipX(true);
    if (dx > 0) this.player.setFlipX(false);
    this.playerBaseY = this.playerLogicalY;
    this.player.y = this.playerLogicalY + ((dx || dy) ? Math.sin(this.gameTime * 15) * .8 : 0);
    this.playerShadow.setPosition(this.player.x, this.playerBaseY + 5);
    this.player.setDepth(9 + this.player.y / 1000);

    this.nearestTarget = this.targets
      .map((target) => ({ target, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y) }))
      .filter((item) => item.distance < 33)
      .sort((a, b) => a.distance - b.distance)[0]?.target || null;

    if (this.nearestTarget) {
      this.nearestTarget.marker.setStrokeStyle(1, 0xf1bc69, .9);
      if (this.lastPromptId !== this.nearestTarget.id) {
        this.lastPromptId = this.nearestTarget.id;
        window.dispatchEvent(new CustomEvent('zdi:nearby', { detail: { label: this.nearestTarget.prompt } }));
      }
    } else {
      for (const target of this.targets) target.marker.setStrokeStyle(1, 0x6bcbd0, .35);
      if (this.lastPromptId) window.dispatchEvent(new Event('zdi:not-nearby'));
      this.lastPromptId = '';
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.nearestTarget) {
      window.dispatchEvent(new CustomEvent('zdi:interact', { detail: { id: this.nearestTarget.id, name: this.nearestTarget.name } }));
    }
  }

  completeAssignment() {
    this.assignmentComplete = true;
    window.dispatchEvent(new CustomEvent('zdi:assignment-complete'));
    this.saveGame();
  }

  saveGame() {
    const snapshot = {
      x: Math.round(this.player.x), y: Math.round(this.player.y), day: 1,
      assignmentComplete: this.assignmentComplete, savedAt: new Date().toISOString()
    };
    localStorage.setItem('zdi-js-save-v1', JSON.stringify(snapshot));
    window.dispatchEvent(new Event('zdi:saved'));
    return snapshot;
  }

  shutdown() {
    window.ZDI = window.ZDI || {};
    window.ZDI.officeScene = null;
    window.ZDI.saveGame = null;
  }
}
