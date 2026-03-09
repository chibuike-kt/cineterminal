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
const commands_1 = require("../generators/commands");
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
const HEX_CHARS = '0123456789abcdef';
function randomHexLine(width) {
    const addr = (0, random_1.randInt)(0x0000, 0xffff).toString(16).padStart(4, '0');
    const bytes = [];
    for (let i = 0; i < 16; i++) {
        bytes.push((0, random_1.randHex)(1));
    }
    const ascii = Array.from({ length: 16 }, () => {
        const c = (0, random_1.randInt)(32, 126);
        return c > 32 && c < 126 ? String.fromCharCode(c) : '.';
    }).join('');
    const hex = bytes.join(' ');
    return chalk_1.default.dim(`${addr}`) + chalk_1.default.dim(':  ') +
        chalk_1.default.hex('#00cc33')(hex) + '  ' +
        chalk_1.default.dim('|') + chalk_1.default.hex('#005c16')(ascii) + chalk_1.default.dim('|');
}
function randomMatrixLine() {
    const len = (0, random_1.randInt)(40, 120);
    let line = '';
    for (let i = 0; i < len; i++) {
        const r = Math.random();
        if (r < 0.05)
            line += chalk_1.default.hex('#00ff41').bold(HEX_CHARS[(0, random_1.randInt)(0, 15)]);
        else if (r < 0.3)
            line += chalk_1.default.hex('#00cc33')(HEX_CHARS[(0, random_1.randInt)(0, 15)]);
        else if (r < 0.6)
            line += chalk_1.default.hex('#005c16')(HEX_CHARS[(0, random_1.randInt)(0, 15)]);
        else
            line += chalk_1.default.hex('#003310')(HEX_CHARS[(0, random_1.randInt)(0, 15)]);
    }
    return line;
}
function randomNetworkLine() {
    const types = [
        () => chalk_1.default.hex('#00ff41')(`[SYN]     `) + chalk_1.default.white(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(1024, 65535)}`) + chalk_1.default.dim(' ? ') + chalk_1.default.hex('#00cc33')(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(80, 9999)}`),
        () => chalk_1.default.hex('#ffcc00')(`[ACK]     `) + chalk_1.default.white(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(1024, 65535)}`) + chalk_1.default.dim(' ? ') + chalk_1.default.hex('#00cc33')(`${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(80, 9999)}`),
        () => chalk_1.default.hex('#ff4444')(`[RST]     `) + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(' connection terminated'),
        () => chalk_1.default.hex('#00aaff')(`[DATA]    `) + chalk_1.default.dim(`seq=${(0, random_1.randInt)(1000, 99999)} ack=${(0, random_1.randInt)(1000, 99999)} len=${(0, random_1.randInt)(64, 1500)}`),
        () => chalk_1.default.hex('#ff8800')(`[BLOCKED] `) + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(` matched ruleset #${(0, random_1.randInt)(1, 99)}`),
        () => chalk_1.default.hex('#cc00ff')(`[CRYPTO]  `) + chalk_1.default.dim(`handshake ${(0, random_1.randHex)(2)}:${(0, random_1.randHex)(2)} [ECDHE-RSA]`),
        () => chalk_1.default.hex('#00ff41')(`[ESTAB]   `) + chalk_1.default.white(`${(0, random_1.randIPv4)()}`) + chalk_1.default.dim(` ttl=${(0, random_1.randInt)(48, 128)} win=${(0, random_1.randInt)(1024, 65535)}`),
    ];
    return (0, random_1.pick)(types)();
}
class BreachScene extends base_scene_1.BaseScene {
    constructor() {
        super(...arguments);
        this.streams = [];
        this.breachProgress = 0;
        this.breachPhase = 0;
    }
    get name() { return 'breach'; }
    mount() {
        const w = this.width;
        const h = this.height;
        const statusBarHeight = this.config.statusBar ? 1 : 0;
        const usableH = h - statusBarHeight;
        // -- Layout: 5 panes, zero wasted space --------------------------
        //
        //  +-- MATRIX RAIN ------- SYSTEM LOGS ------- NET TRAFFIC --+
        //  �                 �                      �                 �
        //  �                 �                      �                 �
        //  +-- HEX DUMP -----�                      +-- SEC EVENTS ---�
        //  �                 �                      �                 �
        //  +---------------------- BREACH STATUS ---------------------�
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
            id: 'b-matrix', label: '� DATA STREAM',
            top: 0, left: 0,
            width: col1, height: topH,
        });
        // Col 1 bottom: hex dump
        const hexPane = this.layout.createPane({
            id: 'b-hex', label: '� HEX DUMP',
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
            id: 'b-progress', label: '� BREACH CONSOLE',
            top: contentH, left: 0,
            width: w, height: progressH,
            scrollable: false,
        });
        // -- Streams ------------------------------------------------------
        const matrixStream = new text_stream_1.TextStream({
            id: 'b-matrix-stream', pane: matrixPane, scheduler: this.scheduler,
            source: () => randomMatrixLine(),
            intervalMs: Math.round(60 / this.speed),
            linesPerTick: 2,
        });
        const hexStream = new text_stream_1.TextStream({
            id: 'b-hex-stream', pane: hexPane, scheduler: this.scheduler,
            source: () => randomHexLine(col1),
            intervalMs: Math.round(90 / this.speed),
        });
        const logStream = new text_stream_1.TextStream({
            id: 'b-log-stream', pane: logsPane, scheduler: this.scheduler,
            source: logs_1.generateLogLine,
            intervalMs: Math.round(70 / this.speed),
            linesPerTick: Math.ceil(this.density),
        });
        const netStream = new text_stream_1.TextStream({
            id: 'b-net-stream', pane: netPane, scheduler: this.scheduler,
            source: () => randomNetworkLine(),
            intervalMs: Math.round(100 / this.speed),
        });
        const secStream = new text_stream_1.TextStream({
            id: 'b-sec-stream', pane: secPane, scheduler: this.scheduler,
            source: logs_1.generateSecurityEvent,
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
    _startShellInLog(pane) {
        const emitBlock = () => {
            const block = (0, commands_1.generateCommandBlock)();
            const lines = (0, commands_1.commandBlockToLines)(block);
            let i = 0;
            const emitLine = () => {
                if (i < lines.length) {
                    pane.appendLine(lines[i++]);
                    this.scheduler.after(`b-shell-line-${Date.now()}`, (0, random_1.randInt)(25, 70), emitLine);
                }
                else {
                    this.scheduler.after('b-shell-next', (0, random_1.randInt)(600, 2000), emitBlock);
                }
            };
            emitLine();
        };
        this.scheduler.after('b-shell-start', 800, emitBlock);
    }
    _startProgressAnimation(pane) {
        const barWidth = this.width - 24;
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
            // Bar with gradient effect: bright head, dimming tail
            const filled = Math.round((pct / 100) * barWidth);
            const empty = barWidth - filled;
            const bar = chalk_1.default.hex(phase.color).bold('�'.repeat(Math.max(0, filled - 1))) +
                (filled > 0 ? chalk_1.default.hex(phase.color).bold('�') : '') +
                chalk_1.default.hex('#111111')('�'.repeat(empty));
            // Flicker effect on the percentage when high
            const pctStr = pct > 85 && tick % 2 === 0
                ? chalk_1.default.hex(phase.color).bold(`${String(pct).padStart(3)}%`)
                : chalk_1.default.hex(phase.color)(`${String(pct).padStart(3)}%`);
            // Stats line
            const stats = chalk_1.default.dim(`  node:${(0, random_1.randIPv4)()}  port:${(0, random_1.randInt)(1024, 65535)}  pid:${(0, random_1.randInt)(1000, 99999)}  enc:AES-256-GCM  packets:${(0, random_1.randInt)(100, 9999)}`);
            pane.setLine(0, '');
            pane.setLine(1, '  ' + bar + '  ' + pctStr);
            pane.setLine(2, '  ' + (isLast
                ? chalk_1.default.hex(phase.color).bold(`>> ${phase.label}${suffix} <<`)
                : chalk_1.default.hex(phase.color)(`? ${phase.label}${suffix}`)));
            pane.setLine(3, stats);
        });
    }
    unmount() {
        this.streams.forEach(s => s.stop());
        ['b-progress', 'b-shell-start', 'b-shell-next'].forEach(id => this.scheduler.cancel(id));
        super.unmount();
    }
}
exports.BreachScene = BreachScene;
//# sourceMappingURL=breach.js.map