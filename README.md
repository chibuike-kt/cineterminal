# CineTerminal

**A cinematic terminal experience engine for developers, demos, and creative presentations.**

CineTerminal turns your terminal into a movie-style hacking console — rotating ASCII globe with satellite lock-on, live code execution streams, packet traces, security event feeds, and a dramatic breach progress console. All animated, all configurable, all running in your terminal.

```
npx cineterminal --mode breach --theme matrix
```

---

## What it looks like

```
┌─ EXECUTING PAYLOAD ──┬──────── SATELLITE UPLINK ────────┬─ SYSLOG STREAM ──────┐
│ async def establish  │                                  │ 14:23:01 INFO  nginx │
│   ctx = ssl.create   │        ░░▒▒▓▓██████▓▓▒▒░░        │ 14:23:01 WARN  sshd  │
│   reader, writer =   │      ▒▒████████████████████▒▒    │ 14:23:02 ERROR authd │
│   return writer      │    ░░██▓▓  ░░░░░░░░░░  ▓▓██░░   │ 14:23:02 INFO  cron  │
│                      │    ▒▒██░░  ──────+──── ░░██▒▒   │ 14:23:02 CRIT  audit │
│ func (t *Tunnel)     │    ░░██▓▓  ░░░░░░░░░░  ▓▓██░░   │                      │
│   t.mu.Lock()        │      ▒▒████████████████████▒▒    │ root@bastion-01:~$   │
│   defer t.mu.Unlock  │        ░░▒▒▓▓██████▓▓▒▒░░        │   ps aux             │
│                      │                                  │   1823 pts/0  bash   │
├─ SECURITY ALERTS ────┤  ◆ LOCKED  48.23°N  16.37°E  ◆  ├─ SATELLITE STATUS ───┤
│ █ ALERT  Port scan.. │                                  │ ● ONLINE  SAT-7A     │
│ ▶ PROBE  SSH brute.. ├──────── COORDINATE FEED ─────────┤ ◎ HANDSHK RELAY-03  │
│ ✓ AUTH   Token ok    │ MOSCOW       55.7512°  37.6134°  │ ○ OFFLINE NEXUS-1   │
│ ✗ DENIED Rate limit  │ BEIJING      39.9023°  116.412°  │ ◈ UPLINK  GHOST-9   │
├──────────────────────┴──────────────────────────────────┴──────────────────────┤
│ ████████████████████████████████░░░░░░░░░░░░░░░░░░  64%                        │
│ ▶ BYPASSING FIREWALL RULESET                                                    │
│   node:192.168.1.1  port:44231  pid:18823  enc:AES-256-GCM  packets:4821       │
└────────────────────────────────────────────────────────────────────────────────┘
 ⠙ 14:23:02  ◆ BREACH    CPU:67%  PROC:312  SIG:▄▅▆▇  LAT:43.2ms
```

---

## Installation

**Requirements:** Node.js v18+, npm v8+

```bash
# Clone the repo
git clone https://github.com/yourname/cineterminal
cd cineterminal

# Install dependencies
npm install

# Build
npm run build

# Run
node dist/cli.js
```

### Windows (PowerShell)

If you see a script execution error:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then run normally with `npm install` and `npm run build`.

### Run without building (dev mode)

```bash
npm run dev
```

---

## Usage

```bash
node dist/cli.js [options]
```

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `-m, --mode` | `breach` | `breach` | Scene to run |
| `-t, --theme` | `matrix` `ghost` `redteam` `iceberg` `gold` | `matrix` | Color theme |
| `-s, --speed` | `0.1` – `3.0` | `1.0` | Animation speed multiplier |
| `-d, --density` | `0.1` – `3.0` | `1.0` | Line density multiplier |
| `--no-status-bar` | — | — | Hide the bottom status bar |

**Press `q` or `Ctrl+C` to exit.**

### Examples

```bash
# Default matrix breach
node dist/cli.js

# Red team theme, faster
node dist/cli.js --theme redteam --speed 1.5

# Ghost theme, maximum density
node dist/cli.js --theme ghost --density 2.5

# Slow and dramatic for presentations
node dist/cli.js --speed 0.6 --theme gold

# Clean — no status bar
node dist/cli.js --no-status-bar
```

---

## Themes

| Theme | Primary | Feel |
|-------|---------|------|
| `matrix` | Green | Classic hacker — The Matrix |
| `redteam` | Red | Offensive ops — aggressive |
| `ghost` | Blue/Cyan | Stealth — clean and cold |
| `iceberg` | Soft blue | Dark IDE — VS Code nights |
| `gold` | Gold | High value — elite ops |

---

## Best terminal settings

CineTerminal is designed for **fullscreen terminals**. For the best experience:

- **Windows Terminal** — press `Alt+Enter` for fullscreen
- **macOS Terminal / iTerm2** — press `Cmd+Enter` for fullscreen
- **Font size** — 12–14pt monospace (Cascadia Code, JetBrains Mono, Fira Code)
- **Minimum size** — 180×50. Optimal: 220×60 or larger
- **Background** — pure black (#000000)

If your terminal is too small, the globe will not render correctly.

---

## How it works

CineTerminal is built in layers that are completely separate from each other:

```
CLI entrypoint (cli.ts)
    └── Scene Manager          loads and transitions scenes
         └── Scheduler         single animation tick loop — everything registers here
              ├── Layout Engine blessed screen + pane registry
              ├── Scenes        mount/unmount panes and register tasks
              ├── Renderers     pane, text-stream, status-bar
              └── Generators    logs, commands, code, globe, network — pure functions
```

**Scenes** are self-contained modules that set up panes and register timed tasks. They don't know about each other.

**Generators** are pure functions — no timing, no side effects. They just return strings. This makes them easy to test and swap out for real data sources later.

**The Scheduler** owns all timing. Nothing calls `setTimeout` directly. This means speed control works globally with a single multiplier.

---

## Project structure

```
src/
├── cli.ts                   # Entrypoint
├── config/
│   └── types.ts             # All config types and defaults
├── core/
│   ├── scheduler.ts         # Animation tick engine
│   ├── layout-engine.ts     # Blessed screen + pane factory
│   └── scene-manager.ts     # Scene lifecycle
├── rendering/
│   ├── pane.ts              # Blessed box abstraction
│   ├── text-stream.ts       # Drip lines into a pane
│   └── status-bar.ts        # Bottom status strip
├── generators/
│   ├── logs.ts              # Fake syslog + security events
│   ├── commands.ts          # Fake shell sessions
│   ├── code.ts              # Real-looking code streams
│   └── globe.ts             # ASCII globe renderer + coord/sat feeds
├── scenes/
│   ├── base-scene.ts        # Abstract scene class
│   └── breach.ts            # Breach scene
└── themes/
    └── index.ts             # 5 built-in themes
```

---

## Building your own scene

Create `src/scenes/my-scene.ts`:

```typescript
import { BaseScene } from './base-scene';
import { TextStream } from '../rendering/text-stream';

export class MyScene extends BaseScene {
  get name(): string { return 'my-scene'; }

  mount(): void {
    const pane = this.layout.createPane({
      id: 'my-pane',
      label: '◈ MY PANE',
      top: 0, left: 0,
      width: this.width,
      height: this.height - 1,
    });

    const stream = new TextStream({
      id: 'my-stream',
      pane,
      scheduler: this.scheduler,
      source: () => `Hello from tick ${Date.now()}`,
      intervalMs: 100,
    });

    stream.start();
  }

  unmount(): void {
    this.scheduler.cancel('my-stream');
    super.unmount();
  }
}
```

Then register it in `src/core/scene-manager.ts`:

```typescript
import { MyScene } from '../scenes/my-scene';

const SCENE_REGISTRY = {
  // ...existing scenes
  'my-scene': MyScene,
};
```

Run it with:

```bash
node dist/cli.js --mode my-scene
```

---

## Roadmap

- `satellite` scene — orbital tracking, ground station uplinks
- `trace` scene — IP hop animation, node graph, packet handshake
- `code-storm` scene — multi-column code rain across the full screen
- `ops-center` scene — composite dashboard combining all widgets
- Config file support (`cineterminal.config.json`)
- Scene transitions with wipe/flash effects
- `npx cineterminal` support for zero-install usage
- Plugin system for custom scene packages

---

## License

MIT — do whatever you want with it.

---

*Built for developers who want their terminal to look like it belongs in a movie.*
