"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScene = void 0;
const themes_1 = require("../themes");
class BaseScene {
    constructor(layout, scheduler, config) {
        this.layout = layout;
        this.scheduler = scheduler;
        this.config = config;
        this.theme = (0, themes_1.getTheme)(config.theme);
    }
    unmount() {
        this.layout.destroyAllPanes();
    }
    get width() { return this.layout.width; }
    get height() { return this.layout.height; }
    get speed() {
        const sceneConfig = this.config.scenes.find(s => s.mode === this.name);
        return (sceneConfig?.speed ?? 1.0) * this.config.speed;
    }
    get density() { return this.config.density; }
}
exports.BaseScene = BaseScene;
//# sourceMappingURL=base-scene.js.map