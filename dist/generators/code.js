"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeLine = generateCodeLine;
const chalk_1 = __importDefault(require("chalk"));
const random_1 = require("../utils/random");
// Generates believable multi-language code and script lines
// that look like real work happening in a terminal
const PY_LINES = [
    `import asyncio, ssl, hashlib, struct`,
    `from cryptography.hazmat.primitives import hashes, serialization`,
    `from cryptography.hazmat.backends import default_backend`,
    `async def establish_tunnel(host: str, port: int) -> asyncio.StreamWriter:`,
    `    ctx = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)`,
    `    ctx.check_hostname = False`,
    `    ctx.verify_mode = ssl.CERT_NONE`,
    `    reader, writer = await asyncio.open_connection(host, port, ssl=ctx)`,
    `    return writer`,
    `def derive_key(secret: bytes, salt: bytes) -> bytes:`,
    `    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)`,
    `    return base64.urlsafe_b64encode(kdf.derive(secret))`,
    `payload = struct.pack('>HH', 0x4e4f, len(data)) + data`,
    `sock.sendall(payload)`,
    `response = await asyncio.wait_for(reader.read(4096), timeout=3.0)`,
    `if response[:2] != b'OK': raise ConnectionError('handshake failed')`,
    `logger.debug(f'tunnel established: {host}:{port} [{len(payload)} bytes]')`,
    `loop = asyncio.get_event_loop()`,
    `loop.run_until_complete(main())`,
];
const BASH_LINES = [
    `#!/bin/bash`,
    `set -euo pipefail`,
    `TARGET="${(0, random_1.randIPv4)()}"`,
    `PORT=443`,
    `PAYLOAD=$(openssl rand -hex 32)`,
    `echo "[*] scanning target: $TARGET"`,
    `nmap -sV -p 22,80,443,8080,8443 $TARGET 2>/dev/null`,
    `curl -sk https://$TARGET/api/v1/health | jq .`,
    `ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa root@$TARGET 'id && uname -a'`,
    `for port in 22 80 443 3306 5432 6379 27017; do`,
    `  nc -zv $TARGET $port 2>&1 | grep -E 'open|refused'`,
    `done`,
    `openssl s_client -connect $TARGET:443 </dev/null 2>/dev/null | openssl x509 -noout -text`,
    `tcpdump -i eth0 -nn 'host $TARGET' -w /tmp/capture.pcap &`,
    `echo "[+] capture started: pid $!"`,
    `iptables -I INPUT -s $TARGET -j LOG --log-prefix "TRACK: "`,
    `systemctl restart networking && echo "[+] interface restarted"`,
];
const GO_LINES = [
    `package main`,
    `import (`,
    `    "crypto/tls"`,
    `    "encoding/binary"`,
    `    "fmt"`,
    `    "net"`,
    `    "sync"`,
    `    "time"`,
    `)`,
    `type Tunnel struct {`,
    `    conn   net.Conn`,
    `    mu     sync.Mutex`,
    `    closed bool`,
    `}`,
    `func (t *Tunnel) Send(data []byte) error {`,
    `    t.mu.Lock()`,
    `    defer t.mu.Unlock()`,
    `    if t.closed { return ErrTunnelClosed }`,
    `    hdr := make([]byte, 4)`,
    `    binary.BigEndian.PutUint32(hdr, uint32(len(data)))`,
    `    _, err := t.conn.Write(append(hdr, data...))`,
    `    return err`,
    `}`,
    `func dialTLS(addr string) (*tls.Conn, error) {`,
    `    cfg := &tls.Config{InsecureSkipVerify: true}`,
    `    return tls.Dial("tcp", addr, cfg)`,
    `}`,
    `fmt.Printf("[+] connected: %s latency=%dms\\n", addr, latency.Milliseconds())`,
];
const C_LINES = [
    `#include <stdio.h>`,
    `#include <stdlib.h>`,
    `#include <string.h>`,
    `#include <unistd.h>`,
    `#include <sys/socket.h>`,
    `#include <netinet/in.h>`,
    `#include <arpa/inet.h>`,
    `#include <openssl/ssl.h>`,
    `#include <openssl/err.h>`,
    `SSL_CTX *ctx = SSL_CTX_new(TLS_client_method());`,
    `SSL_CTX_set_verify(ctx, SSL_VERIFY_NONE, NULL);`,
    `int sock = socket(AF_INET, SOCK_STREAM, 0);`,
    `struct sockaddr_in addr = { .sin_family = AF_INET, .sin_port = htons(443) };`,
    `inet_pton(AF_INET, target_ip, &addr.sin_addr);`,
    `connect(sock, (struct sockaddr*)&addr, sizeof(addr));`,
    `SSL *ssl = SSL_new(ctx);`,
    `SSL_set_fd(ssl, sock);`,
    `if (SSL_connect(ssl) <= 0) { ERR_print_errors_fp(stderr); exit(1); }`,
    `printf("[+] TLS handshake complete: %s\\n", SSL_get_cipher(ssl));`,
    `unsigned char buf[4096];`,
    `int n = SSL_read(ssl, buf, sizeof(buf));`,
    `fprintf(stdout, "[+] received %d bytes\\n", n);`,
];
const RUST_LINES = [
    `use tokio::net::TcpStream;`,
    `use tokio_rustls::TlsConnector;`,
    `use rustls::ClientConfig;`,
    `use std::sync::Arc;`,
    `async fn connect(addr: &str) -> anyhow::Result<()> {`,
    `    let config = ClientConfig::builder()`,
    `        .with_safe_defaults()`,
    `        .with_custom_certificate_verifier(Arc::new(NoCertVerification))`,
    `        .with_no_client_auth();`,
    `    let connector = TlsConnector::from(Arc::new(config));`,
    `    let stream = TcpStream::connect(addr).await?;`,
    `    let domain = rustls::ServerName::try_from("target").unwrap();`,
    `    let tls = connector.connect(domain, stream).await?;`,
    `    println!("[+] connected: {addr}");`,
    `    Ok(())`,
    `}`,
    `#[tokio::main]`,
    `async fn main() -> anyhow::Result<()> {`,
    `    tracing_subscriber::fmt::init();`,
    `    connect("${(0, random_1.randIPv4)()}:443").await`,
    `}`,
];
const LANG_POOLS = {
    python: PY_LINES,
    bash: BASH_LINES,
    go: GO_LINES,
    c: C_LINES,
    rust: RUST_LINES,
};
const LANG_COLORS = {
    python: '#4ec9b0',
    bash: '#00ff41',
    go: '#00aaff',
    c: '#d4a574',
    rust: '#ff8c42',
};
let currentLang = 'bash';
let currentIndex = 0;
function generateCodeLine() {
    const pool = LANG_POOLS[currentLang];
    const color = LANG_COLORS[currentLang];
    if (currentIndex >= pool.length) {
        // Switch language
        const langs = Object.keys(LANG_POOLS);
        currentLang = (0, random_1.pick)(langs);
        currentIndex = 0;
        return chalk_1.default.dim(''); // blank line between blocks
    }
    const raw = pool[currentIndex++];
    // Fill any template vars
    const line = raw
        .replace(/\${randIPv4\(\)}/g, (0, random_1.randIPv4)())
        .replace(/\${randHex\(\)}/g, (0, random_1.randHex)(4));
    // Syntax-style coloring based on content
    if (raw.startsWith('#!') || raw.startsWith('#!/'))
        return chalk_1.default.hex('#666666')(line);
    if (raw.startsWith('#'))
        return chalk_1.default.hex('#555555')(line);
    if (raw.startsWith('//'))
        return chalk_1.default.hex('#555555')(line);
    if (raw.startsWith('import') || raw.startsWith('use ') || raw.startsWith('#include')) {
        return chalk_1.default.hex('#c586c0')(line);
    }
    if (raw.includes('func ') || raw.includes('async def') || raw.includes('fn ') || raw.includes('void ')) {
        return chalk_1.default.hex('#dcdcaa')(line);
    }
    if (raw.includes('printf') || raw.includes('println') || raw.includes('print(') || raw.includes('echo ')) {
        return chalk_1.default.hex('#ce9178')(line);
    }
    if (raw.trim().startsWith('//') || raw.trim().startsWith('*')) {
        return chalk_1.default.hex('#6a9955')(line);
    }
    return chalk_1.default.hex(color)(line);
}
//# sourceMappingURL=code.js.map