# Admin Workspace (Protected)

## Overview

The platform includes a dedicated admin workspace at:

- Frontend route: `/dashboard/admin`

This workspace is **admin-only** and must render in its **own isolated UI shell** (it must not inherit the multi-role dashboard sidebar/header).

---

## Access Rules

### Frontend guard
- The page at `/dashboard/admin` checks the current session and role.
- If the resolved role is not `admin`, it shows **Acceso denegado**.

### Backend role precedence
A user should resolve as `admin` when any of the following are true:
- `user.is_superuser == True`
- `user.is_staff == True`
- `profile.is_admin == True`
- Special case username: `supertony`

This precedence is applied in the responses used by the frontend role resolution (e.g. `/api/me`, membership checks, and login token role response).

---

## Backend Endpoints Used (Existing Only)

The admin workspace only consumes already-existing admin endpoints:

- `GET /api/admin/check/`
  - Health / permission check for admin access.
- `GET /api/admin/stats/`
  - Admin overview stats.
- `GET /api/admin/users/`
  - List users.
- `GET /api/admin/users/<id>/`
  - Fetch a specific user detail (best-effort for fresh data).
- `PATCH /api/admin/users/<id>/`
  - Update user fields (used for `is_active` and `email`).
- `DELETE /api/admin/users/<id>/`
  - Delete a user.

---

## Supported Admin Actions (UI)

- View admin stats and system status.
- List users.
- Open user detail drawer (best-effort detail fetch).
- Toggle `is_active` (optimistic UI with rollback on error).
- Update user `email` (optimistic UI + best-effort refresh via detail fetch).
- Delete user (explicit confirm + optimistic remove + rollback on error).

Notes:
- Role change is implemented as **best-effort** via `PATCH` and may fail depending on backend support.

---

## Frontend Implementation Notes

Key files:
- `tonyblanco-app/app/(dashboard)/dashboard/admin/page.tsx`
  - Admin-only guard and entry.
- `tonyblanco-app/app/(dashboard)/layout.tsx`
  - Ensures `/dashboard/admin` bypasses the global dashboard shell.
- `tonyblanco-app/components/admin/*`
  - Admin UI shell (professional grouped sidebar) and workspace panels.
- `tonyblanco-app/lib/admin-api.ts`
  - Safe admin API wrappers that only call the allowed endpoints.
- `tonyblanco-app/lib/contracts/adminWorkspace.v1.ts`
  - Contract normalizer to keep UI resilient to backend shape changes.

---

## Governance

- No new routes beyond `/dashboard/admin`.
- No new backend endpoints are introduced.
- All calls are scoped to the existing admin endpoints.
- UI actions fail safely and surface errors without leaking privileged UI to non-admin users.
