import chalk from 'chalk';
import { pick, randInt, chance, randIPv4, randHex, randFloat } from '../utils/random';
import { formatTimeMs } from '../utils/format';

const SERVICES = [
  'kernel', 'sshd', 'auditd', 'systemd', 'nginx', 'firewalld',
  'cron', 'dockerd', 'containerd', 'kubelet', 'etcd', 'vault',
  'netfilter', 'iptables', 'securityd', 'authd', 'cryptsetup',
];

const LOG_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'CRIT', 'NOTICE'] as const;
type LogLevel = typeof LOG_LEVELS[number];
const LEVEL_WEIGHTS = [40, 20, 10, 15, 3, 12];

const MESSAGES: Record<LogLevel, string[]> = {
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

function fillTemplate(template: string): string {
  return template
    .replace('{ip}', randIPv4())
    .replace('{gw}', randIPv4())
    .replace('{port}', String(randInt(1024, 65535)))
    .replace('{pid}', String(randInt(1000, 99999)))
    .replace('{uid}', String(randInt(0, 9999)))
    .replace('{hex}', randHex(4))
    .replace('{lat}', randFloat(0.5, 850).toFixed(1))
    .replace('{bytes}', String(randInt(64, 65535)))
    .replace('{pct}', String(randInt(60, 99)))
    .replace('{n}', String(randInt(1, 512)))
    .replace('{fd}', String(randInt(3, 256)))
    .replace('{service}', pick(SERVICES))
    .replace('{cipher}', pick(CIPHERS))
    .replace('{mod}', pick(MODULES));
}

function colorLevel(level: LogLevel): string {
  switch (level) {
    case 'INFO':   return chalk.cyan(level.padEnd(6));
    case 'WARN':   return chalk.yellow(level.padEnd(6));
    case 'ERROR':  return chalk.red(level.padEnd(6));
    case 'DEBUG':  return chalk.gray(level.padEnd(6));
    case 'CRIT':   return chalk.bgRed.white(level.padEnd(6));
    case 'NOTICE': return chalk.green(level.padEnd(6));
  }
}

export function generateLogLine(): string {
  const level = pick(
    LOG_LEVELS.filter((_l, i) => chance(LEVEL_WEIGHTS[i] / 100))
  ) ?? 'INFO';

  const service = pick(SERVICES);
  const messages = MESSAGES[level];
  const message = fillTemplate(pick(messages));
  const timestamp = chalk.dim(formatTimeMs());
  const svc = chalk.dim(`[${service.padEnd(12)}]`);

  return `${timestamp} ${colorLevel(level)} ${svc} ${message}`;
}

export function generateBootLine(): string {
  const lines = [
    `[  ${randFloat(0, 9).toFixed(6)}] ${pick(MODULES)}: module loaded`,
    `[  ${randFloat(0, 9).toFixed(6)}] ACPI: ${pick(['IRQ', 'PCI', 'BIOS', 'EC'])} resource allocation complete`,
    `[  ${randFloat(0, 9).toFixed(6)}] NET: Registered PF_PACKET protocol family`,
    `[  ${randFloat(0, 9).toFixed(6)}] ${randHex(4)}:${randHex(4)} phy0: hw init completed`,
    `[  ${randFloat(0, 9).toFixed(6)}] audit: type=2000 audit(${Date.now()}.${randInt(100,999)}:${randInt(1,999)}): initialized`,
  ];
  return chalk.green(pick(lines));
}

export function generateSecurityEvent(): string {
  const events = [
    () => `${chalk.red('¦')} ALERT   Port scan detected from ${randIPv4()} [${randInt(100, 9999)} ports/s]`,
    () => `${chalk.yellow('?')} PROBE   ${randIPv4()} attempted ${pick(['SSH', 'FTP', 'RDP', 'SMB', 'Telnet'])} bruteforce`,
    () => `${chalk.red('!')} BLOCK   Packet dropped: SRC=${randIPv4()} RULE=DROP_CHAIN_${randInt(1, 99)}`,
    () => `${chalk.cyan('~')} TRACE   Suspicious payload in stream ${randHex(3)} [${randInt(1, 48)} bytes encrypted]`,
    () => `${chalk.magenta('?')} CRYPTO  Key exchange initiated with ${randIPv4()} [${pick(CIPHERS)}]`,
    () => `${chalk.green('?')} AUTH    Token ${randHex(8)} validated [uid=${randInt(1000, 9999)}]`,
    () => `${chalk.red('?')} DENIED  Access revoked: ${randIPv4()} exceeded rate limit`,
    () => `${chalk.yellow('?')} SPOOF   ARP conflict detected: ${randIPv4()} multiple MACs`,
  ];
  return formatTimeMs() + '  ' + pick(events)();
}
