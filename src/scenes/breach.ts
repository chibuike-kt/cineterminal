import chalk from 'chalk';
import { BaseScene } from './base-scene';
import { TextStream } from '../rendering/text-stream';
import { Pane } from '../rendering/pane';
import { generateLogLine, generateSecurityEvent } from '../generators/logs';
import { generateCodeLine } from '../generators/code';
import {
  GlobeState, createGlobeState, renderGlobe,
  generateCoordLine, generateSatLine,
} from '../generators/globe';
import { randInt, randFloat, randHex, randIPv4, pick } from '../utils/random';

const BREACH_PHASES = [
  { label: 'INITIALIZING INTRUSION VECTOR',   color: '#444444' },
  { label: 'MAPPING ATTACK SURFACE',          color: '#666600' },
  { label: 'EXPLOITING CVE-2024-',            color: '#999900' },
  { label: 'BYPASSING FIREWALL RULESET',      color: '#cc7700' },
  { label: 'ESCALATING TO ROOT',              color: '#ff5500' },
  { label: 'DEPLOYING PERSISTENT BACKDOOR',   color: '#ff2200' },
  { label: 'EXFILTRATING ENCRYPTED PAYLOAD',  color: '#ff0000' },
  { label: 'ERASING AUDIT LOGS',              color: '#ff00ff' },
  { label: '>> ACCESS FULLY COMPROMISED <<',  color: '#00ff41' },
] as const;

function randomNetworkLine(): string {
  const types = [
    () => chalk.hex('#00ff41')('[SYN]    ') + chalk.white(`${randIPv4()}:${randInt(1024,65535)}`) + chalk.dim(' ? ') + chalk.hex('#00cc33')(`${randIPv4()}:${randInt(80,9999)}`),
    () => chalk.hex('#ffcc00')('[ACK]    ') + chalk.white(`${randIPv4()}:${randInt(1024,65535)}`) + chalk.dim(' ? ') + chalk.hex('#00cc33')(`${randIPv4()}:${randInt(80,9999)}`),
    () => chalk.hex('#ff4444')('[RST]    ') + chalk.white(`${randIPv4()}`) + chalk.dim(' connection terminated'),
    () => chalk.hex('#00aaff')('[DATA]   ') + chalk.dim(`seq=${randInt(1000,99999)} ack=${randInt(1000,99999)} len=${randInt(64,1500)}`),
    () => chalk.hex('#ff8800')('[BLOCK]  ') + chalk.white(`${randIPv4()}`) + chalk.dim(` matched ruleset #${randInt(1,99)}`),
    () => chalk.hex('#cc00ff')('[CRYPTO] ') + chalk.dim(`handshake ${randHex(2)}:${randHex(2)} [ECDHE-RSA]`),
    () => chalk.hex('#00ff41')('[ESTAB]  ') + chalk.white(`${randIPv4()}`) + chalk.dim(` ttl=${randInt(48,128)} win=${randInt(1024,65535)}`),
  ];
  return pick(types)();
}

export class BreachScene extends BaseScene {
  get name(): string { return 'breach'; }

  private streams: TextStream[] = [];
  private breachProgress = 0;
  private breachPhase    = 0;
  private globeState: GlobeState = createGlobeState();

  mount(): void {
    this.scheduler.after('b-mount-delay', 200, () => this._buildLayout());
  }

  private _buildLayout(): void {
    const w       = this.width;
    const h       = this.height;
    const statusH = this.config.statusBar ? 1 : 0;
    const usableH = h - statusH;

    // -- Columns: left 20% | center 40% | right 40% ----------------
    // Give globe the dominant center, equal weight to code and logs
    const col1 = Math.floor(w * 0.20);   // code + alerts
    const col2 = Math.floor(w * 0.40);   // globe + coords  ? widest
    const col3 = w - col1 - col2;        // syslog + sat

    // -- Rows -------------------------------------------------------
    const progressH = 5;
    const contentH  = usableH - progressH;
    const topH      = Math.floor(contentH * 0.68);  // tall top row
    const botH      = contentH - topH;

    // -- Col 1 ------------------------------------------------------
    const codePane = this.layout.createPane({
      id: 'b-code', label: '? EXECUTING PAYLOAD',
      top: 0, left: 0,
      width: col1, height: topH,
    });
    const secPane = this.layout.createPane({
      id: 'b-sec', label: '? SECURITY ALERTS',
      top: topH, left: 0,
      width: col1, height: botH,
    });

    // -- Col 2 ------------------------------------------------------
    const globePane = this.layout.createPane({
      id: 'b-globe', label: '? SATELLITE UPLINK',
      top: 0, left: col1,
      width: col2, height: topH,
    });
    const coordPane = this.layout.createPane({
      id: 'b-coords', label: '? COORDINATE FEED',
      top: topH, left: col1,
      width: col2, height: botH,
    });

    // -- Col 3 ------------------------------------------------------
    const logsPane = this.layout.createPane({
      id: 'b-logs', label: '? SYSLOG STREAM',
      top: 0, left: col1 + col2,
      width: col3, height: topH,
    });
    const satPane = this.layout.createPane({
      id: 'b-sat', label: '? SATELLITE STATUS',
      top: topH, left: col1 + col2,
      width: col3, height: botH,
    });

    // -- Progress (full width) ---------------------------------------
    const progressPane = this.layout.createPane({
      id: 'b-progress', label: '¦ BREACH CONSOLE',
      top: contentH, left: 0,
      width: w, height: progressH,
      scrollable: false,
    });

    // -- Wire up streams --------------------------------------------
    const codeStream = new TextStream({
      id: 'b-code-stream', pane: codePane, scheduler: this.scheduler,
      source: generateCodeLine,
      intervalMs: Math.round(90 / this.speed),
    });
    const secStream = new TextStream({
      id: 'b-sec-stream', pane: secPane, scheduler: this.scheduler,
      source: generateSecurityEvent,
      intervalMs: Math.round(170 / this.speed),
    });
    const logStream = new TextStream({
      id: 'b-log-stream', pane: logsPane, scheduler: this.scheduler,
      source: generateLogLine,
      intervalMs: Math.round(70 / this.speed),
      linesPerTick: Math.ceil(this.density),
    });
    const coordStream = new TextStream({
      id: 'b-coord-stream', pane: coordPane, scheduler: this.scheduler,
      source: generateCoordLine,
      intervalMs: Math.round(200 / this.speed),
    });
    const satStream = new TextStream({
      id: 'b-sat-stream', pane: satPane, scheduler: this.scheduler,
      source: generateSatLine,
      intervalMs: Math.round(280 / this.speed),
    });

    codeStream.start();
    secStream.start();
    logStream.start();
    coordStream.start();
    satStream.start();
    this.streams.push(codeStream, secStream, logStream, coordStream, satStream);

    this._startGlobeAnimation(globePane, col2, topH);
    this._startProgressAnimation(progressPane);
  }

  // -- Globe ------------------------------------------------------------------

  private _startGlobeAnimation(pane: Pane, paneW: number, paneH: number): void {
    const iw = paneW - 2;
    const ih = paneH - 3;

    this.scheduler.every('b-globe-rotate', 80, (tick) => {
      this.globeState.rotation = (tick * 1.5) % 360;

      if (tick % 12 === 0) {
        this.globeState.pingPoints.push({
          lat: randFloat(-60, 60),
          lon: randFloat(-180, 180),
          age: 0,
        });
        if (this.globeState.pingPoints.length > 6) this.globeState.pingPoints.shift();
      }
      this.globeState.pingPoints.forEach(p => p.age++);

      if (tick === 150) {
        this.globeState.phase = 'locking';
        this._triggerLockOn(pane, iw, ih);
      }

      this._renderGlobeFrame(pane, iw, ih);
    });
  }

  private _triggerLockOn(pane: Pane, iw: number, ih: number): void {
    this.scheduler.cancel('b-globe-rotate');
    this.globeState.pingPoints = [];
    let flashCount = 0;
    this.scheduler.every('b-globe-flash', 100, () => {
      flashCount++;
      pane.setLabel(flashCount % 2 === 0
        ? '? SATELLITE UPLINK'
        : '? ACQUIRING TARGET LOCK...');
      if (flashCount >= 12) {
        this.scheduler.cancel('b-globe-flash');
        this._startLockSequence(pane, iw, ih);
      }
    });
  }

  private _startLockSequence(pane: Pane, iw: number, ih: number): void {
    const targetRot = -this.globeState.targetLon;
    let currentRot  = this.globeState.rotation;
    const diff      = ((targetRot - currentRot + 540) % 360) - 180;

    this.scheduler.every('b-globe-lock', 60, (tick) => {
      currentRot += diff * 0.09;
      this.globeState.rotation     = currentRot;
      this.globeState.lockProgress = Math.min(tick / 45, 1);

      if (tick >= 45) {
        this.globeState.phase        = 'locked';
        this.globeState.lockProgress = 1;
        this.scheduler.cancel('b-globe-lock');
        pane.setLabel(
          `? LOCKED  ${this.globeState.targetLat.toFixed(2)}°N  ` +
          `${this.globeState.targetLon.toFixed(2)}°E`
        );
        this.scheduler.after('b-globe-resume', 10000, () => {
          this.globeState = createGlobeState();
          this._startGlobeAnimation(pane, iw + 2, ih + 3);
        });
      }

      this._renderGlobeFrame(pane, iw, ih);
    });
  }

  private _renderGlobeFrame(pane: Pane, iw: number, ih: number): void {
    const rows = renderGlobe(this.globeState, iw, ih);
    if (this.globeState.phase === 'locking') {
      rows.push('');
      rows.push(chalk.hex('#ff4400').bold('  ? ACQUIRING TARGET LOCK...'));
    } else if (this.globeState.phase === 'locked') {
      rows.push('');
      rows.push(chalk.hex('#ff0000').bold(
        `  ? ${this.globeState.targetLat.toFixed(4)}°N  ` +
        `${this.globeState.targetLon.toFixed(4)}°E  ? LOCKED`
      ));
    }
    pane.setContent(rows.join('\n'));
  }

  // -- Progress ---------------------------------------------------------------

  private _startProgressAnimation(pane: Pane): void {
    const barWidth = this.width - 28;

    this.scheduler.every('b-progress', 100, (tick) => {
      this.breachProgress += randFloat(0.1, 0.8) * this.speed;
      if (this.breachProgress >= 100) {
        this.breachProgress = 0;
        this.breachPhase = Math.min(this.breachPhase + 1, BREACH_PHASES.length - 1);
      }

      const phase  = BREACH_PHASES[this.breachPhase];
      const pct    = Math.min(Math.round(this.breachProgress), 100);
      const suffix = this.breachPhase === 2 ? String(randInt(1000, 9999)) : '';
      const isLast = this.breachPhase === BREACH_PHASES.length - 1;

      const filled = Math.round((pct / 100) * barWidth);
      const empty  = barWidth - filled;
      const bar =
        chalk.hex(phase.color).bold('¦'.repeat(Math.max(0, filled - 1))) +
        (filled > 0 ? chalk.hex(phase.color)('¦') : '') +
        chalk.hex('#111111')('¦'.repeat(empty));

      const pctStr = pct > 85 && tick % 2 === 0
        ? chalk.hex(phase.color).bold(`${String(pct).padStart(3)}%`)
        : chalk.hex(phase.color)(`${String(pct).padStart(3)}%`);

      // Rich stats line spanning full width
      const stats = chalk.dim(
        `  node:${randIPv4()}` +
        `  port:${randInt(1024, 65535)}` +
        `  pid:${randInt(10000, 99999)}` +
        `  tid:${randInt(1000, 9999)}` +
        `  enc:AES-256-GCM` +
        `  sig:${randHex(8)}` +
        `  rx:${randInt(100, 9999)}KB` +
        `  tx:${randInt(10, 999)}KB` +
        `  packets:${randInt(1000, 99999)}` +
        `  drop:${randInt(0, 12)}`
      );

      pane.setLine(0, '');
      pane.setLine(1, '  ' + bar + '  ' + pctStr);
      pane.setLine(2, '  ' + (isLast
        ? chalk.hex(phase.color).bold(`>> ${phase.label}${suffix} <<`)
        : chalk.hex(phase.color)(`? ${phase.label}${suffix}`)));
      pane.setLine(3, stats);
    });
  }

  // -- Cleanup ----------------------------------------------------------------

  unmount(): void {
    this.streams.forEach(s => s.stop());
    [
      'b-mount-delay', 'b-progress', 'b-shell-start', 'b-shell-next',
      'b-globe-rotate', 'b-globe-flash', 'b-globe-lock', 'b-globe-resume',
    ].forEach(id => this.scheduler.cancel(id));
    super.unmount();
  }
}
