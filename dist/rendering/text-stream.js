"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextStream = void 0;
class TextStream {
    constructor(opts) {
        this.arrayIndex = 0;
        this.id = opts.id;
        this.pane = opts.pane;
        this.scheduler = opts.scheduler;
        this.source = opts.source;
        this.intervalMs = opts.intervalMs ?? 120;
        this.linesPerTick = opts.linesPerTick ?? 1;
        this.prefix = opts.prefix ?? '';
        this.cycle = opts.cycle ?? true;
        this.onExhausted = opts.onExhausted;
    }
    start() {
        this.scheduler.every(this.id, this.intervalMs, () => { this._emit(); });
    }
    stop() {
        this.scheduler.cancel(this.id);
    }
    _emit() {
        const lines = this._getLines();
        for (const line of lines) {
            const pfx = typeof this.prefix === 'function' ? this.prefix() : this.prefix;
            this.pane.appendLine(pfx + line);
        }
    }
    _getLines() {
        const result = [];
        if (typeof this.source === 'function') {
            const output = this.source();
            if (Array.isArray(output)) {
                result.push(...output.slice(0, this.linesPerTick));
            }
            else {
                for (let i = 0; i < this.linesPerTick; i++) {
                    result.push(this.source());
                }
            }
        }
        else {
            for (let i = 0; i < this.linesPerTick; i++) {
                if (this.arrayIndex >= this.source.length) {
                    if (this.cycle) {
                        this.arrayIndex = 0;
                    }
                    else {
                        this.onExhausted?.();
                        this.stop();
                        return result;
                    }
                }
                result.push(this.source[this.arrayIndex++]);
            }
        }
        return result;
    }
    setInterval(ms) {
        this.intervalMs = ms;
        if (this.scheduler.has(this.id)) {
            this.stop();
            this.start();
        }
    }
    setDensity(linesPerTick) {
        this.linesPerTick = linesPerTick;
    }
}
exports.TextStream = TextStream;
//# sourceMappingURL=text-stream.js.map