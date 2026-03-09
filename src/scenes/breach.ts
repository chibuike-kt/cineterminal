import chalk from 'chalk';
import { BaseScene } from './base-scene';
import { TextStream } from '../rendering/text-stream';
import { Pane } from '../rendering/pane';
import { generateLogLine, generateSecurityEvent } from '../generators/logs';
import { generateCommandBlock, commandBlockToLines } from '../generators/commands';
import { progressBar } from '../utils/format';
import { randInt, randHex, randIPv4, pick, randFloat } from '../utils/random';

const BREACH_PHASES = [
  { label: 'INITIALIZING INTRUSION VECTOR',       color: '#444444' },
  { label: 'MAPPING ATTACK SURFACE',              color: '#666600' },
  { label: 'EXPLOITING CVE-2024-',                color: '#999900' },
  { label: 'BYPASSING FIREWALL RULESET',          color: '#cc7700' },
  { label: 'ESCALATING TO ROOT',                  color: '#ff5500' },
  { label: 'DEPLOYING PERSISTENT BACKDOOR',       color: '#ff2200' },
  { label: 'EXFILTRATING ENCRYPTED PAYLOAD',      color: '#ff0000' },
  { label: 'ERASING AUDIT LOGS',                  color: '#ff00ff' },
  { label: '>> ACCESS FULLY COMPROMISED <<',      color: '#00ff41' },
] as const;

const HEX_CHARS = '0123456789abcdef';

function randomHexLine(width: number): string {
  const addr = randInt(0x0000, 0xffff).toString(16).padStart(4, '0');
  const bytes: string[] = [];
  for (let i = 0; i < 16; i++) {
    bytes.push(randHex(1));
  }
  const ascii = Array.from({ length: 16 }, () => {
    const c = randInt(32, 126);
    return c > 32 && c < 126 ? String.fromCharCode(c) : '.';
  }).join('');
  const hex = bytes.join(' ');
  return chalk.dim(`${addr}`) + chalk.dim(':  ') +
    chalk.hex('#00cc33')(hex) + '  ' +
    chalk.dim('|') + chalk.hex('#005c16')(ascii) + chalk.dim('|');
}

function randomMatrixLine(): string {
  const len = randInt(40, 120);
  let line = '';
  for (let i = 0; i < len; i++) {
    const r = Math.random();
    if (r < 0.05) line += chalk.hex('#00ff41').bold(HEX_CHARS[randInt(0, 15)]);
    else if (r < 0.3) line += chalk.hex('#00cc33')(HEX_CHARS[randInt(0, 15)]);
    else if (r < 0.6) line += chalk.hex('#005c16')(HEX_CHARS[randInt(0, 15)]);
    else line += chalk.hex('#003310')(HEX_CHARS[randInt(0, 15)]);
  }
  return line;
}

function randomNetworkLine(): string {
  const types = [
    () => chalk.hex('#00ff41')(`[SYN]     `) + chalk.white(`${randIPv4()}:${randInt(1024,65535)}`) + chalk.dim(' ? ') + chalk.hex('#00cc33')(`${randIPv4()}:${randInt(80,9999)}`),
    () => chalk.hex('#ffcc00')(`[ACK]     `) + chalk.white(`${randIPv4()}:${randInt(1024,65535)}`) + chalk.dim(' ? ') + chalk.hex('#00cc33')(`${randIPv4()}:${randInt(80,9999)}`),
    () => chalk.hex('#ff4444')(`[RST]     `) + chalk.white(`${randIPv4()}`) + chalk.dim(' connection terminated'),
    () => chalk.hex('#00aaff')(`[DATA]    `) + chalk.dim(`seq=${randInt(1000,99999)} ack=${randInt(1000,99999)} len=${randInt(64,1500)}`),
    () => chalk.hex('#ff8800')(`[BLOCKED] `) + chalk.white(`${randIPv4()}`) + chalk.dim(` matched ruleset #${randInt(1,99)}`),
    () => chalk.hex('#cc00ff')(`[CRYPTO]  `) + chalk.dim(`handshake ${randHex(2)}:${randHex(2)} [ECDHE-RSA]`),
    () => chalk.hex('#00ff41')(`[ESTAB]   `) + chalk.white(`${randIPv4()}`) + chalk.dim(` ttl=${randInt(48,128)} win=${randInt(1024,65535)}`),
  ];
  return pick(types)();
}

export class BreachScene extends BaseScene {
  get name(): string { return 'breach'; }

  private streams: TextStream[] = [];
  private breachProgress = 0;
  private breachPhase = 0;

  mount(): void {
    const w = this.width;
    const h = this.height;
    const statusBarHeight = this.config.statusBar ? 1 : 0;
    const usableH = h - statusBarHeight;

    // -- Layout: 5 panes, zero wasted space --------------------------
    //
    //  +-- MATRIX RAIN ------- SYSTEM LOGS ------- NET TRAFFIC --+
    //  ¦                 ¦                      ¦                 ¦
    //  ¦                 ¦                      ¦                 ¦
    //  +-- HEX DUMP -----¦                      +-- SEC EVENTS ---¦
    //  ¦                 ¦                      ¦                 ¦
    //  +---------------------- BREACH STATUS ---------------------¦
    //  +-----------------------------------------------------------+

    const col1 = Math.floor(w * 0.20);
    const col2 = Math.floor(w * 0.42);
    const col3 = w - col1 - col2;

    const progressH = 5;
    const contentH = usableH - progressH;
    const topH = Math.floor(contentH * 0.58);
    const botH = contentH - topH;

    // Col 1 top: matrix rain
    const matrixPane = this.layout.createPane({
      id: 'b-matrix', label: '¦ DATA STREAM',
      top: 0, left: 0,
      width: col1, height: topH,
    });

    // Col 1 bottom: hex dump
    const hexPane = this.layout.createPane({
      id: 'b-hex', label: '¦ HEX DUMP',
      top: topH, left: 0,
      width: col1, height: botH,
    });

    // Col 2: system logs (full height)
    const logsPane = this.layout.createPane({
      id: 'b-logs', label: '? SYSLOG STREAM',
      top: 0, left: col1,
      width: col2, height: contentH,
    });

    // Col 3 top: network traffic
    const netPane = this.layout.createPane({
      id: 'b-net', label: '? PACKET TRACE',
      top: 0, left: col1 + col2,
      width: col3, height: topH,
    });

    // Col 3 bottom: security events
    const secPane = this.layout.createPane({
      id: 'b-sec', label: '? SECURITY EVENTS',
      top: topH, left: col1 + col2,
      width: col3, height: botH,
    });

    // Bottom: breach progress (full width)
    const progressPane = this.layout.createPane({
      id: 'b-progress', label: '¦ BREACH CONSOLE',
      top: contentH, left: 0,
      width: w, height: progressH,
      scrollable: false,
    });

    // -- Streams ------------------------------------------------------

    const matrixStream = new TextStream({
      id: 'b-matrix-stream', pane: matrixPane, scheduler: this.scheduler,
      source: () => randomMatrixLine(),
      intervalMs: Math.round(60 / this.speed),
      linesPerTick: 2,
    });

    const hexStream = new TextStream({
      id: 'b-hex-stream', pane: hexPane, scheduler: this.scheduler,
      source: () => randomHexLine(col1),
      intervalMs: Math.round(90 / this.speed),
    });

    const logStream = new TextStream({
      id: 'b-log-stream', pane: logsPane, scheduler: this.scheduler,
      source: generateLogLine,
      intervalMs: Math.round(70 / this.speed),
      linesPerTick: Math.ceil(this.density),
    });

    const netStream = new TextStream({
      id: 'b-net-stream', pane: netPane, scheduler: this.scheduler,
      source: () => randomNetworkLine(),
      intervalMs: Math.round(100 / this.speed),
    });

    const secStream = new TextStream({
      id: 'b-sec-stream', pane: secPane, scheduler: this.scheduler,
      source: generateSecurityEvent,
      intervalMs: Math.round(180 / this.speed),
    });

    matrixStream.start();
    hexStream.start();
    logStream.start();
    netStream.start();
    secStream.start();
    this.streams.push(matrixStream, hexStream, logStream, netStream, secStream);

    this._startShellInLog(logsPane);
    this._startProgressAnimation(progressPane);
  }

  private _startShellInLog(pane: Pane): void {
    const emitBlock = () => {
      const block = generateCommandBlock();
      const lines = commandBlockToLines(block);
      let i = 0;
      const emitLine = () => {
        if (i < lines.length) {
          pane.appendLine(lines[i++]);
          this.scheduler.after(`b-shell-line-${Date.now()}`, randInt(25, 70), emitLine);
        } else {
          this.scheduler.after('b-shell-next', randInt(600, 2000), emitBlock);
        }
      };
      emitLine();
    };
    this.scheduler.after('b-shell-start', 800, emitBlock);
  }

  private _startProgressAnimation(pane: Pane): void {
    const barWidth = this.width - 24;

    this.scheduler.every('b-progress', 100, (tick) => {
      this.breachProgress += randFloat(0.1, 0.8) * this.speed;

      if (this.breachProgress >= 100) {
        this.breachProgress = 0;
        this.breachPhase = Math.min(this.breachPhase + 1, BREACH_PHASES.length - 1);
      }

      const phase = BREACH_PHASES[this.breachPhase];
      const pct = Math.min(Math.round(this.breachProgress), 100);
      const suffix = this.breachPhase === 2 ? String(randInt(1000, 9999)) : '';
      const isLast = this.breachPhase === BREACH_PHASES.length - 1;

      // Bar with gradient effect: bright head, dimming tail
      const filled = Math.round((pct / 100) * barWidth);
      const empty = barWidth - filled;
      const bar = chalk.hex(phase.color).bold('¦'.repeat(Math.max(0, filled - 1))) +
        (filled > 0 ? chalk.hex(phase.color).bold('¦') : '') +
        chalk.hex('#111111')('¦'.repeat(empty));

      // Flicker effect on the percentage when high
      const pctStr = pct > 85 && tick % 2 === 0
        ? chalk.hex(phase.color).bold(`${String(pct).padStart(3)}%`)
        : chalk.hex(phase.color)(`${String(pct).padStart(3)}%`);

      // Stats line
      const stats = chalk.dim(`  node:${randIPv4()}  port:${randInt(1024,65535)}  pid:${randInt(1000,99999)}  enc:AES-256-GCM  packets:${randInt(100,9999)}`);

      pane.setLine(0, '');
      pane.setLine(1, '  ' + bar + '  ' + pctStr);
      pane.setLine(2, '  ' + (isLast
        ? chalk.hex(phase.color).bold(`>> ${phase.label}${suffix} <<`)
        : chalk.hex(phase.color)(`? ${phase.label}${suffix}`)));
      pane.setLine(3, stats);
    });
  }

  unmount(): void {
    this.streams.forEach(s => s.stop());
    ['b-progress','b-shell-start','b-shell-next'].forEach(id => this.scheduler.cancel(id));
    super.unmount();
  }
}
