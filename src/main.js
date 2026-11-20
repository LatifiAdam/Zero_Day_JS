import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';

const MODE_CONFIG = {
  main: {
    title: 'THE OFFICE', accent: '#f1bc69',
    description: 'Your first day at WhiteTeam Security starts now.',
    items: [['NEW GAME', 'new'], ['CONTINUE', 'continue'], ['OPTIONS', 'options'], ['QUIT', 'quit']]
  },
  journey: {
    title: 'JOURNEY', accent: '#54cbd8',
    description: 'A guided learning range: investigate, attack, defend and understand.',
    items: [['START LEARNING', 'journey'], ['EXERCISE LIBRARY', 'journey-library'], ['OPTIONS', 'options'], ['BACK TO OFFICE', 'back']]
  },
  deck: {
    title: 'DECK & EXPLOIT', accent: '#ee7b7e',
    description: 'Build an attack or defense deck and outthink your opponent.',
    items: [['SINGLE PLAYER', 'deck'], ['LOCAL 2V2', 'deck-2v2'], ['DECK BUILDER', 'deck-builder'], ['BACK TO OFFICE', 'back']]
  },
  worm: {
    title: 'THE WORM', accent: '#83d89c',
    description: 'A historical incident investigation inspired by the 1988 Morris Worm.',
    items: [['NEW STORY', 'worm'], ['STORY ARCHIVE', 'worm-archive'], ['OPTIONS', 'options'], ['BACK TO OFFICE', 'back']]
  },
  purple: {
    title: 'THE PURPLE', accent: '#bd91ef',
    description: 'Design infrastructure, test assumptions and explore adversarial trade-offs.',
    items: [['NEW PROJECT', 'purple'], ['LAB BUILDER', 'purple-builder'], ['OPTIONS', 'options'], ['BACK TO OFFICE', 'back']]
  },
  achievements: {
    title: 'ACHIEVEMENTS', accent: '#dfbd76',
    description: 'A record of the work completed across your cybersecurity career.',
    items: [['VIEW TRACK RECORD', 'achievements'], ['BACK TO OFFICE', 'back']]
  }
};

const $ = (selector) => document.querySelector(selector);
const ui = {
  menu: $('#menu-ui'), game: $('#game-ui'), modal: $('#modal-layer'),
  menuList: $('#main-menu'), dock: $('#mode-dock'), toast: $('#toast'),
  objectiveTitle: $('#objective-title'), objectiveStatus: $('#objective-status'),
  objectiveBar: $('#objective-progress-bar'), interactionHint: $('#interaction-hint'),
  interactionLabel: $('#interaction-label')
};

let activeMode = 'main';
let menuCursor = 0;
let modalOpen = false;
let toastTimer = null;
let assignmentComplete = false;
let game;

const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 480,
  height: 270,
  backgroundColor: '#101e2a',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [MenuScene, OfficeScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 270
  },
  render: { powerPreference: 'high-performance', clearBeforeRender: true }
};

game = new Phaser.Game(phaserConfig);
window.ZDI = window.ZDI || {};
window.ZDI.game = game;

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 2600);
}

function setModal({ kicker = 'SYSTEM MESSAGE', title = '', copy = '', content = '', actions = [] }) {
  $('#modal-kicker').textContent = kicker;
  $('#modal-title').textContent = title;
  $('#modal-copy').textContent = copy;
  $('#modal-content').innerHTML = content;
  const actionBox = $('#modal-actions');
  actionBox.innerHTML = '';
  actions.forEach((action, index) => {
    const button = document.createElement('button');
    button.className = `modal-action${action.primary ? ' primary' : ''}`;
    button.textContent = action.label;
    button.addEventListener('click', () => action.onClick?.());
    actionBox.appendChild(button);
  });
  ui.modal.classList.remove('hidden');
  modalOpen = true;
}

function closeModal() {
  ui.modal.classList.add('hidden');
  modalOpen = false;
}

$('#modal-close').addEventListener('click', closeModal);
ui.modal.addEventListener('click', (event) => {
  if (event.target === ui.modal) closeModal();
});

function loadSave() {
  try {
    const raw = localStorage.getItem('zdi-js-save-v1');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Could not read local save:', error);
    return null;
  }
}

function renderMenu() {
  const mode = MODE_CONFIG[activeMode];
  document.documentElement.style.setProperty('--accent', mode.accent);
  document.documentElement.style.setProperty('--accent-soft', `${mode.accent}22`);
  $('#mode-description').textContent = mode.description;
  $('#mode-description').style.maxWidth = activeMode === 'main' ? '330px' : '390px';
  ui.dock.querySelectorAll('[data-mode]').forEach((button) => {
    const selected = button.dataset.mode === activeMode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  ui.menuList.innerHTML = '';
  menuCursor = Math.min(menuCursor, mode.items.length - 1);
  mode.items.forEach(([label, action], index) => {
    const button = document.createElement('button');
    button.className = `menu-action${index === menuCursor ? ' active' : ''}`;
    button.innerHTML = `<span class="menu-index">0${index + 1}</span><span class="menu-label"></span><span class="menu-arrow">›</span>`;
    button.querySelector('.menu-label').textContent = label;
    button.addEventListener('mouseenter', () => setMenuCursor(index));
    button.addEventListener('click', () => runMenuAction(action));
    ui.menuList.appendChild(button);
  });
}

function setMenuCursor(index) {
  const max = MODE_CONFIG[activeMode].items.length - 1;
  menuCursor = Phaser.Math.Clamp(index, 0, max);
  ui.menuList.querySelectorAll('.menu-action').forEach((button, i) => {
    button.classList.toggle('active', i === menuCursor);
  });
}

function chooseMode(mode) {
  if (!MODE_CONFIG[mode] || !ui.game.classList.contains('hidden')) return;
  activeMode = mode;
  menuCursor = 0;
  renderMenu();
}

ui.dock.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => chooseMode(button.dataset.mode));
});

function startOffice(resumeData = null) {
  closeModal();
  ui.menu.classList.add('hidden');
  ui.game.classList.remove('hidden');
  ui.interactionHint.classList.add('hidden');
  assignmentComplete = Boolean(resumeData?.assignmentComplete);
  updateAssignmentUI();
  $('#day-label').textContent = `DAY ${String(resumeData?.day || 1).padStart(2, '0')}`;
  game.scene.start('OfficeScene', { resumeData });
}

function returnToMenu() {
  const scene = game.scene.getScene('OfficeScene');
  if (scene?.scene?.isActive()) scene.saveGame();
  closeModal();
  ui.interactionHint.classList.add('hidden');
  ui.game.classList.add('hidden');
  ui.menu.classList.remove('hidden');
  activeMode = 'main';
  menuCursor = 0;
  renderMenu();
  game.scene.start('MenuScene');
}

function updateAssignmentUI() {
  if (assignmentComplete) {
    ui.objectiveTitle.textContent = 'Authentication alert triaged';
    ui.objectiveStatus.textContent = 'Good work. The suspicious login pattern has been documented.';
    ui.objectiveBar.style.width = '100%';
  } else {
    ui.objectiveTitle.textContent = 'Review the authentication alert';
    ui.objectiveStatus.textContent = 'Find the Security Operations terminal and inspect the failed sign-ins.';
    ui.objectiveBar.style.width = '18%';
  }
}

function runMenuAction(action) {
  switch (action) {
    case 'new':
      setModal({
        kicker: 'NEW CAREER · WHITETEAM SECURITY',
        title: 'Your first shift.',
        copy: 'You have joined the security operations team as a junior analyst. A suspicious authentication alert is waiting at your workstation.',
        actions: [
          { label: 'START SHIFT', primary: true, onClick: () => startOffice(null) },
          { label: 'NOT YET', onClick: closeModal }
        ]
      });
      break;
    case 'continue': {
      const save = loadSave();
      if (!save) { toast('NO LOCAL CAREER SAVE FOUND'); break; }
      startOffice(save);
      break;
    }
    case 'options': openOptions(); break;
    case 'quit':
      setModal({ kicker: 'END SESSION', title: 'Close the game window?', copy: 'Browser security may block an automatic close. You can safely close this tab or window after saving your progress.', actions: [{ label: 'SAVE & CLOSE', primary: true, onClick: () => { const scene = game.scene.getScene('OfficeScene'); if (scene?.scene?.isActive()) scene.saveGame(); toast('PROGRESS SAVED · YOU CAN CLOSE THIS WINDOW'); closeModal(); } }, { label: 'CANCEL', onClick: closeModal }] });
      break;
    case 'journey': case 'journey-library': case 'deck': case 'deck-2v2': case 'deck-builder':
    case 'worm': case 'worm-archive': case 'purple': case 'purple-builder':
      showModePreview(action);
      break;
    case 'achievements': showAchievements(); break;
    case 'back': chooseMode('main'); break;
  }
}

function showModePreview(action) {
  const previews = {
    journey: ['JOURNEY · LEARNING RANGE', 'A guided lab path will introduce reconnaissance, exploitation, detection and response. The final mode will teach both Red Team and Blue Team perspectives.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    'journey-library': ['EXERCISE LIBRARY', 'The exercise browser will group practical scenarios by difficulty, tool and security objective.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    deck: ['DECK & EXPLOIT · SINGLE PLAYER', 'A turn-based Red vs Blue card game with attack chains, defensive responses and an opponent powered by local game logic.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    'deck-2v2': ['DECK & EXPLOIT · LOCAL 2V2', 'A shared table for two local teams. Hot-seat play is planned before network multiplayer.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    'deck-builder': ['DECK BUILDER', 'Review cards, build an attack or defense deck and inspect card effects before a match.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    worm: ['THE WORM', 'An investigation-driven historical story inspired by the 1988 Morris Worm, told through locations, evidence and dialogue.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    'worm-archive': ['STORY ARCHIVE', 'Recovered evidence, discovered locations and completed investigation chapters will be collected here.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    purple: ['THE PURPLE', 'A post-career infrastructure and adversarial-testing sandbox focused on system design and security validation.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER'],
    'purple-builder': ['LAB BUILDER', 'Assemble networks, endpoints and defensive controls before running controlled adversary simulations.', 'PLANNED MODE · NOT PLAYABLE IN THIS STARTER']
  };
  const [title, copy, status] = previews[action];
  setModal({ kicker: status, title, copy, actions: [{ label: 'BACK TO MENU', primary: true, onClick: closeModal }] });
}

function showAchievements() {
  setModal({
    kicker: 'CAREER RECORD', title: 'First steps.',
    copy: assignmentComplete ? 'FIRST RESPONSE — You investigated and documented your first suspicious authentication pattern.' : 'Your career record is empty for now. Complete the first office assignment to earn your first achievement.',
    actions: [{ label: 'CLOSE', primary: true, onClick: closeModal }]
  });
}

function openOptions() {
  const savedVolume = Number(localStorage.getItem('zdi-js-volume') ?? 80);
  const savedScale = localStorage.getItem('zdi-js-ui-scale') ?? 'normal';
  setModal({
    kicker: 'PREFERENCES', title: 'Options', copy: 'Local prototype settings are stored on this device.',
    content: `<label class="option-row"><span>Master volume</span><input id="master-volume" type="range" min="0" max="100" value="${savedVolume}"><b id="master-volume-value">${savedVolume}%</b></label><label class="option-row"><span>Interface scale</span><select id="ui-scale" style="background:#102638;color:#e6f0f2;border:1px solid #5e839666;padding:5px"><option value="normal" ${savedScale === 'normal' ? 'selected' : ''}>Normal</option><option value="large" ${savedScale === 'large' ? 'selected' : ''}>Large</option></select></label>`,
    actions: [
      { label: 'APPLY', primary: true, onClick: () => {
        const volume = $('#master-volume')?.value ?? 80;
        const scale = $('#ui-scale')?.value ?? 'normal';
        localStorage.setItem('zdi-js-volume', String(volume));
        localStorage.setItem('zdi-js-ui-scale', scale);
        document.documentElement.style.setProperty('--ui-scale', scale === 'large' ? '1.08' : '1');
        toast('OPTIONS SAVED'); closeModal();
      } },
      { label: 'CANCEL', onClick: closeModal }
    ]
  });
  $('#master-volume').addEventListener('input', (event) => { $('#master-volume-value').textContent = `${event.target.value}%`; });
}

function showInteraction(id) {
  const content = {
    security: {
      kicker: 'SECURITY OPERATIONS · WORKSTATION 02', title: 'Authentication anomaly',
      copy: 'The SIEM has flagged a burst of failed sign-ins followed by one successful login from an unfamiliar workstation.',
      details: '<div class="log-panel"><div><i>02:14:03</i> AUTH_FAIL <b>m.salem</b> · 10.20.1.42</div><div><i>02:14:08</i> AUTH_FAIL <b>m.salem</b> · 10.20.1.42</div><div><i>02:14:13</i> AUTH_FAIL <b>m.salem</b> · 10.20.1.42</div><div class="alert-line"><i>02:14:19</i> AUTH_OK <b>m.salem</b> · 10.20.1.77</div></div><p class="analysis-note">Analyst note: repeated failures from one host followed by a success from a different host may indicate credential guessing or credential reuse. Verify the account owner and source device before containment.</p>',
      actions: assignmentComplete
        ? [{ label: 'CLOSE TERMINAL', primary: true, onClick: closeModal }]
        : [{ label: 'DOCUMENT PATTERN', primary: true, onClick: () => { assignmentComplete = true; game.scene.getScene('OfficeScene').completeAssignment(); updateAssignmentUI(); closeModal(); toast('ASSIGNMENT COMPLETE · FIRST RESPONSE UNLOCKED'); } }, { label: 'KEEP INVESTIGATING', onClick: closeModal }]
    },
    network: {
      kicker: 'NETWORK TEAM · MONITOR 04', title: 'Unusual outbound traffic',
      copy: 'A workstation is making repeated DNS requests to a domain not present in the approved software inventory.',
      details: '<div class="log-panel"><div><i>DNS</i> update-check.example · 38 queries / min</div><div><i>HOST</i> WS-044 · VLAN 20</div><div><i>POLICY</i> Review required · no block applied</div></div><p class="analysis-note">This monitor is a contextual lead. Correlate endpoint telemetry and DNS history before making a blocking change.</p>',
      actions: [{ label: 'ACKNOWLEDGE', primary: true, onClick: () => { closeModal(); toast('NETWORK NOTE ACKNOWLEDGED'); } }]
    },
    support: {
      kicker: 'IT SUPPORT · TICKET 105', title: 'A workstation is acting strangely',
      copy: 'A colleague reports that their browser keeps opening unfamiliar tabs after installing an unofficial PDF utility.',
      details: '<div class="log-panel"><div><i>USER</i> L. Haddad · Finance</div><div><i>DEVICE</i> WS-019 · Windows workstation</div><div><i>STATUS</i> Waiting for triage</div></div><p class="analysis-note">Preserve evidence and avoid deleting files before the endpoint has been assessed.</p>',
      actions: [{ label: 'MARK FOR TRIAGE', primary: true, onClick: () => { closeModal(); toast('TICKET ADDED TO YOUR NOTES'); } }]
    },
    'incident-board': {
      kicker: 'TEAM BRIEFING · SHIFT 01', title: 'Morning incident queue',
      copy: assignmentComplete ? 'The authentication anomaly has been documented. The team lead has added a note to verify the unfamiliar workstation in the next shift.' : 'Priority 2: investigate the unusual authentication pattern reported by the monitoring team. Start with the Security Operations terminal.',
      details: '<div class="board-task"><span class="task-priority">P2</span><div><b>Repeated authentication failures</b><small>Owner: Junior Analyst · Status: '+(assignmentComplete ? 'DOCUMENTED' : 'OPEN')+'</small></div></div>',
      actions: [{ label: 'UNDERSTOOD', primary: true, onClick: closeModal }]
    }
  }[id];
  if (!content) return;
  setModal({ kicker: content.kicker, title: content.title, copy: content.copy, content: content.details, actions: content.actions });
}

function onOfficeStart(event) {
  assignmentComplete = Boolean(event.detail.assignmentComplete);
  updateAssignmentUI();
  $('#day-label').textContent = `DAY ${String(event.detail.day || 1).padStart(2, '0')}`;
}

window.addEventListener('zdi:office-start', onOfficeStart);
window.addEventListener('zdi:nearby', (event) => {
  ui.interactionHint.classList.remove('hidden');
  ui.interactionLabel.textContent = event.detail.label;
});
window.addEventListener('zdi:not-nearby', () => ui.interactionHint.classList.add('hidden'));
window.addEventListener('zdi:interact', (event) => showInteraction(event.detail.id));
window.addEventListener('zdi:assignment-complete', () => { assignmentComplete = true; updateAssignmentUI(); });
window.addEventListener('zdi:saved', () => toast('CAREER SAVE UPDATED'));
window.addEventListener('zdi:escape', () => {
  if (modalOpen) { closeModal(); return; }
  if (!ui.game.classList.contains('hidden')) returnToMenu();
});

$('#save-button').addEventListener('click', () => {
  const scene = game.scene.getScene('OfficeScene');
  if (scene?.scene?.isActive()) scene.saveGame();
});
$('#back-to-menu').addEventListener('click', returnToMenu);

function selectCurrentMenuItem() {
  const item = MODE_CONFIG[activeMode].items[menuCursor];
  if (item) runMenuAction(item[1]);
}
window.addEventListener('keydown', (event) => {
  if (!ui.game.classList.contains('hidden') || modalOpen) return;
  if (event.key === 'ArrowDown') { event.preventDefault(); setMenuCursor((menuCursor + 1) % MODE_CONFIG[activeMode].items.length); }
  if (event.key === 'ArrowUp') { event.preventDefault(); setMenuCursor((menuCursor - 1 + MODE_CONFIG[activeMode].items.length) % MODE_CONFIG[activeMode].items.length); }
  if (event.key === 'Enter') { event.preventDefault(); selectCurrentMenuItem(); }
});

renderMenu();

// Simple modal-only styling for contextual evidence; kept in CSS here so the game UI remains editable.
const extraStyle = document.createElement('style');
extraStyle.textContent = `
.log-panel{margin-top:14px;padding:10px 12px;background:#04101a;border:1px solid #315064;color:#c4d7dd;font:9px/1.9 'IBM Plex Mono',monospace;overflow-wrap:anywhere}.log-panel i{font-style:normal;color:#69cbd1;margin-right:8px}.log-panel b{color:#f0c47c;font-weight:600}.log-panel .alert-line{color:#f4c0a7}.analysis-note{font-size:9px!important;color:#91aebd!important;margin-top:10px!important}.board-task{display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px;background:#0b1c29;border:1px solid #344f5c}.task-priority{padding:5px 7px;background:#4a3432;color:#ffc58a;font-size:9px}.board-task b,.board-task small{display:block}.board-task b{color:#e7f0f1;font-size:10px}.board-task small{margin-top:4px;color:#8ea8b4;font-size:8px}
`;
document.head.appendChild(extraStyle);
