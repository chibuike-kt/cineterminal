import { LayoutEngine } from './layout-engine';
import { Scheduler } from './scheduler';
import { CineTerminalConfig, SceneMode } from '../config/types';
import { BaseScene } from '../scenes/base-scene';
export declare class SceneManager {
    private layout;
    private scheduler;
    private config;
    private currentScene;
    private statusBar;
    constructor(layout: LayoutEngine, scheduler: Scheduler, config: CineTerminalConfig);
    loadScene(mode: SceneMode): void;
    get active(): BaseScene | null;
}
