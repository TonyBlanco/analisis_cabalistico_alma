/**
 * Smoke manual PDF Cábala Aplicada — beta/prod studios33.app
 * Uso: AUTH_TOKEN=... node scripts/smoke-cabala-pdf-prod.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SMOKE_BASE_URL ?? 'https://studios33.app';
const API = process.env.SMOKE_API_URL ?? 'https://api.studios33.app/api';
const TOKEN = process.env.AUTH_TOKEN;
const PATIENT_ID = Number(process.env.PATIENT_ID ?? '1');
const PATIENT_NAME = process.env.PATIENT_NAME ?? 'LUIS ANTONIO BLANCO FONTELA';

const results = [];

function record(id, ok, detail) {
  results.push({ id, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${id}: ${detail}`);
}

async function dismissCookies(page) {
  const reject = page.getByRole('button', { name: /rechazar todo/i });
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
    await page.waitForTimeout(400);
  }
}

async function readPanelMessage(page) {
  const err = page.locator('aside').getByText(/no se pudo|error/i).first();
  const ok = page.locator('aside').getByText(/pdf generado/i).first();
  if (await ok.isVisible().catch(() => false)) return { type: 'ok', text: await ok.innerText() };
  if (await err.isVisible().catch(() => false)) return { type: 'error', text: await err.innerText() };
  return { type: 'none', text: '' };
}

async function fetchLatestPdfBase64() {
  const res = await fetch(
    `${API}/analysis-records/?patient_id=${PATIENT_ID}`,
    { headers: { Authorization: `Token ${TOKEN}` } },
  );
  if (!res.ok) throw new Error(`analysis-records ${res.status}`);
  const rows = await res.json();
  const list = Array.isArray(rows) ? rows : rows.results ?? [];
  const pdfRec = list.find((r) => String(r.module_code || '').includes('CABALA_APLICADA_pdf'));
  const deliverable = pdfRec?.computed_result?.cabala_aplicada?.method_output?.deliverable;
  return deliverable?.base64 ?? null;
}

function pdfContainsKeywords(base64) {
  const raw = Buffer.from(base64, 'base64').toString('latin1');
  const checks = {
    aviso: /Documento simb[oó]lico|No m[eé]dico|Material simb[oó]lico/i.test(raw),
    metodo: /Interpretaci[oó]n del m[eé]todo|qu[eé] es este m[eé]todo|c[oó]mo se calcula/i.test(raw),
    actividad: /Actividad de la sesi[oó]n/i.test(raw),
    watermark: /Documento simb[oó]lico/i.test(raw),
    formativa: /S[ií]ntesis formativa/i.test(raw),
  };
  return checks;
}

async function main() {
  if (!TOKEN) {
    console.error('AUTH_TOKEN requerido');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  page.on('pageerror', (e) => record('page-error', false, e.message));

  await page.addInitScript(
    ({ token, pid, pname }) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', 'therapist');
      localStorage.setItem('active_role', 'therapist');
      localStorage.setItem('therapist_active_patient_id', String(pid));
      localStorage.setItem('therapist_active_patient_name', pname);
    },
    { token: TOKEN, pid: PATIENT_ID, pname: PATIENT_NAME },
  );

  await page.goto(`${BASE}/dashboard/therapist/cabala-aplicada`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await dismissCookies(page);

  await page
    .getByText(/Cargando consultante activo/i)
    .waitFor({ state: 'hidden', timeout: 60000 })
    .catch(() => {});

  const patientVisible = await page.getByText(PATIENT_NAME, { exact: false }).first().isVisible().catch(() => false);
  record('patient-active', patientVisible, patientVisible ? `Consultante ${PATIENT_NAME} visible` : 'Consultante no visible en UI');

  // 1) Ejecutar método en el Árbol
  await page.locator('aside[aria-label="Secciones del workspace"] button', { hasText: /^Árbol$/ }).first().click().catch(() => {});

  const ejecutar = page.getByRole('button', { name: /Ejecutar método cabalístico/i });
  try {
    await ejecutar.waitFor({ state: 'visible', timeout: 60000 });
    await ejecutar.click();
    await page
      .getByText(/Ejecutando…|Analizando estructura simbólica/i)
      .waitFor({ state: 'hidden', timeout: 90000 })
      .catch(() => {});
    await page.waitForTimeout(2000);
    const treeActive =
      (await page.locator('#cabala-aplicada-export-tree svg').count()) > 0 ||
      (await page.getByText(/Síntesis disponible/i).isVisible().catch(() => false)) ||
      !(await page.getByText(/Aún no hay análisis en el Árbol/i).isVisible().catch(() => true));
    record(
      'method-execute',
      treeActive,
      treeActive ? 'Método ejecutado; árbol o síntesis visible' : 'No se confirmó árbol/síntesis tras Ejecutar',
    );
  } catch (e) {
    const errText = await page.locator('main').innerText().catch(() => '');
    record(
      'method-execute',
      false,
      `Botón Ejecutar no disponible: ${e.message}${errText.includes('Error cargando consultante') ? ' (perfil consultante 404 — revisa PATIENT_ID)' : ''}`,
    );
  }

  // 2) Pestaña PDF + actividad
  await page.locator('header button', { hasText: /^PDF$/ }).first().click();
  await page.waitForTimeout(2000);

  const activityLegend = page.locator('legend', { hasText: /Registros a incluir/i });
  const activityVisible = await activityLegend.isVisible().catch(() => false);
  record('pdf-tab-activity', activityVisible, activityVisible ? 'Lista de actividad cargada' : 'No apareció bloque de registros');

  const sectionTree = page.getByLabel('Árbol (visual)', { exact: false }).or(page.locator('label', { hasText: 'Árbol (visual)' }).locator('input'));
  const metodoBox = page.locator('label', { hasText: 'Interpretación del método' }).locator('input');

  if (await metodoBox.isVisible().catch(() => false)) {
    await metodoBox.click({ force: true });
    await metodoBox.click({ force: true });
    record('pdf-toggle-sections', true, 'Casillas de secciones responden');
  } else {
    record('pdf-toggle-sections', false, 'No se encontraron casillas de secciones');
  }

  // 3) Generar PDF con árbol
  await page.getByRole('button', { name: /generar pdf/i }).click();
  await page.waitForTimeout(15000);
  let msg = await readPanelMessage(page);
  const pdfOkFull = msg.type === 'ok' && !/contenedor del Árbol exportable/i.test(msg.text);
  record('pdf-generate-with-tree', pdfOkFull, msg.text || 'sin mensaje de resultado');

  let pdfChecks = {};
  try {
    const b64 = await fetchLatestPdfBase64();
    if (b64) {
      pdfChecks = pdfContainsKeywords(b64);
      const outDir = path.resolve(__dirname, '../../docs/screenshots/cabala-pdf-smoke');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'informe-con-arbol.pdf'), Buffer.from(b64, 'base64'));
      record('pdf-content-metodo', pdfChecks.metodo, 'Sección interpretación del método en PDF');
      record('pdf-content-actividad', pdfChecks.actividad, 'Sección actividad en PDF');
      record('pdf-content-aviso', pdfChecks.aviso, 'Aviso profesional / marca no médico en PDF');
      record('pdf-content-formativa', pdfChecks.formativa, 'Sección Síntesis formativa presente en PDF');
    } else {
      record('pdf-content-metodo', false, 'No se recuperó PDF del historial API');
      record('pdf-content-actividad', false, 'No se recuperó PDF del historial API');
      record('pdf-content-aviso', false, 'No se recuperó PDF del historial API');
    }
  } catch (e) {
    record('pdf-content-metodo', false, e.message);
  }

  // 4) Generar PDF sin síntesis formativa — verificar que se omite
  const formativaLabel = page.locator('label', { hasText: /S[ií]ntesis formativa/ });
  const formativaInput = formativaLabel.locator('input[type="checkbox"]');
  if (await formativaInput.isVisible().catch(() => false)) {
    if (await formativaInput.isChecked()) await formativaInput.uncheck();
    await page.getByRole('button', { name: /generar pdf/i }).click();
    await page.waitForTimeout(15000);
    try {
      const b64noForm = await fetchLatestPdfBase64();
      if (b64noForm) {
        const rawNoForm = Buffer.from(b64noForm, 'base64').toString('latin1');
        const absent = !/S[ií]ntesis formativa/i.test(rawNoForm);
        record('pdf-formativa-omitted-when-unchecked', absent, absent ? 'Síntesis formativa ausente cuando se desmarca' : 'ERROR: Síntesis formativa presente aunque desmarcada');
      } else {
        record('pdf-formativa-omitted-when-unchecked', false, 'No se recuperó PDF del historial API');
      }
    } catch (e) {
      record('pdf-formativa-omitted-when-unchecked', false, e.message);
    }
    // Re-marcar para el caso sin árbol
    await formativaInput.check().catch(() => {});
  } else {
    record('pdf-formativa-omitted-when-unchecked', false, 'No se encontró casilla de síntesis formativa');
  }

  // 5) Generar PDF sin árbol (caso clave)
  const treeLabel = page.locator('label', { hasText: 'Árbol (visual)' });
  const treeInput = treeLabel.locator('input[type="checkbox"]');
  if (await treeInput.isVisible().catch(() => false)) {
    if (await treeInput.isChecked()) await treeInput.uncheck();
  }
  await page.getByRole('button', { name: /generar pdf/i }).click();
  await page.waitForTimeout(15000);
  msg = await readPanelMessage(page);
  const noTreeOk =
    msg.type !== 'error' &&
    !/No se encontró el contenedor del Árbol exportable/i.test(msg.text) &&
    (msg.type === 'ok' || /pdf generado/i.test(msg.text));
  record('pdf-generate-without-tree', noTreeOk, msg.text || 'sin mensaje');

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log('\n--- RESUMEN ---');
  console.log(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});