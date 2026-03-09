"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
const breach_1 = require("../scenes/breach");
const status_bar_1 = require("../rendering/status-bar");
const SCENE_REGISTRY = {
    'breach': breach_1.BreachScene,
    'satellite': breach_1.BreachScene,
    'trace': breach_1.BreachScene,
    'code-storm': breach_1.BreachScene,
    'ops-center': breach_1.BreachScene,
};
class SceneManager {
    constructor(layout, scheduler, config) {
        this.layout = layout;
        this.scheduler = scheduler;
        this.config = config;
        this.currentScene = null;
        this.statusBar = null;
        if (config.statusBar) {
            this.statusBar = new status_bar_1.StatusBar(layout.screen, layout.theme, scheduler);
        }
    }
    loadScene(mode) {
        if (this.currentScene) {
            this.currentScene.unmount();
            this.currentScene = null;
        }
        const SceneClass = SCENE_REGISTRY[mode];
        if (!SceneClass)
            throw new Error(`Unknown scene: ${mode}`);
        this.currentScene = new SceneClass(this.layout, this.scheduler, this.config);
        this.statusBar?.setScene(mode);
        this.currentScene.mount();
    }
    get active() { return this.currentScene; }
}
exports.SceneManager = SceneManager;
//# sourceMappingURL=scene-manager.js.map