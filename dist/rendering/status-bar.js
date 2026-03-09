"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const blessed = __importStar(require("blessed"));
const chalk_1 = __importDefault(require("chalk"));
const format_1 = require("../utils/format");
const random_1 = require("../utils/random");
function spinnerFrame(tick) {
    const frames = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];
    return frames[tick % frames.length];
}
function signalBars(strength, max) {
    const chars = ['?', '?', '?', '_', '?', '?', '?', '�'];
    const filled = Math.round((strength / max) * chars.length);
    return chars.slice(0, filled).join('');
}
class StatusBar {
    constructor(screen, theme, scheduler) {
        this.sceneName = '';
        this.theme = theme;
        this.box = blessed.box({
            bottom: 0,
            left: 0,
            width: '100%',
            height: 1,
            tags: true,
            style: { fg: theme.secondary, bg: 'black' },
        });
        screen.append(this.box);
        scheduler.every('__statusBar', 250, (tick) => {
            this.render(screen.width, tick);
        });
    }
    setScene(name) {
        this.sceneName = name.toUpperCase();
    }
    render(width, tick) {
        const time = chalk_1.default.dim((0, format_1.formatTime)());
        const scene = this.sceneName
            ? chalk_1.default.hex(this.theme.primary)(` ? ${this.sceneName} `)
            : '';
        const latency = `${(0, random_1.randFloat)(0.5, 200).toFixed(1)}ms`;
        const signal = signalBars((0, random_1.randInt)(3, 8), 8);
        const procs = (0, random_1.randInt)(80, 512);
        const cpu = (0, random_1.randInt)(10, 95);
        const spinner = spinnerFrame(tick);
        const left = ` ${spinner} ${time}${scene}`;
        const right = `CPU:${cpu}%  PROC:${procs}  SIG:${signal}  LAT:${latency} `;
        const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
        const leftLen = stripAnsi(left).length;
        const rightLen = stripAnsi(right).length;
        const mid = ' '.repeat(Math.max(0, width - leftLen - rightLen));
        this.box.setContent(chalk_1.default.dim(left) + chalk_1.default.dim(mid) + chalk_1.default.hex(this.theme.secondary)(right));
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=status-bar.js.map