import { test, expect } from '@playwright/test';

const patientId = 4242;

const sampleChart = {
  planetas: [{ nombre: 'sun', signo: 'Aries', grados: 10, longitud_ecliptica: 10, casa: 1, es_retrogrado: false }],
  casas: [{ numero: 1, signo: 'Aries', cuspide_grados: 0, cuspide_longitud: 0 }],
  aspectos: [],
  metadatos: { sistema_casas: 'placidus', zodiac_type: 'tropical', calculated_at: new Date().toISOString() },
};

const analysisResult = {
  transits: { ...sampleChart, metadatos: { ...sampleChart.metadatos, technique: 'transits' } },
  progressions: { reference_date: '2026-06-10', method: 'secondary_progression_day_for_year', chart: sampleChart },
  solarReturn: { reference_date: '2026-01-01', chart: sampleChart },
};

test('Astrología: carta con multitech habilita capas e interpretación natal', async ({ page }, testInfo) => {
  const appBase =
    testInfo.project.use.baseURL ||
    process.env.E2E_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    'http://localhost:3000';

  let interpretCalled = false;

  await page.addInitScript(() => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('therapist_active_patient_id', '4242');
  });

  await page.route('**/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'e2e_therapist',
        profile: { user_type: 'therapist' },
      }),
    });
  });

  await page.route('**/api/**', async (route, request) => {
    const url = request.url();

    if (url.includes('/astrology/ai-status/') && request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ enabled: true, model: 'test-model' }),
      });
      return;
    }

    if (url.includes('/astrology/interpret/natal/') && request.method() === 'POST') {
      interpretCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          interpretation: 'Lectura e2e simbólica.',
          layer: 'natal',
          patient_id: patientId,
        }),
      });
      return;
    }

    if (/\/therapist\/patients\/.+\/astrology-kerykeion\/$/.test(url)) {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'ok',
            chart: sampleChart,
            analysis_result: analysisResult,
            house_system: 'placidus',
            source: 'kerykeion',
          }),
        });
        return;
      }
    }

    if (url.endsWith('/therapist/patients/') && request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: patientId,
            full_name: 'E2E Astro',
            birth_date: '1990-01-01',
            birth_time: '12:00:00',
            birth_city: 'Madrid',
            birth_country: 'ES',
            lat: 40.4168,
            long: -3.7038,
            timezone: 'Europe/Madrid',
          },
        ]),
      });
      return;
    }

    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }

    await route.continue();
  });

  await page.goto(new URL('/dashboard/therapist/astrologia', appBase).toString());
  await page.waitForTimeout(1500);

  const transitsToggle = page.getByRole('checkbox', { name: /Tránsitos/i }).first();
  if (await transitsToggle.isVisible().catch(() => false)) {
    await transitsToggle.click();
  }

  const interpretButton = page.getByRole('button', { name: /Interpretar|Generar interpretación/i }).first();
  if (await interpretButton.isVisible().catch(() => false)) {
    await interpretButton.click();
    for (let i = 0; i < 30; i++) {
      if (interpretCalled) break;
      await page.waitForTimeout(100);
    }
  }

  expect(interpretCalled).toBeTruthy();
});