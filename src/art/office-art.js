const W = 480;
const H = 270;
const C = (hex) => Number.parseInt(hex.replace('#', ''), 16);

function block(g, x, y, w, h, color, alpha = 1) {
  g.fillStyle(C(color), alpha);
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function outline(g, x, y, w, h, color, line = 1, alpha = 1) {
  g.lineStyle(line, C(color), alpha);
  g.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
}
function line(g, x1, y1, x2, y2, color, width = 1, alpha = 1) {
  g.lineStyle(width, C(color), alpha);
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
}

function drawWindow(g, x, y, w, h, seed = 0) {
  block(g, x, y, w, h, '#172c3b');
  outline(g, x, y, w, h, '#627b86', 2);
  block(g, x + 3, y + 3, w - 6, h - 6, '#233e50');
  // Night skyline silhouettes and a few lit windows.
  for (let i = 0; i < 7; i++) {
    const bx = x + 4 + i * (w - 12) / 7;
    const bh = 7 + ((i * 11 + seed * 7) % 19);
    block(g, bx, y + h - 5 - bh, Math.max(4, w / 9), bh, i % 2 ? '#172f41' : '#1a3546');
    for (let wy = y + h - 8 - bh; wy < y + h - 7; wy += 6) {
      if ((Math.floor(wy + bx) + seed) % 3 !== 0) block(g, bx + 2, wy, 2, 2, '#86a9a2', .5);
    }
  }
  block(g, x + Math.floor(w * .5) - 1, y + 3, 2, h - 6, '#81949a');
  block(g, x + 3, y + Math.floor(h * .57), w - 6, 2, '#81949a');
  // Rain glints.
  for (let i = 0; i < 7; i++) {
    const rx = x + 7 + ((i * 13 + seed * 5) % Math.max(8, w - 14));
    const ry = y + 6 + ((i * 9 + seed * 3) % Math.max(8, h - 12));
    block(g, rx, ry, 1, 5, '#a6c5c5', .22);
  }
}

function drawMonitor(g, x, y, glow = '#55c7cc') {
  block(g, x - 2, y - 2, 28, 21, '#172632');
  block(g, x, y, 24, 16, '#354957'); outline(g, x, y, 24, 16, '#71858d');
  block(g, x + 3, y + 3, 18, 10, '#102b3a');
  block(g, x + 5, y + 5, 14, 2, glow, .95);
  block(g, x + 5, y + 9, 9, 1, '#b8e5d9', .75);
  block(g, x + 10, y + 16, 4, 5, '#687d83');
  block(g, x + 6, y + 21, 12, 2, '#465b62');
}

function drawDesk(g, x, y, w, accent = '#b28a5e') {
  block(g, x + 5, y + 22, 6, 17, '#34404a');
  block(g, x + w - 11, y + 22, 6, 17, '#34404a');
  block(g, x, y + 6, w, 19, '#493c35');
  block(g, x + 2, y + 4, w - 4, 17, accent);
  block(g, x + 4, y + 5, w - 8, 3, '#e0bd8c', .8);
  block(g, x + 9, y + 24, w - 18, 2, '#1c2831', .55);
  // Keyboard and mug.
  block(g, x + w * .53, y + 13, 17, 4, '#33424a');
  block(g, x + w - 14, y + 11, 5, 6, '#d5d8cb');
  block(g, x + w - 13, y + 10, 3, 2, '#8b9b9b');
}

function drawCubicle(g, x, y, w, h, glow, wood) {
  // Low partitions frame each workstation without hiding the workers.
  block(g, x, y, w, h, '#7c8c8d');
  outline(g, x, y, w, h, '#d1d8d2');
  block(g, x + 4, y + 4, w - 8, h - 8, '#a2adab');
  block(g, x + 3, y + 3, 4, h - 6, '#5e747c');
  block(g, x + w - 7, y + 3, 4, h - 6, '#5e747c');
  drawDesk(g, x + 9, y + h - 29, w - 18, wood);
  drawMonitor(g, x + Math.floor(w / 2) - 12, y + h - 53, glow);
  block(g, x + 15, y + h - 18, 14, 2, '#273846', .75);
}

export function buildOfficeBackground(scene) {
  const key = 'zdi-office-background';
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Base wall and polished blue-grey floor.
  block(g, 0, 0, W, H, '#101e2a');
  block(g, 0, 0, W, 76, '#253846');
  block(g, 0, 69, W, 10, '#596b70');
  block(g, 0, 79, W, H - 79, '#76827f');
  for (let y = 82; y < H; y += 16) {
    for (let x = 0; x < W; x += 24) {
      block(g, x, y, 23, 15, ((x / 24 + y / 16) % 2) ? '#87928b' : '#7d8984');
      outline(g, x, y, 24, 16, '#657672', 1, .45);
    }
  }
  // Rear windows, evening city and a faint cool light wash.
  drawWindow(g, 10, 8, 95, 54, 1);
  drawWindow(g, 119, 8, 95, 54, 2);
  drawWindow(g, 228, 8, 95, 54, 3);
  drawWindow(g, 337, 8, 95, 54, 4);
  block(g, 0, 65, W, 3, '#9aaca8');
  block(g, 0, 68, W, 4, '#334956');

  // Server cabinet at the far-right edge.
  block(g, 442, 5, 30, 65, '#172630'); outline(g, 442, 5, 30, 65, '#81939a', 2);
  for (let i = 0; i < 4; i++) {
    block(g, 446, 11 + i * 14, 22, 10, '#263d49');
    block(g, 449, 14 + i * 14, 12, 2, '#5bbec1', .85);
    block(g, 465, 14 + i * 14, 2, 2, i % 2 ? '#e6b96a' : '#6cdbb3');
  }
  block(g, 437, 70, 39, 4, '#314752');

  // Cubicles, desk banks and their partitions.
  drawCubicle(g, 10, 88, 139, 66, '#4fc2c8', '#9d7955');
  drawCubicle(g, 170, 88, 139, 66, '#62d0a7', '#a9825d');
  drawCubicle(g, 330, 88, 140, 66, '#69a9dc', '#9b7957');
  drawCubicle(g, 10, 177, 139, 57, '#6bbed4', '#a17b58');
  drawCubicle(g, 170, 177, 139, 57, '#d6a76b', '#a17c59');
  drawCubicle(g, 330, 177, 140, 57, '#79c49b', '#a17d5d');

  // Printer and network notice board.
  block(g, 152, 84, 13, 32, '#53646c'); outline(g, 152, 84, 13, 32, '#c3d0ca');
  block(g, 155, 88, 7, 8, '#243d4b'); block(g, 155, 101, 7, 10, '#d3ded9');
  block(g, 316, 12, 16, 51, '#624e40'); outline(g, 316, 12, 16, 51, '#d7c3a0');
  block(g, 319, 17, 10, 7, '#d8c58b'); block(g, 319, 28, 10, 4, '#9db4af'); block(g, 319, 37, 10, 11, '#9eb1bb');

  // Plant pots, leaves and a little warm light.
  const plants = [[7, 158], [155, 159], [315, 160], [472, 160], [151, 239], [315, 239]];
  for (const [x, y] of plants) {
    block(g, x + 2, y, 10, 9, '#8d634c'); block(g, x + 1, y - 4, 12, 3, '#be8a62');
    block(g, x + 5, y - 12, 4, 10, '#45845d'); block(g, x, y - 10, 7, 6, '#5e9a6b'); block(g, x + 8, y - 14, 7, 7, '#397954');
  }
  // Cable runs and floor markings.
  line(g, 150, 159, 167, 165, '#293a40', 2, .8);
  line(g, 310, 159, 326, 165, '#293a40', 2, .8);
  block(g, 0, 250, W, 2, '#324b54', .7);
  block(g, 0, 265, W, 5, '#182e3b');
  block(g, 9, 267, 72, 2, '#62c9ce');
  block(g, 88, 267, 1, 2, '#b9ced0', .65);
  block(g, 94, 267, 42, 2, '#b9ced0', .28);

  g.generateTexture(key, W, H);
  g.destroy();
  return key;
}

export function buildPersonTexture(scene, key, shirt = '#356d8b', hair = '#372b2a', skin = '#d3a07e') {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  // Shoes and legs.
  block(g, 3, 19, 5, 5, '#293542'); block(g, 11, 19, 5, 5, '#293542');
  block(g, 2, 23, 6, 2, '#111c26'); block(g, 11, 23, 6, 2, '#111c26');
  // Body, shirt collar and arms.
  block(g, 2, 10, 15, 11, shirt); outline(g, 2, 10, 15, 11, '#1b2a35');
  block(g, 0, 12, 3, 8, shirt); block(g, 16, 12, 3, 8, shirt);
  block(g, 7, 10, 4, 4, '#d8ded9');
  // Head and hair.
  block(g, 4, 2, 11, 10, skin); block(g, 3, 1, 13, 4, hair);
  block(g, 2, 3, 3, 7, hair); block(g, 14, 3, 3, 5, hair);
  block(g, 6, 6, 2, 2, '#17232b'); block(g, 11, 6, 2, 2, '#17232b');
  block(g, 8, 9, 3, 1, '#996957');
  // Headset and ID badge.
  block(g, 2, 5, 2, 5, '#8cabb7'); block(g, 4, 12, 2, 2, '#e5e7d3');
  g.generateTexture(key, 19, 26);
  g.destroy();
  return key;
}

export function addOfficeLabels(scene) {
  const style = { fontFamily: 'monospace', fontSize: '5px', color: '#203c48', fontStyle: 'bold' };
  const labels = [
    [18, 84, 'SECURITY OPS'], [179, 84, 'NETWORK TEAM'], [339, 84, 'IT SUPPORT'],
    [18, 173, 'FORENSICS'], [179, 173, 'ANALYST DESK'], [339, 173, 'WHITETEAM']
  ];
  for (const [x, y, text] of labels) {
    scene.add.text(x, y, text, style).setDepth(2).setAlpha(.9);
  }
}
