import chalk from 'chalk';
import { pick, randInt, randFloat, randHex, randIPv4, chance } from '../utils/random';
import { formatBytes } from '../utils/format';

const USERS = ['root', 'operator', 'sysadmin', 'daemon', 'deploy'];
const HOSTS = ['node-alpha', 'bastion-01', 'relay-7', 'core-nexus', 'phantom-gate'];

function fakePS(): string[] {
  const lines = [chalk.dim('  PID TTY          TIME CMD')];
  for (let i = 0; i < randInt(4, 9); i++) {
    const pid = randInt(1000, 99999);
    const time = `${randInt(0,9)}:${String(randInt(0,59)).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')}`;
    const cmds = ['bash','python3','node','sshd','nginx','java','go','cargo','curl','kubectl'];
    lines.push(`${String(pid).padStart(5)} pts/${randInt(0,5)}    ${time} ${pick(cmds)}`);
  }
  return lines;
}

function fakeNetstat(): string[] {
  const lines = [chalk.dim('Proto  Local Address          Foreign Address        State')];
  const states = ['ESTABLISHED', 'LISTEN', 'TIME_WAIT', 'CLOSE_WAIT'];
  for (let i = 0; i < randInt(4, 8); i++) {
    const proto = chance(0.7) ? 'tcp' : 'udp';
    const local = `${randIPv4()}:${randInt(1024, 65535)}`;
    const foreign = `${randIPv4()}:${randInt(80, 9999)}`;
    lines.push(`${proto.padEnd(6)} ${local.padEnd(22)} ${foreign.padEnd(22)} ${chalk.cyan(pick(states))}`);
  }
  return lines;
}

function fakeSSHConnect(): string[] {
  const ip = randIPv4();
  return [
    `Warning: Permanently added '${ip}' (ECDSA) to the list of known hosts.`,
    `${chalk.green('Authenticated')} to ${ip} ([${ip}]:22).`,
    `Last login: ${new Date().toUTCString()} from ${randIPv4()}`,
    chalk.dim(`fingerprint: SHA256:${randHex(16)}`),
  ];
}

function fakeLs(): string[] {
  const entries = [
    chalk.blue('bin/'), chalk.blue('etc/'), chalk.blue('home/'), chalk.blue('lib/'),
    chalk.blue('opt/'), chalk.blue('proc/'), chalk.blue('root/'), chalk.blue('tmp/'),
    'config.yml', 'deploy.sh', 'Makefile', 'README.md',
    chalk.green('run.sh'), chalk.green('bootstrap.sh'),
  ];
  const rows: string[] = [];
  let row = '';
  for (const entry of entries) {
    if (row.length > 50) { rows.push(row); row = ''; }
    row += entry.padEnd(14);
  }
  if (row) rows.push(row);
  return rows;
}

function fakePing(): string[] {
  const ip = randIPv4();
  const lines = [`PING ${ip} (${ip}) 56(84) bytes of data.`];
  for (let i = 0; i < randInt(3, 6); i++) {
    lines.push(`64 bytes from ${ip}: icmp_seq=${i+1} ttl=${randInt(50,128)} time=${randFloat(0.8,120).toFixed(3)} ms`);
  }
  return lines;
}

function fakeDf(): string[] {
  return [
    chalk.dim('Filesystem              Size  Used Avail Use% Mounted on'),
    `/dev/sda1              ${formatBytes(randInt(50,500)*1e9).padEnd(5)} ${formatBytes(randInt(10,400)*1e9).padEnd(5)} ${formatBytes(randInt(1,100)*1e9).padEnd(5)}  ${randInt(20,95)}% /`,
    `tmpfs                  ${formatBytes(randInt(1,32)*1e9).padEnd(5)} ${formatBytes(randInt(1,500)*1e6).padEnd(5)} ${formatBytes(randInt(1,32)*1e9).padEnd(5)}   ${randInt(1,15)}% /tmp`,
  ];
}

function fakeCurl(): string[] {
  const ip = randIPv4();
  return [
    chalk.dim(`> GET / HTTP/1.1`),
    chalk.dim(`> Host: ${ip}`),
    chalk.dim(`> User-Agent: cineterminal/0.1`),
    chalk.dim(`>`),
    chalk.cyan(`< HTTP/1.1 ${pick(['200 OK','201 Created','304 Not Modified','401 Unauthorized'])}`),
    chalk.cyan(`< Content-Type: application/json`),
    chalk.cyan(`< X-Request-ID: ${randHex(8)}`),
    `{ "status": "ok", "node": "${pick(HOSTS)}", "ts": ${Date.now()} }`,
  ];
}

interface FakeCommand { cmd: string; output: () => string[]; }

const COMMANDS: FakeCommand[] = [
  { cmd: 'ps aux', output: fakePS },
  { cmd: 'netstat -an', output: fakeNetstat },
  { cmd: `ssh root@${randIPv4()}`, output: fakeSSHConnect },
  { cmd: 'ls -la /srv', output: fakeLs },
  { cmd: `ping -c ${randInt(3,6)} ${randIPv4()}`, output: fakePing },
  { cmd: 'df -h', output: fakeDf },
  { cmd: `curl -v http://${randIPv4()}/api/status`, output: fakeCurl },
  { cmd: `nmap -sV ${randIPv4()}`, output: () => [
    `Starting Nmap scan on ${randIPv4()}`,
    `PORT     STATE  SERVICE  VERSION`,
    `22/tcp   open   ssh      OpenSSH ${randInt(7,9)}.${randInt(0,9)}`,
    `80/tcp   open   http     nginx 1.${randInt(20,25)}`,
    `443/tcp  open   https    nginx`,
    `Nmap done: 1 IP address scanned`,
  ]},
];

export interface CommandBlock {
  prompt: string;
  command: string;
  output: string[];
}

export function generateCommandBlock(): CommandBlock {
  const user = pick(USERS);
  const host = pick(HOSTS);
  const cmd = pick(COMMANDS);
  return {
    prompt: chalk.green(`${user}@${host}`) + chalk.white(':') + chalk.blue('~') + chalk.white('$ '),
    command: chalk.white(cmd.cmd),
    output: cmd.output(),
  };
}

export function commandBlockToLines(block: CommandBlock): string[] {
  return [block.prompt + block.command, ...block.output, ''];
}
