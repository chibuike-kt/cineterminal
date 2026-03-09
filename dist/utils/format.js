"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibleLength = visibleLength;
exports.truncate = truncate;
exports.padLeft = padLeft;
exports.padRight = padRight;
exports.center = center;
exports.formatTime = formatTime;
exports.formatTimeMs = formatTimeMs;
exports.formatBytes = formatBytes;
exports.repeat = repeat;
exports.progressBar = progressBar;
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;
function visibleLength(str) {
    return str.replace(ANSI_REGEX, '').length;
}
function truncate(str, max, ellipsis = '�') {
    const visible = str.replace(ANSI_REGEX, '');
    if (visible.length <= max)
        return str;
    return visible.slice(0, max - ellipsis.length) + ellipsis;
}
function padLeft(str, width, char = ' ') {
    const len = visibleLength(str);
    return len >= width ? str : char.repeat(width - len) + str;
}
function padRight(str, width, char = ' ') {
    const len = visibleLength(str);
    return len >= width ? str : str + char.repeat(width - len);
}
function center(str, width, char = ' ') {
    const len = visibleLength(str);
    if (len >= width)
        return str;
    const total = width - len;
    const left = Math.floor(total / 2);
    const right = total - left;
    return char.repeat(left) + str + char.repeat(right);
}
function formatTime(date = new Date()) {
    return [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0'),
    ].join(':');
}
function formatTimeMs(date = new Date()) {
    return formatTime(date) + '.' + String(date.getMilliseconds()).padStart(3, '0');
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes}B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}
function repeat(char, n) {
    return n > 0 ? char.repeat(n) : '';
}
function progressBar(percent, width, filled = '�', empty = '�') {
    const filledCount = Math.round((percent / 100) * width);
    const emptyCount = width - filledCount;
    return filled.repeat(filledCount) + empty.repeat(emptyCount);
}
//# sourceMappingURL=format.js.map