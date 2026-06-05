#!/usr/bin/env node
/**
 * Sincroniza DNS de studios33.app en Cloudflare (web + Proton Mail).
 *
 * Uso:
 *   source ../../../VOXTVSERVER/.env.studios33  # CF_API_TOKEN, CF_ZONE_ID
 *   node deploy/studios33/cloudflare_dns.mjs --execute
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
}

loadEnvFile(join(__dirname, '../../../VOXTVSERVER/.env.studios33'));

const {
  CF_API_TOKEN,
  CF_ZONE_ID,
  HETZNER_IP = '94.130.222.205',
} = process.env;

const EXECUTE = process.argv.includes('--execute');
const API = 'https://api.cloudflare.com/client/v4';
const APEX = 'studios33.app';

const PROTON_SUFFIX = 'dymlgibs23kyw7rr7ilm6x6ec3vtgrnq26ymmcxev4ga6acdb5ada.domains.proton.ch';
const PROTON_DKIM = [
  { host: 'protonmail._domainkey', target: `protonmail.domainkey.${PROTON_SUFFIX}` },
  { host: 'protonmail2._domainkey', target: `protonmail2.domainkey.${PROTON_SUFFIX}` },
  { host: 'protonmail3._domainkey', target: `protonmail3.domainkey.${PROTON_SUFFIX}` },
].map(({ host, target }) => ({
  type: 'CNAME',
  name: `${host}.${APEX}`,
  content: target,
  proxied: false,
}));

const RECORDS = [
  { type: 'A', name: APEX, content: HETZNER_IP, proxied: true },
  { type: 'A', name: `api.${APEX}`, content: HETZNER_IP, proxied: true },
  { type: 'CNAME', name: `www.${APEX}`, content: APEX, proxied: true },
  ...PROTON_DKIM,
  { type: 'MX', name: APEX, content: 'mail.protonmail.ch', priority: 10, proxied: false },
  { type: 'MX', name: APEX, content: 'mailsec.protonmail.ch', priority: 20, proxied: false },
  {
    type: 'TXT',
    name: APEX,
    content: 'v=spf1 include:_spf.protonmail.ch include:_spf.google.com ~all',
    proxied: false,
  },
  {
    type: 'TXT',
    name: APEX,
    content: 'protonmail-verification=7c86f557cf597b7aba16a0c282b72d5434b5cf0e',
    proxied: false,
  },
  {
    type: 'TXT',
    name: `_dmarc.${APEX}`,
    content: 'v=DMARC1; p=quarantine',
    proxied: false,
  },
];

for (const [k, v] of Object.entries({ CF_API_TOKEN, CF_ZONE_ID, HETZNER_IP })) {
  if (!v) {
    console.error(`Falta variable: ${k}`);
    process.exit(1);
  }
}

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
  'Content-Type': 'application/json',
};

async function cf(path, options = {}) {
  const res = await fetch(`${API}/zones/${CF_ZONE_ID}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${path}: ${JSON.stringify(data.errors || data)}`);
  }
  return data.result;
}

async function listByName(name) {
  const params = new URLSearchParams({ name, per_page: '100' });
  return cf(`/dns_records?${params.toString()}`);
}

function normalizeTxt(c) {
  return (c || '').replace(/^"|"$/g, '');
}

function recordMatches(existing, spec) {
  if (existing.type !== spec.type) return false;
  if (normalizeTxt(existing.content) !== normalizeTxt(spec.content)) return false;
  if (spec.type === 'MX' && existing.priority !== spec.priority) return false;
  if (existing.proxied !== (spec.proxied ?? false)) return false;
  return true;
}

async function upsert(spec) {
  const existing = await listByName(spec.name);
  const sameType = existing.filter((r) => r.type === spec.type);
  const match = sameType.find((r) => recordMatches(r, spec));

  if (match) {
    console.log(`OK: ${spec.type} ${spec.name}`);
    return;
  }

  const dupes = sameType.filter(
    (r) =>
      r.type === spec.type &&
      (spec.type !== 'TXT' || normalizeTxt(r.content) === normalizeTxt(spec.content)),
  );

  const body = {
    type: spec.type,
    name: spec.name,
    content: spec.content,
    ttl: 1,
    proxied: spec.proxied ?? false,
  };
  if (spec.type === 'MX') body.priority = spec.priority;

  console.log(`${EXECUTE ? 'UPSERT' : 'WOULD'}: ${spec.type} ${spec.name} -> ${spec.content}${spec.priority != null ? ` pri ${spec.priority}` : ''} ${spec.proxied ? 'proxied' : 'dns-only'}`);

  if (!EXECUTE) return;

  for (const r of sameType) {
    if (!recordMatches(r, spec)) {
      await cf(`/dns_records/${r.id}`, { method: 'DELETE' });
    }
  }
  await cf('/dns_records', { method: 'POST', body: JSON.stringify(body) });
}

(async () => {
  console.log(EXECUTE ? '=== SYNC DNS studios33.app ===' : '=== DRY-RUN (añade --execute) ===');
  console.log(`Zone: ${CF_ZONE_ID}`);
  for (const spec of RECORDS) {
    await upsert(spec);
  }
  console.log('Hecho.');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});