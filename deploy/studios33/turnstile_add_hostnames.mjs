#!/usr/bin/env node
/**
 * Añade hostnames al widget Turnstile Studios33 vía API (token con Account → Turnstile → Edit).
 * Carga claves desde deploy/studios33/.env.studios33
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    /* ignore */
  }
}

loadEnvFile(join(__dirname, '.env.studios33'));
try {
  const raw = readFileSync(join(__dirname, '../../../VOXTVSERVER/.env.studios33'), 'utf8');
  const m = raw.match(/^CF_API_TOKEN=(.+)$/m);
  if (m && !process.env.CF_API_TOKEN) process.env.CF_API_TOKEN = m[1].trim();
} catch {
  /* ignore */
}

const SITEKEY = process.env.TURNSTILE_SITE_KEY || '0x4AAAAAADfZv6Sq1SnWsdoI';
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '8c341ac4127ab3dfad39b1567376b928';
const TOKEN = process.env.CF_API_TOKEN || '';

const DOMAINS = [
  'studios33.app',
  'www.studios33.app',
  'localhost',
  '127.0.0.1',
];

if (!TOKEN) {
  console.error('Falta CF_API_TOKEN (VOXTVSERVER/.env.studios33 o entorno)');
  process.exit(1);
}

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/challenges/widgets/${SITEKEY}`,
  {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      domains: DOMAINS,
      mode: 'managed',
      name: 'Studios33',
    }),
  }
);
const data = await res.json();
if (!data.success) {
  console.error('API no pudo actualizar el widget:', JSON.stringify(data.errors || data, null, 2));
  console.error('\nDashboard: Turnstile → widget', SITEKEY, '→ Hostname management →', DOMAINS.join(', '));
  process.exit(1);
}
console.log('OK — dominios autorizados:', data.result?.domains);