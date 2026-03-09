import { BaseScene } from './base-scene';
export declare class BreachScene extends BaseScene {
    get name(): string;
    private streams;
    private breachProgress;
    private breachPhase;
    mount(): void;
    private _startShellInLog;
    private _startProgressAnimation;
    unmount(): void;
}
