"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
class Scheduler {
    constructor(speed = 1.0, frameMs = 50) {
        this.frameMs = frameMs;
        this.tasks = new Map();
        this.lastTime = 0;
        this.rafHandle = null;
        this.running = false;
        this.onEmptyCallbacks = [];
        this.speed = speed;
    }
    setSpeed(speed) { this.speed = speed; }
    every(id, intervalMs, callback, options = {}) {
        this.tasks.set(id, {
            id, interval: intervalMs, callback,
            maxTicks: options.maxTicks ?? null,
            speedOverride: options.speedOverride,
            _tick: 0, _elapsed: 0, _done: false,
        });
    }
    after(id, delayMs, callback) {
        this.every(id, delayMs, () => { callback(); }, { maxTicks: 1 });
    }
    cancel(id) { this.tasks.delete(id); }
    cancelAll() { this.tasks.clear(); }
    has(id) { return this.tasks.has(id); }
    onEmpty(cb) { this.onEmptyCallbacks.push(cb); }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.lastTime = Date.now();
        this._loop();
    }
    stop() {
        this.running = false;
        if (this.rafHandle) {
            clearTimeout(this.rafHandle);
            this.rafHandle = null;
        }
    }
    _loop() {
        if (!this.running)
            return;
        const now = Date.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        this._tick(delta);
        this.rafHandle = setTimeout(() => this._loop(), this.frameMs);
    }
    _tick(deltaMs) {
        let activeTasks = 0;
        for (const task of this.tasks.values()) {
            if (task._done)
                continue;
            activeTasks++;
            const effectiveSpeed = (task.speedOverride ?? 1.0) * this.speed;
            task._elapsed += deltaMs * effectiveSpeed;
            if (task._elapsed >= task.interval) {
                task._elapsed -= task.interval;
                task._tick++;
                task.callback(task._tick);
                if (task.maxTicks !== null && task._tick >= task.maxTicks) {
                    task._done = true;
                    this.tasks.delete(task.id);
                    activeTasks--;
                }
            }
        }
        if (activeTasks === 0 && this.onEmptyCallbacks.length > 0) {
            const cbs = [...this.onEmptyCallbacks];
            this.onEmptyCallbacks = [];
            cbs.forEach(cb => cb());
        }
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map