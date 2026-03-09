#!/usr/bin/env node
import { Command } from 'commander';
import { getTheme } from './themes';
import { Scheduler } from './core/scheduler';
import { LayoutEngine } from './core/layout-engine';
import { SceneManager } from './core/scene-manager';
import { DEFAULT_CONFIG, SceneMode, ThemeName } from './config/types';

const program = new Command();

program
  .name('cineterminal')
  .description('Cinematic terminal experience engine')
  .version('0.1.0')
  .option('-m, --mode <mode>', 'Scene: breach | satellite | trace | code-storm | ops-center', 'breach')
  .option('-t, --theme <theme>', 'Theme: matrix | ghost | redteam | iceberg | gold', 'matrix')
  .option('-s, --speed <number>', 'Speed multiplier 0.1-3.0', '1.0')
  .option('-d, --density <number>', 'Density multiplier 0.1-3.0', '1.0')
  .option('--no-status-bar', 'Hide the bottom status bar')
  .parse(process.argv);

const opts = program.opts();

const config = {
  ...DEFAULT_CONFIG,
  scenes: [{ mode: opts.mode as SceneMode, duration: 0 }],
  theme: opts.theme as ThemeName,
  speed: Math.max(0.1, Math.min(3.0, parseFloat(opts.speed) || 1.0)),
  density: Math.max(0.1, Math.min(3.0, parseFloat(opts.density) || 1.0)),
  statusBar: opts.statusBar !== false,
};

const theme = getTheme(config.theme);
const scheduler = new Scheduler(config.speed);
const layout = new LayoutEngine(theme, scheduler);

layout.setQuitHandler(() => {
  scheduler.stop();
  layout.shutdown();
});

const sceneManager = new SceneManager(layout, scheduler, config);
sceneManager.loadScene(config.scenes[0].mode);

scheduler.start();
