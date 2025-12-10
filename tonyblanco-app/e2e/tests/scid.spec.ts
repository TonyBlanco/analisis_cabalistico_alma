import { test, expect } from '@playwright/test';

test('Therapist completes SCID-5 and saves result', async ({ page }) => {
  // This test assumes the app is running and the user has an active therapist account
  // and that the e2e environment has a test user and server running locally.

  await page.goto('/tests/scid5');

  // Enter client details
  await page.fill('input[placeholder="Nombre *"]', 'E2E Paciente');
  await page.fill('input[placeholder="Edad *"]', '35');
  // select initial type
  await page.selectOption('select', 'inicial');

  // Respond to Overview items
  await page.click('input[name="qA1"][value="3"]');
  await page.click('input[name="qA2"][value="2"]');

  // Go to next module
  await page.click('button:has-text("Siguiente Módulo")');

  // Respond to mood items - set enough items to trigger MDE
  await page.click('input[name="qB1"][value="3"]');
  await page.click('input[name="qB2"][value="3"]');
  await page.click('input[name="qB3"][value="3"]');
  await page.click('input[name="qB4"][value="3"]');
  await page.click('input[name="qB5"][value="3"]');

  // Finalize and submit
  await page.click('button:has-text("Generar Resultados")');

  // We expect the JSON preview to contain SCID code and MDE diagnosis
  await expect(page.locator('pre')).toContainText('SCID-');
  await expect(page.locator('pre')).toContainText('MDE');
});
