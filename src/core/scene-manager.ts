import { LayoutEngine } from './layout-engine';
import { Scheduler } from './scheduler';
import { CineTerminalConfig, SceneMode } from '../config/types';
import { BaseScene } from '../scenes/base-scene';
import { BreachScene } from '../scenes/breach';
import { StatusBar } from '../rendering/status-bar';

type SceneConstructor = new (
  layout: LayoutEngine,
  scheduler: Scheduler,
  config: CineTerminalConfig
) => BaseScene;

const SCENE_REGISTRY: Record<SceneMode, SceneConstructor> = {
  'breach':     BreachScene,
  'satellite':  BreachScene,
  'trace':      BreachScene,
  'code-storm': BreachScene,
  'ops-center': BreachScene,
};

export class SceneManager {
  private currentScene: BaseScene | null = null;
  private statusBar: StatusBar | null = null;

  constructor(
    private layout: LayoutEngine,
    private scheduler: Scheduler,
    private config: CineTerminalConfig
  ) {
    if (config.statusBar) {
      this.statusBar = new StatusBar(layout.screen, layout.theme, scheduler);
    }
  }

  loadScene(mode: SceneMode): void {
    if (this.currentScene) {
      this.currentScene.unmount();
      this.currentScene = null;
    }
    const SceneClass = SCENE_REGISTRY[mode];
    if (!SceneClass) throw new Error(`Unknown scene: ${mode}`);
    this.currentScene = new SceneClass(this.layout, this.scheduler, this.config);
    this.statusBar?.setScene(mode);
    this.currentScene.mount();
  }

  get active(): BaseScene | null { return this.currentScene; }
}
