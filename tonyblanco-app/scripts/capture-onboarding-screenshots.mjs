import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../docs/screenshots/onboarding-pr28');
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3456';

const onboardingPending = {
  steps: {
    profile_complete: false,
    has_patient: false,
    has_tree_analysis: false,
  },
  all_backend_complete: false,
};

const onboardingPartial = {
  steps: {
    profile_complete: true,
    has_patient: true,
    has_tree_analysis: false,
  },
  all_backend_complete: false,
};

const emptyWorkload = {
  summary: {
    patients_active: 0,
    tests_assigned_total: 0,
    tests_pending_total: 0,
    tests_completed_total: 0,
    action_items_total: 0,
  },
  patients: [],
  action_items: [],
};

const dashboardPayload = {
  total_patients: 0,
  sessions_this_month: 0,
  fichas_this_month: 0,
  recent_sessions: [],
  subscription_status: 'active',
  subscription_end_date: null,
  workload: emptyWorkload,
};

const metricsPayload = {
  kpi: {
    total_patients: 0,
    active_patients_30d: 0,
    sessions_this_month: 0,
    fichas_this_month: 0,
    new_patients_30d: 0,
  },
  sessions_by_month: [],
  fichas_by_month: [],
  therapy_status_breakdown: {},
  consent_breakdown: { with_consent: 0, without_consent: 0 },
};

const hybridMetricsPayload = {
  kpi: {
    sessions_started: 0,
    interpretations_generated: 0,
    interpretations_accepted: 0,
    exercises_completed: 0,
    anti_fraud_blocks: 0,
    notes_created: 0,
  },
  kpi_this_month: {
    sessions_started: 0,
    interpretations_generated: 0,
    interpretations_accepted: 0,
    exercises_completed: 0,
    anti_fraud_blocks: 0,
    notes_created: 0,
  },
  events_by_month: [],
  by_workspace: {},
  role_breakdown: { observational: 0, clinical: 0 },
};

const aiUsagePayload = {
  billing_period: '2026-06',
  included_credit_eur: '10.00',
  consumed_eur: '0.00',
  remaining_eur: '10.00',
  overage_eur: '0.00',
  total_tokens: 0,
  by_task_type: {},
  metering_enforced: false,
  event_count: 0,
};

const sessionUser = {
  id: 9001,
  username: 'onboarding_demo',
  email: 'onboarding_demo@test.com',
  first_name: 'Demo',
  last_name: 'Terapeuta',
  user_type: 'therapist',
  profile: { user_type: 'therapist', full_name: 'Demo Terapeuta', is_admin: false },
};

async function mockTherapistApis(page, onboardingBody) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (!url.includes('/api/')) {
      return route.continue();
    }

    if (url.includes('/therapist/onboarding/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(onboardingBody),
      });
    }

    if (url.includes('/therapist/metrics/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(metricsPayload),
      });
    }

    if (url.includes('/therapist/hybrid-metrics/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hybridMetricsPayload),
      });
    }

    if (url.includes('/therapist/ai-usage/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(aiUsagePayload),
      });
    }

    if (url.includes('/therapist/dashboard/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dashboardPayload),
      });
    }

    if (url.includes('/therapist/patients/invitations')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    if (url.includes('/therapist/patients')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    if (url.includes('/me/') || url.includes('/check-membership/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sessionUser),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

async function seedAuth(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('authToken', 'screenshot-demo-token');
    window.localStorage.setItem('userRole', 'therapist');
    window.localStorage.setItem('active_role', 'therapist');
    window.localStorage.removeItem('therapist_learning_landing_seen_v1');
    window.localStorage.removeItem('therapist_onboarding_checklist_dismissed_v1_9001');
  });
}

async function dismissCookieBanner(page) {
  const reject = page.getByRole('button', { name: /rechazar todo/i });
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
    await page.waitForTimeout(500);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });

  // 1) Dashboard checklist — todos pendientes
  {
    const page = await context.newPage();
    await seedAuth(page);
    await mockTherapistApis(page, onboardingPending);
    await page.goto(`${BASE_URL}/dashboard/therapist`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await page.getByRole('heading', { name: /configura tu espacio/i }).waitFor({ timeout: 30000 });
    await page.screenshot({
      path: path.join(OUT_DIR, '01-dashboard-checklist-pendiente.png'),
      fullPage: false,
    });
    await page.close();
  }

  // 2) Lista consultantes vacía
  {
    const page = await context.newPage();
    await seedAuth(page);
    await mockTherapistApis(page, onboardingPending);
    await page.goto(`${BASE_URL}/dashboard/therapist/patients`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await page.getByRole('heading', { name: /aún no tienes consultantes/i }).waitFor({ timeout: 30000 });
    await page.screenshot({
      path: path.join(OUT_DIR, '02-pacientes-empty-state.png'),
      fullPage: false,
    });
    await page.close();
  }

  // 3) Checklist con progreso parcial
  {
    const page = await context.newPage();
    await seedAuth(page);
    await mockTherapistApis(page, onboardingPartial);
    await page.goto(`${BASE_URL}/dashboard/therapist`, { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await page.getByText(/2 de 4 completados/i).waitFor({ timeout: 30000 });
    await page.screenshot({
      path: path.join(OUT_DIR, '03-dashboard-checklist-parcial.png'),
      fullPage: false,
    });
    await page.close();
  }

  await browser.close();
  console.log(`Screenshots saved to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});