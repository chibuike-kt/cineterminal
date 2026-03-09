export type TaskId = string;

export interface ScheduledTask {
  id: TaskId;
  interval: number;
  callback: (tick: number) => void;
  maxTicks: number | null;
  speedOverride?: number;
  _tick: number;
  _elapsed: number;
  _done: boolean;
}

export class Scheduler {
  private tasks: Map<TaskId, ScheduledTask> = new Map();
  private speed: number;
  private lastTime: number = 0;
  private rafHandle: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private onEmptyCallbacks: Array<() => void> = [];

  constructor(speed = 1.0, private frameMs = 50) {
    this.speed = speed;
  }

  setSpeed(speed: number): void { this.speed = speed; }

  every(
    id: TaskId,
    intervalMs: number,
    callback: (tick: number) => void,
    options: { maxTicks?: number; speedOverride?: number } = {}
  ): void {
    this.tasks.set(id, {
      id, interval: intervalMs, callback,
      maxTicks: options.maxTicks ?? null,
      speedOverride: options.speedOverride,
      _tick: 0, _elapsed: 0, _done: false,
    });
  }

  after(id: TaskId, delayMs: number, callback: () => void): void {
    this.every(id, delayMs, () => { callback(); }, { maxTicks: 1 });
  }

  cancel(id: TaskId): void { this.tasks.delete(id); }
  cancelAll(): void { this.tasks.clear(); }
  has(id: TaskId): boolean { return this.tasks.has(id); }
  onEmpty(cb: () => void): void { this.onEmptyCallbacks.push(cb); }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = Date.now();
    this._loop();
  }

  stop(): void {
    this.running = false;
    if (this.rafHandle) { clearTimeout(this.rafHandle); this.rafHandle = null; }
  }

  private _loop(): void {
    if (!this.running) return;
    const now = Date.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this._tick(delta);
    this.rafHandle = setTimeout(() => this._loop(), this.frameMs);
  }

  private _tick(deltaMs: number): void {
    let activeTasks = 0;
    for (const task of this.tasks.values()) {
      if (task._done) continue;
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
