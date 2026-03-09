#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const themes_1 = require("./themes");
const scheduler_1 = require("./core/scheduler");
const layout_engine_1 = require("./core/layout-engine");
const scene_manager_1 = require("./core/scene-manager");
const types_1 = require("./config/types");
const program = new commander_1.Command();
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
    ...types_1.DEFAULT_CONFIG,
    scenes: [{ mode: opts.mode, duration: 0 }],
    theme: opts.theme,
    speed: Math.max(0.1, Math.min(3.0, parseFloat(opts.speed) || 1.0)),
    density: Math.max(0.1, Math.min(3.0, parseFloat(opts.density) || 1.0)),
    statusBar: opts.statusBar !== false,
};
const theme = (0, themes_1.getTheme)(config.theme);
const scheduler = new scheduler_1.Scheduler(config.speed);
const layout = new layout_engine_1.LayoutEngine(theme, scheduler);
layout.setQuitHandler(() => {
    scheduler.stop();
    layout.shutdown();
});
const sceneManager = new scene_manager_1.SceneManager(layout, scheduler, config);
sceneManager.loadScene(config.scenes[0].mode);
scheduler.start();
//# sourceMappingURL=cli.js.map