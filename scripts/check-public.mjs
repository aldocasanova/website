import { readdir, readFile, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';

// A local pattern check, not proof that arbitrary secrets cannot be present.
// Never print matching values, including in CI logs.
const patterns = [
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/,
  /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/,
  /(?:api[_-]?key|secret|password|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_\-/+=]{20,}["']/i,
];
const sensitive = (path) => (/^(?:\.env(?:\..*)?|\.npmrc|id_rsa|id_ed25519)$/.test(basename(path)) && basename(path) !== '.env.example') || /\.(?:pem|key|p12|pfx)$/.test(path);
const failures = [];
function check(text, label) { if (patterns.some((pattern) => pattern.test(text))) failures.push(`Possible credential: ${label}`); }
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) { failures.push(`Public symlink: ${path}`); continue; }
    if (entry.isDirectory()) { await walk(path); continue; }
    if (sensitive(path) || path.endsWith('.map')) failures.push(`Private or debugging file in output: ${path}`);
    const contents = await readFile(path);
    check(contents.toString(), path);
    if (path.endsWith('.html')) {
      const html = contents.toString();
      for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (body.trim() || !/\bsrc="\/_astro\//.test(attributes)) failures.push(`Script incompatible with production CSP: ${path}`);
      }
      if ((html.match(/<[a-z][^>]*>/gi) || []).some((tag) => /\son[a-z]+\s*=|(?:href|src)="\s*javascript:/i.test(tag))) failures.push(`Executable HTML attribute: ${path}`);
    }
  }
}
await walk('public');
await walk('dist');
let historyCount = 0;
try {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const file of files) {
    if (sensitive(file)) failures.push(`Tracked private file: ${file}`);
    if ((await lstat(file)).isFile()) check((await readFile(file)).toString(), file);
  }
  const objects = execFileSync('git', ['rev-list', '--objects', '--all'], { encoding: 'utf8' }).trim().split('\n');
  for (const object of objects) {
    const [id, ...parts] = object.split(' ');
    if (!parts.length || execFileSync('git', ['cat-file', '-t', id], { encoding: 'utf8' }).trim() !== 'blob') continue;
    const name = parts.join(' ');
    if (sensitive(name)) failures.push(`Private file in history: ${id.slice(0, 10)} ${name}`);
    check(execFileSync('git', ['cat-file', '-p', id], { maxBuffer: 20 * 1024 * 1024 }).toString(), `${id.slice(0, 10)} ${name}`);
    historyCount++;
  }
} catch (error) { failures.push(`Git inspection could not complete: ${error.code || error.message}`); }
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1; }
else console.log(`Public output and ${historyCount} historical blobs checked: no matches for configured credential patterns; no incompatible scripts.`);
