# CHANGELOG — 2025-12-24

## Features

- **Tarot Workspace (Therapist)**: Added a standalone Tarot workspace available at `/dashboard/therapist/tarot` and enabled an explicit `Tarot Terapéutico` launcher in the therapist sidebar. The combined `Astrologia | Tarot` launcher remains **Proximamente** to avoid mixing flows.

- **E2E Test — Astrology House System**: Added Playwright E2E test `e2e/tests/astrology-house-system.spec.ts` which verifies the House System selector and the natal chart calculation POST includes the mapped `house_system` value. Tests include stubs for `/me/`, patient profile, GET chart (404), and capture of POST payload.

- **CI Workflow**: Added `.github/workflows/playwright-e2e.yml` to run Playwright tests on PRs/branches (install, build, start, test).

## Notes

- The test is currently stub-heavy for determinism in CI. A follow-up task is to add an integration suite that runs E2E tests against a seeded backend for higher fidelity.

- Manual verification steps performed: `npm run build` (frontend) and `npx playwright test e2e/tests/astrology-house-system.spec.ts` (local) — both passed locally.
