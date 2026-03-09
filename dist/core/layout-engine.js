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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutEngine = void 0;
const blessed = __importStar(require("blessed"));
const pane_1 = require("../rendering/pane");
class LayoutEngine {
    constructor(theme, scheduler) {
        this.panes = new Map();
        this.theme = theme;
        this.screen = blessed.screen({
            smartCSR: true,
            fullUnicode: true,
            forceUnicode: true,
            title: 'CineTerminal',
            cursor: {
                artificial: true,
                shape: 'line',
                blink: true,
                color: theme.primary,
            },
        });
        scheduler.every('__render', 50, () => {
            this.screen.render();
        });
        this.screen.key(['q', 'C-c'], () => {
            if (this.onQuit)
                this.onQuit();
            else
                this.shutdown();
        });
    }
    setQuitHandler(cb) { this.onQuit = cb; }
    get width() { return this.screen.width; }
    get height() { return this.screen.height; }
    createPane(opts) {
        if (this.panes.has(opts.id)) {
            this.panes.get(opts.id).destroy();
            this.panes.delete(opts.id);
        }
        const pane = new pane_1.Pane(this.screen, { ...opts, theme: this.theme });
        this.panes.set(opts.id, pane);
        return pane;
    }
    getPane(id) { return this.panes.get(id); }
    destroyPane(id) {
        this.panes.get(id)?.destroy();
        this.panes.delete(id);
    }
    destroyAllPanes() {
        for (const pane of this.panes.values())
            pane.destroy();
        this.panes.clear();
    }
    setTheme(theme) { this.theme = theme; }
    shutdown() {
        this.screen.destroy();
        process.exit(0);
    }
}
exports.LayoutEngine = LayoutEngine;
//# sourceMappingURL=layout-engine.js.map