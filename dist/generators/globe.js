"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobeState = createGlobeState;
exports.renderGlobe = renderGlobe;
exports.generateCoordLine = generateCoordLine;
exports.generateSatLine = generateSatLine;
const chalk_1 = __importDefault(require("chalk"));
const random_1 = require("../utils/random");
const LAND_ZONES = [
    [25, 72, -168, -52],
    [-56, 15, -82, -34],
    [34, 72, -12, 45],
    [-36, 38, -20, 55],
    [1, 78, 26, 150],
    [-45, -10, 110, 158],
    [59, 84, -58, -12],
    [60, 72, 18, 180],
];
function isLand(lat, lon) {
    for (const [minLat, maxLat, minLon, maxLon] of LAND_ZONES) {
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon)
            return true;
    }
    return false;
}
function createGlobeState() {
    return {
        rotation: 0,
        targetLat: (0, random_1.randFloat)(-40, 55),
        targetLon: (0, random_1.randFloat)(-120, 120),
        lockProgress: 0,
        phase: 'rotating',
        pingPoints: [],
    };
}
function renderGlobe(state, width, height) {
    if (width < 20 || height < 10) {
        return Array(Math.max(1, height)).fill('  [ GLOBE TOO SMALL ]');
    }
    // Terminal chars are ~2x taller than wide.
    // Use full width but compress vertical radius to compensate.
    const radius = Math.floor(Math.min(width / 2, height) * 0.92);
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    // We only iterate within the bounding box of the sphere
    const rows = [];
    for (let row = 0; row < height; row++) {
        let line = '';
        for (let col = 0; col < width; col++) {
            // Normalize to [-1, 1] � account for char aspect ratio (chars ~2x taller)
            const dx = (col - cx) / radius;
            const dy = (row - cy) / (radius * 0.47); // compress Y to fix aspect ratio
            const dist2 = dx * dx + dy * dy;
            if (dist2 > 1.0) {
                // Outside sphere � render space or subtle star field
                if (Math.random() < 0.004)
                    line += chalk_1.default.hex('#111111')('.');
                else
                    line += ' ';
                continue;
            }
            // We are inside the sphere � compute 3D surface point
            const dz = Math.sqrt(Math.max(0, 1.0 - dist2));
            // Convert to lat/lon
            const lat = Math.asin(Math.max(-1, Math.min(1, -dy))) * (180 / Math.PI);
            const lonRaw = Math.atan2(dx, dz) * (180 / Math.PI);
            const lon = ((lonRaw + state.rotation) % 360 + 540) % 360 - 180;
            // Lighting: simple diffuse from top-left
            const lightX = -0.6;
            const lightY = -0.4;
            const lightZ = 0.7;
            const len = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
            const nx = dx, ny = dy * 0.47, nz = dz;
            const diffuse = Math.max(0, (nx * lightX + ny * lightY + nz * lightZ) / len);
            // Distance from target
            const distToTarget = Math.sqrt(Math.pow(lat - state.targetLat, 2) +
                Math.pow(lon - state.targetLon, 2));
            // Ping points
            const nearPing = state.pingPoints.find(p => Math.sqrt(Math.pow(lat - p.lat, 2) + Math.pow(lon - p.lon, 2)) < 10);
            // Crosshair lines during lock
            const spread = 20 * (1 - state.lockProgress) + 3;
            const onCrossH = state.phase !== 'rotating' && Math.abs(lat - state.targetLat) < 1.8 && Math.abs(lon - state.targetLon) < spread;
            const onCrossV = state.phase !== 'rotating' && Math.abs(lon - state.targetLon) < 3 && Math.abs(lat - state.targetLat) < spread;
            const onTarget = distToTarget < 3;
            const isLocked = state.phase === 'locked' && distToTarget < 2.5;
            const edgeGlow = dist2 > 0.88;
            if (isLocked) {
                line += chalk_1.default.hex('#ff0000').bold('?');
            }
            else if (onCrossH && onCrossV) {
                line += chalk_1.default.hex('#ff6600').bold('+');
            }
            else if (onCrossH && onTarget) {
                line += chalk_1.default.hex('#ff4400')('-');
            }
            else if (onCrossV && onTarget) {
                line += chalk_1.default.hex('#ff4400')('�');
            }
            else if (onCrossH) {
                line += chalk_1.default.hex('#662200')('-');
            }
            else if (onCrossV) {
                line += chalk_1.default.hex('#662200')('�');
            }
            else if (nearPing) {
                line += nearPing.age < 5
                    ? chalk_1.default.hex('#00ff41').bold('?')
                    : chalk_1.default.hex('#007722')('?');
            }
            else if (edgeGlow) {
                // Limb of the sphere � bright edge
                line += chalk_1.default.hex('#004422').bold('�');
            }
            else if (isLand(lat, lon)) {
                // Land with diffuse shading
                if (diffuse > 0.75)
                    line += chalk_1.default.hex('#00aa44').bold('�');
                else if (diffuse > 0.55)
                    line += chalk_1.default.hex('#007733')('�');
                else if (diffuse > 0.35)
                    line += chalk_1.default.hex('#005522')('�');
                else
                    line += chalk_1.default.hex('#002211')('�');
            }
            else {
                // Ocean with grid lines and shading
                const gridLat = Math.abs(lat % 30) < 2;
                const gridLon = Math.abs(lon % 30) < 3.5;
                if (gridLat && gridLon) {
                    line += chalk_1.default.hex('#003322')('+');
                }
                else if (gridLat || gridLon) {
                    line += chalk_1.default.hex('#001a11')('�');
                }
                else if (diffuse > 0.65) {
                    line += chalk_1.default.hex('#001e14')('�');
                }
                else if (diffuse > 0.35) {
                    line += chalk_1.default.hex('#00120d')('�');
                }
                else {
                    line += chalk_1.default.hex('#000a07')('�');
                }
            }
        }
        rows.push(line);
    }
    return rows;
}
// -- Coordinate + satellite feed generators -----------------------------------
const CITIES = [
    { name: 'MOSCOW', lat: 55.75, lon: 37.61 },
    { name: 'BEIJING', lat: 39.90, lon: 116.40 },
    { name: 'LONDON', lat: 51.50, lon: -0.12 },
    { name: 'NEW YORK', lat: 40.71, lon: -74.00 },
    { name: 'DUBAI', lat: 25.20, lon: 55.27 },
    { name: 'SAO PAULO', lat: -23.55, lon: -46.63 },
    { name: 'TOKYO', lat: 35.68, lon: 139.69 },
    { name: 'SYDNEY', lat: -33.86, lon: 151.20 },
    { name: 'SINGAPORE', lat: 1.35, lon: 103.82 },
    { name: 'BERLIN', lat: 52.52, lon: 13.40 },
    { name: 'TORONTO', lat: 43.65, lon: -79.38 },
    { name: 'CAPE TOWN', lat: -33.92, lon: 18.42 },
    { name: 'TEHRAN', lat: 35.69, lon: 51.39 },
    { name: 'PYONGYANG', lat: 39.03, lon: 125.75 },
];
function generateCoordLine() {
    const city = (0, random_1.pick)(CITIES);
    const lat = (city.lat + (0, random_1.randFloat)(-0.5, 0.5)).toFixed(4);
    const lon = (city.lon + (0, random_1.randFloat)(-0.5, 0.5)).toFixed(4);
    const alt = (0, random_1.randInt)(200, 35000);
    const sig = (0, random_1.randInt)(60, 99);
    const status = (0, random_1.pick)([
        chalk_1.default.hex('#00ff41')('ACQUIRED'),
        chalk_1.default.hex('#ffcc00')('SCANNING'),
        chalk_1.default.hex('#ff4444')('BLOCKED '),
        chalk_1.default.hex('#00aaff')('RELAYING'),
    ]);
    return (chalk_1.default.hex('#00cc44')(`${city.name.padEnd(12)} `) +
        chalk_1.default.dim(`${lat}�  ${lon}�  `) +
        chalk_1.default.hex('#005522')(`ALT:${String(alt).padStart(5)}m `) +
        chalk_1.default.dim(`SIG:${sig}% `) +
        status);
}
function generateSatLine() {
    const sats = [
        'SAT-7A', 'RELAY-03', 'NEXUS-1', 'GHOST-9',
        'PHANTOM', 'UPLINK-4', 'DARKSTAR', 'ORACLE-6',
    ];
    const sat = (0, random_1.pick)(sats);
    const el = (0, random_1.randInt)(5, 90);
    const az = (0, random_1.randInt)(0, 359);
    const snr = (0, random_1.randFloat)(12, 45).toFixed(1);
    const status = (0, random_1.pick)([
        chalk_1.default.hex('#00ff41').bold('? ONLINE '),
        chalk_1.default.hex('#ffcc00')('? HANDSHK'),
        chalk_1.default.hex('#ff4444')('? OFFLINE'),
        chalk_1.default.hex('#00aaff')('? UPLINK '),
    ]);
    return (status + '  ' +
        chalk_1.default.hex('#00cc33')(sat.padEnd(10)) +
        chalk_1.default.dim(`EL:${String(el).padStart(2)}�  AZ:${String(az).padStart(3)}�  `) +
        chalk_1.default.hex('#004422')(`SNR:${snr}dB`));
}
//# sourceMappingURL=globe.js.map