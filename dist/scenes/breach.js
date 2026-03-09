"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreachScene = void 0;
const chalk_1 = __importDefault(require("chalk"));
const base_scene_1 = require("./base-scene");
const text_stream_1 = require("../rendering/text-stream");
const logs_1 = require("../generators/logs");
const code_1 = require("../generators/code");
const globe_1 = require("../generators/globe");
const random_1 = require("../utils/random");
const BREACH_PHASES = [
    { label: 'INITIALIZING INTRUSION VECTOR', color: '#444444' },
    { label: 'MAPPING ATTACK SURFACE', color: '#666600' },
    { label: 'EXPLOITING CVE-2024-', color: '#999900' },
    { label: 'BYPASSING FIREWALL RULESET', color: '#cc7700' },
    { label: 'ESCALATING TO ROOT', color: '#ff5500' },
    { label: 'DEPLOYING PERSISTENT BACKDOOR', color: '#ff2200' },
    { label: 'EXFILTRATING ENCRYPTED PAYLOAD', color: '#ff0000' },
    { label: 'ERASING AUDIT LOGS', color: '#ff00ff' },
    { label: '>> ACCESS FULLY COMPROMISED <<', color: '#00ff41' },
];
function randomNetworkLine() {
    const types = [
        () => chalk_1.default.hex('#00ff41')('[SYN]    ') + chalk_1.default.white(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(1024, 65535)}`) + chalk_1.default.dim(' ? ') + chalk_1.default.hex('#00cc33')(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(80, 9999)}`),
        () => chalk_1.default.hex('#ffcc00')('[ACK]    ') + chalk_1.default.white(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(1024, 65535)}`) + chalk_1.default.dim(' ? ') + chalk_1.default.hex('#00cc33')(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(80, 9999)}`),
        () => chalk_1.default.hex('#ff4444')('[RST]    ') + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(' connection terminated'),
        () => chalk_1.default.hex('#00aaff')('[DATA]   ') + chalk_1.default.dim(`seq=${(0, random_1.randInt)(1000, 99999)} ack=${(0, random_1.randInt)(1000, 99999)} len=${(0, random_1.randInt)(64, 1500)}`),
        () => chalk_1.default.hex('#ff8800')('[BLOCK]  ') + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(` matched ruleset #${(0, random_1.randInt)(1, 99)}`),
        () => chalk_1.default.hex('#cc00ff')('[CRYPTO] ') + chalk_1.default.dim(`handshake ${(0, random_1.randHex)(2)}:${(0, random_1.randHex)(2)} [ECDHE-RSA]`),
        () => chalk_1.default.hex('#00ff41')('[ESTAB]  ') + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(` ttl=${(0, random_1.randInt)(48, 128)} win=${(0, random_1.randInt)(1024, 65535)}`),
    ];
    return (0, random_1.pick)(types)();
}
class BreachScene extends base_scene_1.BaseScene {
    constructor() {
        super(...arguments);
        this.streams = [];
        this.breachProgress = 0;
        this.breachPhase = 0;
        this.globeState = (0, globe_1.createGlobeState)();
    }
    get name() { return 'breach'; }
    mount() {
        this.scheduler.after('b-mount-delay', 200, () => this._buildLayout());
    }
    _buildLayout() {
        const w = this.width;
        const h = this.height;
        const statusH = this.config.statusBar ? 1 : 0;
        const usableH = h - statusH;
        // -- Columns: left 20% | center 40% | right 40% ----------------
        // Give globe the dominant center, equal weight to code and logs
        const col1 = Math.floor(w * 0.20); // code + alerts
        const col2 = Math.floor(w * 0.40); // globe + coords  ? widest
        const col3 = w - col1 - col2; // syslog + sat
        // -- Rows -------------------------------------------------------
        const progressH = 5;
        const contentH = usableH - progressH;
        const topH = Math.floor(contentH * 0.68); // tall top row
        const botH = contentH - topH;
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
            id: 'b-progress', label: '� BREACH CONSOLE',
            top: contentH, left: 0,
            width: w, height: progressH,
            scrollable: false,
        });
        // -- Wire up streams --------------------------------------------
        const codeStream = new text_stream_1.TextStream({
            id: 'b-code-stream', pane: codePane, scheduler: this.scheduler,
            source: code_1.generateCodeLine,
            intervalMs: Math.round(90 / this.speed),
        });
        const secStream = new text_stream_1.TextStream({
            id: 'b-sec-stream', pane: secPane, scheduler: this.scheduler,
            source: logs_1.generateSecurityEvent,
            intervalMs: Math.round(170 / this.speed),
        });
        const logStream = new text_stream_1.TextStream({
            id: 'b-log-stream', pane: logsPane, scheduler: this.scheduler,
            source: logs_1.generateLogLine,
            intervalMs: Math.round(70 / this.speed),
            linesPerTick: Math.ceil(this.density),
        });
        const coordStream = new text_stream_1.TextStream({
            id: 'b-coord-stream', pane: coordPane, scheduler: this.scheduler,
            source: globe_1.generateCoordLine,
            intervalMs: Math.round(200 / this.speed),
        });
        const satStream = new text_stream_1.TextStream({
            id: 'b-sat-stream', pane: satPane, scheduler: this.scheduler,
            source: globe_1.generateSatLine,
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
    _startGlobeAnimation(pane, paneW, paneH) {
        const iw = paneW - 2;
        const ih = paneH - 3;
        this.scheduler.every('b-globe-rotate', 80, (tick) => {
            this.globeState.rotation = (tick * 1.5) % 360;
            if (tick % 12 === 0) {
                this.globeState.pingPoints.push({
                    lat: (0, random_1.randFloat)(-60, 60),
                    lon: (0, random_1.randFloat)(-180, 180),
                    age: 0,
                });
                if (this.globeState.pingPoints.length > 6)
                    this.globeState.pingPoints.shift();
            }
            this.globeState.pingPoints.forEach(p => p.age++);
            if (tick === 150) {
                this.globeState.phase = 'locking';
                this._triggerLockOn(pane, iw, ih);
            }
            this._renderGlobeFrame(pane, iw, ih);
        });
    }
    _triggerLockOn(pane, iw, ih) {
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
    _startLockSequence(pane, iw, ih) {
        const targetRot = -this.globeState.targetLon;
        let currentRot = this.globeState.rotation;
        const diff = ((targetRot - currentRot + 540) % 360) - 180;
        this.scheduler.every('b-globe-lock', 60, (tick) => {
            currentRot += diff * 0.09;
            this.globeState.rotation = currentRot;
            this.globeState.lockProgress = Math.min(tick / 45, 1);
            if (tick >= 45) {
                this.globeState.phase = 'locked';
                this.globeState.lockProgress = 1;
                this.scheduler.cancel('b-globe-lock');
                pane.setLabel(`? LOCKED  ${this.globeState.targetLat.toFixed(2)}�N  ` +
                    `${this.globeState.targetLon.toFixed(2)}�E`);
                this.scheduler.after('b-globe-resume', 10000, () => {
                    this.globeState = (0, globe_1.createGlobeState)();
                    this._startGlobeAnimation(pane, iw + 2, ih + 3);
                });
            }
            this._renderGlobeFrame(pane, iw, ih);
        });
    }
    _renderGlobeFrame(pane, iw, ih) {
        const rows = (0, globe_1.renderGlobe)(this.globeState, iw, ih);
        if (this.globeState.phase === 'locking') {
            rows.push('');
            rows.push(chalk_1.default.hex('#ff4400').bold('  ? ACQUIRING TARGET LOCK...'));
        }
        else if (this.globeState.phase === 'locked') {
            rows.push('');
            rows.push(chalk_1.default.hex('#ff0000').bold(`  ? ${this.globeState.targetLat.toFixed(4)}�N  ` +
                `${this.globeState.targetLon.toFixed(4)}�E  ? LOCKED`));
        }
        pane.setContent(rows.join('\n'));
    }
    // -- Progress ---------------------------------------------------------------
    _startProgressAnimation(pane) {
        const barWidth = this.width - 28;
        this.scheduler.every('b-progress', 100, (tick) => {
            this.breachProgress += (0, random_1.randFloat)(0.1, 0.8) * this.speed;
            if (this.breachProgress >= 100) {
                this.breachProgress = 0;
                this.breachPhase = Math.min(this.breachPhase + 1, BREACH_PHASES.length - 1);
            }
            const phase = BREACH_PHASES[this.breachPhase];
            const pct = Math.min(Math.round(this.breachProgress), 100);
            const suffix = this.breachPhase === 2 ? String((0, random_1.randInt)(1000, 9999)) : '';
            const isLast = this.breachPhase === BREACH_PHASES.length - 1;
            const filled = Math.round((pct / 100) * barWidth);
            const empty = barWidth - filled;
            const bar = chalk_1.default.hex(phase.color).bold('�'.repeat(Math.max(0, filled - 1))) +
                (filled > 0 ? chalk_1.default.hex(phase.color)('�') : '') +
                chalk_1.default.hex('#111111')('�'.repeat(empty));
            const pctStr = pct > 85 && tick % 2 === 0
                ? chalk_1.default.hex(phase.color).bold(`${String(pct).padStart(3)}%`)
                : chalk_1.default.hex(phase.color)(`${String(pct).padStart(3)}%`);
            // Rich stats line spanning full width
            const stats = chalk_1.default.dim(`  node:${(0, random_1.randIPv4)()}` +
                `  port:${(0, random_1.randInt)(1024, 65535)}` +
                `  pid:${(0, random_1.randInt)(10000, 99999)}` +
                `  tid:${(0, random_1.randInt)(1000, 9999)}` +
                `  enc:AES-256-GCM` +
                `  sig:${(0, random_1.randHex)(8)}` +
                `  rx:${(0, random_1.randInt)(100, 9999)}KB` +
                `  tx:${(0, random_1.randInt)(10, 999)}KB` +
                `  packets:${(0, random_1.randInt)(1000, 99999)}` +
                `  drop:${(0, random_1.randInt)(0, 12)}`);
            pane.setLine(0, '');
            pane.setLine(1, '  ' + bar + '  ' + pctStr);
            pane.setLine(2, '  ' + (isLast
                ? chalk_1.default.hex(phase.color).bold(`>> ${phase.label}${suffix} <<`)
                : chalk_1.default.hex(phase.color)(`? ${phase.label}${suffix}`)));
            pane.setLine(3, stats);
        });
    }
    // -- Cleanup ----------------------------------------------------------------
    unmount() {
        this.streams.forEach(s => s.stop());
        [
            'b-mount-delay', 'b-progress', 'b-shell-start', 'b-shell-next',
            'b-globe-rotate', 'b-globe-flash', 'b-globe-lock', 'b-globe-resume',
        ].forEach(id => this.scheduler.cancel(id));
        super.unmount();
    }
}
exports.BreachScene = BreachScene;
//# sourceMappingURL=breach.js.map