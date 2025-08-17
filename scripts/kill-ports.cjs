#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');

const ports = process.argv.slice(2).map(Number).filter(Boolean);
if (ports.length === 0) {
  console.log('Usage: node scripts/kill-ports.cjs <port1> <port2> ...');
  process.exit(1);
}

for (const port of ports) {
  try {
    if (process.platform === 'darwin') {
      const pids = execSync(`lsof -ti:${port} | head -5 || true`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (pids.length) {
        execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'ignore' });
        console.log(`Killed PIDs ${pids.join(', ')} on port ${port}`);
      }
    } else if (process.platform === 'win32') {
      execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`, { stdio: 'ignore', shell: 'cmd.exe' });
      console.log(`Requested kill on Windows for port ${port}`);
    } else {
      execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
      console.log(`Killed processes on port ${port}`);
    }
  } catch (_) {
    // ignore
  }
}
