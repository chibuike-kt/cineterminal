"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rand = void 0;
exports.createSeededRandom = createSeededRandom;
exports.randInt = randInt;
exports.randFloat = randFloat;
exports.pick = pick;
exports.pickN = pickN;
exports.weightedPick = weightedPick;
exports.chance = chance;
exports.zeroPad = zeroPad;
exports.randHex = randHex;
exports.randIPv4 = randIPv4;
exports.randMAC = randMAC;
function createSeededRandom(seed) {
    let s = seed;
    return () => {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
exports.rand = Math.random.bind(Math);
function randInt(min, max) {
    return Math.floor((0, exports.rand)() * (max - min + 1)) + min;
}
function randFloat(min, max) {
    return (0, exports.rand)() * (max - min) + min;
}
function pick(arr) {
    return arr[Math.floor((0, exports.rand)() * arr.length)];
}
function pickN(arr, n) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < Math.min(n, copy.length); i++) {
        const idx = randInt(0, copy.length - 1);
        result.push(copy[idx]);
        copy.splice(idx, 1);
    }
    return result;
}
function weightedPick(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = (0, exports.rand)() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0)
            return items[i];
    }
    return items[items.length - 1];
}
function chance(p) {
    return (0, exports.rand)() < p;
}
function zeroPad(str, width) {
    return str.padStart(width, '0');
}
function randHex(bytes) {
    return Array.from({ length: bytes }, () => randInt(0, 255).toString(16).padStart(2, '0')).join('');
}
function randIPv4() {
    return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}
function randMAC() {
    return Array.from({ length: 6 }, () => randInt(0, 255).toString(16).padStart(2, '0')).join(':');
}
//# sourceMappingURL=random.js.map