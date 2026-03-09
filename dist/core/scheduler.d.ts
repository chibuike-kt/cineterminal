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
export declare class Scheduler {
    private frameMs;
    private tasks;
    private speed;
    private lastTime;
    private rafHandle;
    private running;
    private onEmptyCallbacks;
    constructor(speed?: number, frameMs?: number);
    setSpeed(speed: number): void;
    every(id: TaskId, intervalMs: number, callback: (tick: number) => void, options?: {
        maxTicks?: number;
        speedOverride?: number;
    }): void;
    after(id: TaskId, delayMs: number, callback: () => void): void;
    cancel(id: TaskId): void;
    cancelAll(): void;
    has(id: TaskId): boolean;
    onEmpty(cb: () => void): void;
    start(): void;
    stop(): void;
    private _loop;
    private _tick;
}
