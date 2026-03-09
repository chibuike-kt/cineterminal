"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLogLine = generateLogLine;
exports.generateBootLine = generateBootLine;
exports.generateSecurityEvent = generateSecurityEvent;
const chalk_1 = __importDefault(require("chalk"));
const random_1 = require("../utils/random");
const format_1 = require("../utils/format");
const SERVICES = [
    'kernel', 'sshd', 'auditd', 'systemd', 'nginx', 'firewalld',
    'cron', 'dockerd', 'containerd', 'kubelet', 'etcd', 'vault',
    'netfilter', 'iptables', 'securityd', 'authd', 'cryptsetup',
];
const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'CRIT', 'NOTICE'];
const LEVEL_WEIGHTS = [40, 20, 10, 15, 3, 12];
const MESSAGES = {
    INFO: [
        'Connection established from {ip}:{port}',
        'Process {pid} spawned by uid={uid}',
        'Auth token refreshed for session {hex}',
        'Healthcheck passed [{service}] latency={lat}ms',
        'Packet captured on interface eth{n}: {bytes} bytes',
        'TLS handshake complete [{cipher}]',
        'Route added: {ip}/24 via {gw} dev eth0',
        'Module {mod} loaded successfully',
        'Sync complete: {n} records transferred',
        'Heartbeat OK from node {ip}',
    ],
    WARN: [
        'Retry {n}/5: connection timeout [{ip}]',
        'High memory usage: {pct}% on pid {pid}',
        'Rate limit approaching: {n}/1000 req/min',
        'Certificate expires in {n} days [{service}]',
        'Unexpected close from {ip}:{port}',
        'Slow query detected [{lat}ms]: {service}',
        'Disk usage at {pct}% on /dev/sda{n}',
    ],
    ERROR: [
        'Failed to authenticate: {ip} [invalid credentials]',
        'Connection refused: {ip}:{port}',
        'Segfault in process {pid} [core dumped]',
        'Cannot allocate memory: {service} oom-killed',
        'TLS handshake failed [{ip}]: certificate verify error',
        'Read error on socket {hex}: reset by peer',
        'Service {service} exited with code {n}',
    ],
    DEBUG: [
        'syscall read({fd}) = {bytes}',
        'BPF probe hit: pid={pid} comm={service}',
        'Cache miss [{hex}]: loading from disk',
        'Mutex contention on thread {pid} [waited {lat}ms]',
        'Stack trace captured for event {hex}',
        'Hook fired: {service}:{n}',
    ],
    CRIT: [
        'INTRUSION DETECTED: {ip} matched rule SID:{n}',
        'Privilege escalation attempt by uid={uid}',
        'Kernel panic - not syncing: VFS: Unable to mount root fs',
        'BREACH ALERT: unauthorized write to /etc/passwd',
        'Multiple failed logins from {ip} [blocked]',
    ],
    NOTICE: [
        'User {uid} logged in from {ip}',
        'Config reload triggered for {service}',
        'Scheduled task started: {service}',
        'Interface eth{n} link up',
        'Service {service} restarted',
    ],
};
const CIPHERS = ['AES-256-GCM', 'CHACHA20-POLY1305', 'AES-128-GCM', 'ECDHE-RSA-AES256'];
const MODULES = ['nf_conntrack', 'overlay', 'br_netfilter', 'ip_tables', 'xfs', 'ext4'];
function fillTemplate(template) {
    return template
        .replace('{ip}', (0, random_1.randIPv4)())
        .replace('{gw}', (0, random_1.randIPv4)())
        .replace('{port}', String((0, random_1.randInt)(1024, 65535)))
        .replace('{pid}', String((0, random_1.randInt)(1000, 99999)))
        .replace('{uid}', String((0, random_1.randInt)(0, 9999)))
        .replace('{hex}', (0, random_1.randHex)(4))
        .replace('{lat}', (0, random_1.randFloat)(0.5, 850).toFixed(1))
        .replace('{bytes}', String((0, random_1.randInt)(64, 65535)))
        .replace('{pct}', String((0, random_1.randInt)(60, 99)))
        .replace('{n}', String((0, random_1.randInt)(1, 512)))
        .replace('{fd}', String((0, random_1.randInt)(3, 256)))
        .replace('{service}', (0, random_1.pick)(SERVICES))
        .replace('{cipher}', (0, random_1.pick)(CIPHERS))
        .replace('{mod}', (0, random_1.pick)(MODULES));
}
function colorLevel(level) {
    switch (level) {
        case 'INFO': return chalk_1.default.cyan(level.padEnd(6));
        case 'WARN': return chalk_1.default.yellow(level.padEnd(6));
        case 'ERROR': return chalk_1.default.red(level.padEnd(6));
        case 'DEBUG': return chalk_1.default.gray(level.padEnd(6));
        case 'CRIT': return chalk_1.default.bgRed.white(level.padEnd(6));
        case 'NOTICE': return chalk_1.default.green(level.padEnd(6));
    }
}
function generateLogLine() {
    const level = (0, random_1.pick)(LOG_LEVELS.filter((_l, i) => (0, random_1.chance)(LEVEL_WEIGHTS[i] / 100))) ?? 'INFO';
    const service = (0, random_1.pick)(SERVICES);
    const messages = MESSAGES[level];
    const message = fillTemplate((0, random_1.pick)(messages));
    const timestamp = chalk_1.default.dim((0, format_1.formatTimeMs)());
    const svc = chalk_1.default.dim(`[${service.padEnd(12)}]`);
    return `${timestamp} ${colorLevel(level)} ${svc} ${message}`;
}
function generateBootLine() {
    const lines = [
        `[  ${(0, random_1.randFloat)(0, 9).toFixed(6)}] ${(0, random_1.pick)(MODULES)}: module loaded`,
        `[  ${(0, random_1.randFloat)(0, 9).toFixed(6)}] ACPI: ${(0, random_1.pick)(['IRQ', 'PCI', 'BIOS', 'EC'])} resource allocation complete`,
        `[  ${(0, random_1.randFloat)(0, 9).toFixed(6)}] NET: Registered PF_PACKET protocol family`,
        `[  ${(0, random_1.randFloat)(0, 9).toFixed(6)}] ${(0, random_1.randHex)(4)}:${(0, random_1.randHex)(4)} phy0: hw init completed`,
        `[  ${(0, random_1.randFloat)(0, 9).toFixed(6)}] audit: type=2000 audit(${Date.now()}.${(0, random_1.randInt)(100, 999)}:${(0, random_1.randInt)(1, 999)}): initialized`,
    ];
    return chalk_1.default.green((0, random_1.pick)(lines));
}
function generateSecurityEvent() {
    const events = [
        () => `${chalk_1.default.red('�')} ALERT   Port scan detected from ${(0, random_1.randIPv4)()} [${(0, random_1.randInt)(100, 9999)} ports/s]`,
        () => `${chalk_1.default.yellow('?')} PROBE   ${(0, random_1.randIPv4)()} attempted ${(0, random_1.pick)(['SSH', 'FTP', 'RDP', 'SMB', 'Telnet'])} bruteforce`,
        () => `${chalk_1.default.red('!')} BLOCK   Packet dropped: SRC=${(0, random_1.randIPv4)()} RULE=DROP_CHAIN_${(0, random_1.randInt)(1, 99)}`,
        () => `${chalk_1.default.cyan('~')} TRACE   Suspicious payload in stream ${(0, random_1.randHex)(3)} [${(0, random_1.randInt)(1, 48)} bytes encrypted]`,
        () => `${chalk_1.default.magenta('?')} CRYPTO  Key exchange initiated with ${(0, random_1.randIPv4)()} [${(0, random_1.pick)(CIPHERS)}]`,
        () => `${chalk_1.default.green('?')} AUTH    Token ${(0, random_1.randHex)(8)} validated [uid=${(0, random_1.randInt)(1000, 9999)}]`,
        () => `${chalk_1.default.red('?')} DENIED  Access revoked: ${(0, random_1.randIPv4)()} exceeded rate limit`,
        () => `${chalk_1.default.yellow('?')} SPOOF   ARP conflict detected: ${(0, random_1.randIPv4)()} multiple MACs`,
    ];
    return (0, format_1.formatTimeMs)() + '  ' + (0, random_1.pick)(events)();
}
//# sourceMappingURL=logs.js.map