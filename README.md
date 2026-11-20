# ZERO-DAY INTERN — JavaScript Starter v0.1.0

A first runnable JavaScript build based on the title-screen direction and office layout in `Zero_Day_Intern_Demo_v1_13.html`.

This starter uses **Phaser 3 + JavaScript + HTML/CSS**. The office art is drawn from code at pixel-art resolution, so it does not need external image files. The HTML demo remains a visual/game-design reference; this starter is a separate, modular implementation.

## What is included

- 16:9 title screen with the six mode tabs: The Office, Journey, Deck & Exploit, The Worm, The Purple and Achievements.
- Procedurally drawn pixel-art office with cubicles, workstations, server cabinet, city windows, plants, seated colleagues and a moving colleague in the central aisle.
- Main-menu navigation using mouse or arrow keys + Enter.
- A playable **Office** starter scene: move with WASD/arrow keys, approach workstations and press E to interact.
- One small SOC assignment: inspect a simulated authentication alert and document the suspicious sign-in pattern.
- Local save/continue using `localStorage`.
- Settings panel for local volume preference and interface scale selection.
- Clear mode-preview screens for the other five modes. Those modes are navigation/design stubs in this first build, not complete gameplay.

## Requirements

- Node.js 20 or newer recommended
- npm
- A modern desktop browser (Chrome, Firefox or Edge)

## Run locally

```bash
npm install
npm run dev
```

On Windows, you can also double-click `start-dev.bat`. On Linux/macOS, run `./start-dev.sh`.

Open the local URL printed by Vite (normally `http://localhost:5173`).

Create a production web build:

```bash
npm run build
npm run preview
```

The production site is written to `dist/`.

## Controls

### Main menu

- Mouse: select menu entries and game modes
- Up / Down: move menu selection
- Enter: activate selection

### The Office

- WASD or Arrow keys: move
- E: interact with a nearby workstation or incident board
- Escape: return to the title screen

## Project layout

```text
ZERO_DAY_INTERN_JS_Starter/
├── index.html
├── package.json
├── start-dev.bat
├── start-dev.sh
├── .gitignore
├── README.md
└── src/
    ├── main.js                 # menu routing, UI, save/load and interactions
    ├── style.css               # responsive UI and HUD
    ├── art/
    │   └── office-art.js        # pixel-art office + character textures
    └── scenes/
        ├── MenuScene.js         # animated title-screen office
        └── OfficeScene.js       # controllable office prototype
```

## Next implementation steps

1. Separate shared systems (save data, dialogue, achievements, scene transitions) into their own modules.
2. Replace procedural placeholder characters with consistent sprite sheets and proper walk/idle animations.
3. Implement the first three Journey exercises.
4. Build the Deck & Exploit card engine and local hot-seat flow.
5. Add the first playable scene for The Worm and The Purple.
6. Package Windows with Electron and Android with Capacitor after the web build stabilizes.

## Notes

- This starter intentionally keeps core gameplay local and does not require an API or AI service.
- The UI uses system font fallbacks. It does not need a remote font download.
- No multiplayer networking, production account system or cloud saves are included yet.
- Browser save data is local to the current browser profile. Clearing site data will remove it.
