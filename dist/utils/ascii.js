"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPINNER_FRAMES = exports.BOX = void 0;
exports.hRule = hRule;
exports.sectionHeader = sectionHeader;
exports.spinnerFrame = spinnerFrame;
exports.signalBars = signalBars;
exports.BOX = {
    topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
    horizontal: '-', vertical: '�', tLeft: '+', tRight: '�',
    tTop: '-', tBottom: '-', cross: '+',
    dTopLeft: '+', dTopRight: '+', dBottomLeft: '+', dBottomRight: '+',
    dHorizontal: '-', dVertical: '�',
    bHorizontal: '?', bVertical: '?',
    dot: '�', bullet: '�', arrow: '�', arrowLeft: '�',
    diamond: '?', circle: '?', filledCircle: '?',
    triangleRight: '?', triangleLeft: '?',
};
function hRule(width, char = exports.BOX.horizontal) {
    return char.repeat(width);
}
function sectionHeader(label, width) {
    const inner = ` ${label} `;
    const remaining = width - inner.length - 2;
    const left = Math.floor(remaining / 2);
    const right = remaining - left;
    return exports.BOX.horizontal.repeat(left) + inner + exports.BOX.horizontal.repeat(right);
}
exports.SPINNER_FRAMES = {
    dots: ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'],
    line: ['|', '/', '-', '\\'],
    pulse: ['�', '�', '�', '�', '�', '�'],
    arrows: ['?', '?', '?', '?', '?', '?', '?', '?'],
    radar: ['?', '?', '?', '?'],
    scan: ['?', '?', '?', '�', '?', '?', '?', '�', '?', '?', '?', '�', '?', '?'],
};
function spinnerFrame(type, tick) {
    const frames = exports.SPINNER_FRAMES[type];
    return frames[tick % frames.length];
}
function signalBars(strength, max = 5) {
    const chars = ['?', '?', '?', '_', '?', '?', '?', '�'];
    const filled = Math.round((strength / max) * chars.length);
    return chars.slice(0, filled).join('') + ' '.repeat(chars.length - filled);
}
//# sourceMappingURL=ascii.js.map