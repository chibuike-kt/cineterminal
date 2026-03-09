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
exports.Pane = void 0;
const blessed = __importStar(require("blessed"));
class Pane {
    constructor(screen, opts) {
        this.lines = [];
        this.id = opts.id;
        this.maxLines = opts.maxLines ?? 500;
        this.box = blessed.box({
            label: opts.label ? ` ${opts.label} ` : undefined,
            top: opts.top,
            left: opts.left,
            width: opts.width,
            height: opts.height,
            tags: true,
            scrollable: opts.scrollable ?? true,
            alwaysScroll: true,
            scrollbar: { style: { bg: opts.theme.borderColor } },
            border: opts.border !== false ? { type: 'line' } : undefined,
            style: {
                fg: opts.theme.primary,
                bg: opts.theme.bg,
                border: { fg: opts.theme.borderColor },
                label: { fg: opts.theme.secondary },
                scrollbar: { bg: opts.theme.borderColor },
            },
        });
        screen.append(this.box);
    }
    appendLine(line) {
        this.lines.push(line);
        if (this.lines.length > this.maxLines)
            this.lines.shift();
        this.box.setContent(this.lines.join('\n'));
        this.box.setScrollPerc(100);
    }
    setContent(content) {
        this.lines = content.split('\n');
        this.box.setContent(content);
    }
    setLine(index, content) {
        while (this.lines.length <= index)
            this.lines.push('');
        this.lines[index] = content;
        this.box.setContent(this.lines.join('\n'));
    }
    clear() {
        this.lines = [];
        this.box.setContent('');
    }
    setLabel(label) {
        this.box.setLabel(` ${label} `);
    }
    get innerWidth() { return this.box.width - 2; }
    get innerHeight() { return this.box.height - 2; }
    get lineCount() { return this.lines.length; }
    get raw() { return this.box; }
    destroy() { this.box.destroy(); }
}
exports.Pane = Pane;
//# sourceMappingURL=pane.js.map