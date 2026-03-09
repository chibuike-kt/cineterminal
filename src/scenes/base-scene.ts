import { LayoutEngine } from '../core/layout-engine';
import { Scheduler } from '../core/scheduler';
import { CineTerminalConfig } from '../config/types';
import { getTheme } from '../themes';

export abstract class BaseScene {
  protected layout: LayoutEngine;
  protected scheduler: Scheduler;
  protected config: CineTerminalConfig;
  protected theme: ReturnType<typeof getTheme>;

  constructor(layout: LayoutEngine, scheduler: Scheduler, config: CineTerminalConfig) {
    this.layout = layout;
    this.scheduler = scheduler;
    this.config = config;
    this.theme = getTheme(config.theme);
  }

  abstract get name(): string;
  abstract mount(): void;

  unmount(): void {
    this.layout.destroyAllPanes();
  }

  protected get width(): number { return this.layout.width; }
  protected get height(): number { return this.layout.height; }

  protected get speed(): number {
    const sceneConfig = this.config.scenes.find(s => s.mode === this.name);
    return (sceneConfig?.speed ?? 1.0) * this.config.speed;
  }

  protected get density(): number { return this.config.density; }
}
