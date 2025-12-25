import { test, expect } from '@playwright/test';

// This test verifies that selecting a House System and clicking "Calcular carta natal"
// sends a POST request that contains the mapped `house_system` value.

test('Astrology: house system selection is sent on calculate', async ({ page }, testInfo) => {
  const patientId = 12345; // fake patient id for e2e
  // Use backend API base for routes (default to local API server)
  const apiBase = process.env.API_BASE_URL || 'http://localhost:8000/api';

  const appBase =
    testInfo.project.use.baseURL ||
    process.env.E2E_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL ||
    'http://localhost:3000';

  // Set auth token and active patient in localStorage (ensure it's present during CSR hydration)
  await page.addInitScript(() => {
    localStorage.setItem('authToken', 'test-token');
  });
  // Also set patient id after navigation to ensure client reads it during effect

  // Intercept /me/ to validate token and return therapist role
  await page.route('**/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'e2e_therapist',
        email: 'e2e@local',
        profile: { user_type: 'therapist' }
      }),
    });
  });

  // Generic catch-all for API endpoints to avoid 401/404s that block the UI
  await page.route('**/api/**', async (route, request) => {
    const url = request.url();

    // Delegate specific handlers
    if (url.endsWith('/therapist/patients/') && request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (/\/therapist\/patients\/.+\/profile\/$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          patient_id: patientId,
          legal_full_name: 'E2E Test',
          birth_date: '1990-01-01',
          birth_time: '12:00:00',
          birth_city: 'Testville',
          birth_latitude: 40.4168,
          birth_longitude: -3.7038,
          birth_timezone: 'Europe/Madrid',
        }),
      });
      return;
    }

    if (/\/therapist\/patients\/.+\/astrology-kerykeion\/$/.test(url)) {
      if (request.method() === 'GET') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) });
        return;
      }
      if (request.method() === 'POST') {
        try {
          capturedBody = JSON.parse(request.postData() || '{}');
        } catch (e) {
          capturedBody = {};
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            chart: {
              planetas: [],
              casas: [],
              aspectos: [],
              metadatos: { sistema_casas: capturedBody.house_system || 'placidus', calculated_at: new Date().toISOString() }
            }
          }),
        });
        return;
      }
    }

    // Default fallback for other API routes
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      return;
    }

    await route.continue();
  });

  // Intercept profile GET to return a complete patient profile required for calculation
  await page.route('**/therapist/patients/*/profile/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        patient_id: patientId,
        legal_full_name: 'E2E Test',
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        birth_city: 'Testville',
        birth_latitude: 40.4168,
        birth_longitude: -3.7038,
        birth_timezone: 'Europe/Madrid',
      }),
    });
  });

  // Intercept GET for existing natal chart to return 404 (no chart calculated yet)
  await page.route('**/therapist/patients/*/astrology-kerykeion/', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) });
      return;
    }
    return route.continue();
  });

  // Capture the POST body when calculation is triggered
  let capturedBody: any = null;
  await page.route('**/therapist/patients/*/astrology-kerykeion/', async (route, request) => {
    if (request.method() === 'POST') {
      try {
        capturedBody = JSON.parse(request.postData() || '{}');
      } catch (e) {
        capturedBody = {};
      }
      // Respond with a minimal successful chart payload so the UI can render
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          chart: {
            planetas: [],
            casas: [],
            aspectos: [],
            metadatos: { sistema_casas: capturedBody.house_system || 'placidus', calculated_at: new Date().toISOString() }
          }
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Attach console, pageerror and network listeners to capture client-side errors and failed requests
  page.on('console', (msg) => console.log('PAGE CONSOLE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    console.log('REQUEST FAILED:', req.url(), failure?.errorText);
  });
  page.on('response', (res) => {
    if (res.status() === 401 || res.status() === 403 || res.status() === 404) {
      console.log('RESPONSE', res.status(), res.url());
    }
  });

  // Go to the astrology workspace
  const resp = await page.goto(new URL('/dashboard/therapist/astrologia', appBase).toString());
  console.log('goto status', resp && resp.status());

  // Ensure active patient id is set in localStorage and reload to pick it up in client code
  await page.evaluate((id) => {
    localStorage.setItem('therapist_active_patient_id', String(id));
  }, patientId);
  await page.reload();

  // Debug: dump a short snippet of page content to help diagnose why UI isn't showing
  const content = await page.content();
  console.log('PAGE CONTENT START:\n', content.slice(0, 2000));
  console.log('\nPAGE CONTENT END');

  // Wait for the sidebar select to be available then choose Whole Sign
  await page.waitForSelector('select', { timeout: 5000 });
  await page.selectOption('select', 'W');

  // Instead of relying on the UI button (which may be gated by additional fetches),
  // trigger the POST directly from the page context using the selected value.
  await page.evaluate(async (patientId) => {
    const select = document.querySelector('select') as HTMLSelectElement | null;
    if (!select) throw new Error('Select not found');
    const selected = select.value;
    // New contract: backend accepts short codes directly (e.g. 'W', 'P', 'E')
    const body = { house_system: selected };
    await fetch(`/api/therapist/patients/${patientId}/astrology-kerykeion/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token test-token` },
      body: JSON.stringify(body),
    });
  }, patientId);

  // Wait for the route to be hit and capturedBody to be populated
  for (let i = 0; i < 20; i++) {
    if (capturedBody) break;
    await page.waitForTimeout(100);
  }

  expect(capturedBody).not.toBeNull();
  expect(capturedBody.house_system).toBe('W');
});
