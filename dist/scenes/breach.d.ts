import { BaseScene } from './base-scene';
export declare class BreachScene extends BaseScene {
    get name(): string;
    private streams;
    private breachProgress;
    private breachPhase;
    private globeState;
    mount(): void;
    private _buildLayout;
    private _startGlobeAnimation;
    private _triggerLockOn;
    private _startLockSequence;
    private _renderGlobeFrame;
    private _startProgressAnimation;
    unmount(): void;
}
