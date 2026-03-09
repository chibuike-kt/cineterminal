"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommandBlock = generateCommandBlock;
exports.commandBlockToLines = commandBlockToLines;
const chalk_1 = __importDefault(require("chalk"));
const random_1 = require("../utils/random");
const format_1 = require("../utils/format");
const USERS = ['root', 'operator', 'sysadmin', 'daemon', 'deploy'];
const HOSTS = ['node-alpha', 'bastion-01', 'relay-7', 'core-nexus', 'phantom-gate'];
function fakePS() {
    const lines = [chalk_1.default.dim('  PID TTY          TIME CMD')];
    for (let i = 0; i < (0, random_1.randInt)(4, 9); i++) {
        const pid = (0, random_1.randInt)(1000, 99999);
        const time = `${(0, random_1.randInt)(0, 9)}:${String((0, random_1.randInt)(0, 59)).padStart(2, '0')}:${String((0, random_1.randInt)(0, 59)).padStart(2, '0')}`;
        const cmds = ['bash', 'python3', 'node', 'sshd', 'nginx', 'java', 'go', 'cargo', 'curl', 'kubectl'];
        lines.push(`${String(pid).padStart(5)} pts/${(0, random_1.randInt)(0, 5)}    ${time} ${(0, random_1.pick)(cmds)}`);
    }
    return lines;
}
function fakeNetstat() {
    const lines = [chalk_1.default.dim('Proto  Local Address          Foreign Address        State')];
    const states = ['ESTABLISHED', 'LISTEN', 'TIME_WAIT', 'CLOSE_WAIT'];
    for (let i = 0; i < (0, random_1.randInt)(4, 8); i++) {
        const proto = (0, random_1.chance)(0.7) ? 'tcp' : 'udp';
        const local = `${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(1024, 65535)}`;
        const foreign = `${(0, random_1.randIPv4)()}:${(0, random_1.randInt)(80, 9999)}`;
        lines.push(`${proto.padEnd(6)} ${local.padEnd(22)} ${foreign.padEnd(22)} ${chalk_1.default.cyan((0, random_1.pick)(states))}`);
    }
    return lines;
}
function fakeSSHConnect() {
    const ip = (0, random_1.randIPv4)();
    return [
        `Warning: Permanently added '${ip}' (ECDSA) to the list of known hosts.`,
        `${chalk_1.default.green('Authenticated')} to ${ip} ([${ip}]:22).`,
        `Last login: ${new Date().toUTCString()} from ${(0, random_1.randIPv4)()}`,
        chalk_1.default.dim(`fingerprint: SHA256:${(0, random_1.randHex)(16)}`),
    ];
}
function fakeLs() {
    const entries = [
        chalk_1.default.blue('bin/'), chalk_1.default.blue('etc/'), chalk_1.default.blue('home/'), chalk_1.default.blue('lib/'),
        chalk_1.default.blue('opt/'), chalk_1.default.blue('proc/'), chalk_1.default.blue('root/'), chalk_1.default.blue('tmp/'),
        'config.yml', 'deploy.sh', 'Makefile', 'README.md',
        chalk_1.default.green('run.sh'), chalk_1.default.green('bootstrap.sh'),
    ];
    const rows = [];
    let row = '';
    for (const entry of entries) {
        if (row.length > 50) {
            rows.push(row);
            row = '';
        }
        row += entry.padEnd(14);
    }
    if (row)
        rows.push(row);
    return rows;
}
function fakePing() {
    const ip = (0, random_1.randIPv4)();
    const lines = [`PING ${ip} (${ip}) 56(84) bytes of data.`];
    for (let i = 0; i < (0, random_1.randInt)(3, 6); i++) {
        lines.push(`64 bytes from ${ip}: icmp_seq=${i + 1} ttl=${(0, random_1.randInt)(50, 128)} time=${(0, random_1.randFloat)(0.8, 120).toFixed(3)} ms`);
    }
    return lines;
}
function fakeDf() {
    return [
        chalk_1.default.dim('Filesystem              Size  Used Avail Use% Mounted on'),
        `/dev/sda1              ${(0, format_1.formatBytes)((0, random_1.randInt)(50, 500) * 1e9).padEnd(5)} ${(0, format_1.formatBytes)((0, random_1.randInt)(10, 400) * 1e9).padEnd(5)} ${(0, format_1.formatBytes)((0, random_1.randInt)(1, 100) * 1e9).padEnd(5)}  ${(0, random_1.randInt)(20, 95)}% /`,
        `tmpfs                  ${(0, format_1.formatBytes)((0, random_1.randInt)(1, 32) * 1e9).padEnd(5)} ${(0, format_1.formatBytes)((0, random_1.randInt)(1, 500) * 1e6).padEnd(5)} ${(0, format_1.formatBytes)((0, random_1.randInt)(1, 32) * 1e9).padEnd(5)}   ${(0, random_1.randInt)(1, 15)}% /tmp`,
    ];
}
function fakeCurl() {
    const ip = (0, random_1.randIPv4)();
    return [
        chalk_1.default.dim(`> GET / HTTP/1.1`),
        chalk_1.default.dim(`> Host: ${ip}`),
        chalk_1.default.dim(`> User-Agent: cineterminal/0.1`),
        chalk_1.default.dim(`>`),
        chalk_1.default.cyan(`< HTTP/1.1 ${(0, random_1.pick)(['200 OK', '201 Created', '304 Not Modified', '401 Unauthorized'])}`),
        chalk_1.default.cyan(`< Content-Type: application/json`),
        chalk_1.default.cyan(`< X-Request-ID: ${(0, random_1.randHex)(8)}`),
        `{ "status": "ok", "node": "${(0, random_1.pick)(HOSTS)}", "ts": ${Date.now()} }`,
    ];
}
const COMMANDS = [
    { cmd: 'ps aux', output: fakePS },
    { cmd: 'netstat -an', output: fakeNetstat },
    { cmd: `ssh root@${(0, random_1.randIPv4)()}`, output: fakeSSHConnect },
    { cmd: 'ls -la /srv', output: fakeLs },
    { cmd: `ping -c ${(0, random_1.randInt)(3, 6)} ${(0, random_1.randIPv4)()}`, output: fakePing },
    { cmd: 'df -h', output: fakeDf },
    { cmd: `curl -v http://${(0, random_1.randIPv4)()}/api/status`, output: fakeCurl },
    { cmd: `nmap -sV ${(0, random_1.randIPv4)()}`, output: () => [
            `Starting Nmap scan on ${(0, random_1.randIPv4)()}`,
            `PORT     STATE  SERVICE  VERSION`,
            `22/tcp   open   ssh      OpenSSH ${(0, random_1.randInt)(7, 9)}.${(0, random_1.randInt)(0, 9)}`,
            `80/tcp   open   http     nginx 1.${(0, random_1.randInt)(20, 25)}`,
            `443/tcp  open   https    nginx`,
            `Nmap done: 1 IP address scanned`,
        ] },
];
function generateCommandBlock() {
    const user = (0, random_1.pick)(USERS);
    const host = (0, random_1.pick)(HOSTS);
    const cmd = (0, random_1.pick)(COMMANDS);
    return {
        prompt: chalk_1.default.green(`${user}@${host}`) + chalk_1.default.white(':') + chalk_1.default.blue('~') + chalk_1.default.white('$ '),
        command: chalk_1.default.white(cmd.cmd),
        output: cmd.output(),
    };
}
function commandBlockToLines(block) {
    return [block.prompt + block.command, ...block.output, ''];
}
//# sourceMappingURL=commands.js.map