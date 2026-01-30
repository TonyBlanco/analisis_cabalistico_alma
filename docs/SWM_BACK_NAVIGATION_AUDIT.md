# SWM Back Navigation — Audit & Best Practices

**Created:** 2026-01-30  
**Context:** After attempting to add a universal "Volver al inicio" link to all SWM pages, discovered that most workspace components already have their own integrated back navigation.

---

## ⚠️ Critical Finding

**DO NOT add `<TherapistBackLink />` to SWM pages whose workspace components already have internal "Volver" buttons.**

Most SWM workspace components have their own navigation integrated as part of the workspace UI design. Adding an external back link creates **duplicate navigation** and breaks UX consistency.

---

## Audit Results

### ✅ SWM Pages WITH Built-In "Volver" Button

These workspace **components** already include their own back navigation:

| SWM Page | Component | Back Button Location | Text |
|----------|-----------|---------------------|------|
| `bioemotional-experiencial-profunda/` | `BioEmotionalExperientialWorkspace` | Top of component | "← Volver al espacio clínico" |
| `transgeneracional-profundo/` | `TransgenerationalDeepWorkspace` | Top of component | "Volver al espacio clinico" |
| `sha/` | `SHAWorkspace` | Top of component (2 instances) | "Volver al espacio clínico" |
| `resonancia-ancestral/` | `ResonanciaAncestralWorkspace` | Top of component | "Volver al espacio clínico" |
| `cabala-aplicada/` | `CabalAppliedWorkspace` | Top of component | "Volver al espacio clinico" |
| `astrologia-tarot/` | `AstrologyTarotWorkspace` | Top of component | "Volver al espacio clinico" |
| `holistica-aplicada/` | (Phoenix Report - direct page component) | Fixed header | "Volver" (router.back()) |
| `swm/mcmi4/page.tsx` | (List page - direct page component) | Top section | "Volver" (Link to /dashboard/therapist) |

**Action Taken:** Removed `<TherapistBackLink />` from all these pages (was causing duplicates).

---

### 🟡 SWM Pages NEEDING External Back Link

These pages **do NOT** have built-in "Volver" in their workspace components:

| SWM Page | Component | Current State | Action |
|----------|-----------|---------------|--------|
| `therapist-config/` | `TherapistConfigWorkspace` | ❌ No back button | ✅ Added `<TherapistBackLink />` |
| `astrologia/` | `AstrologyProfessionalView` | ❌ No back button | ✅ Added `<TherapistBackLink />` |

**Action Taken:** Added `<TherapistBackLink />` wrapper to these two pages only.

---

### 🔴 Special Cases

| Page | Status | Notes |
|------|--------|-------|
| `mcmi4-mystic/` | Redirect-only | Immediately redirects to `/dashboard/therapist/swm/mcmi4` — no UI to add link to |
| `swm/mcmi4/[workspace_id]/` | Has inline Link | Already has "Volver a lista" link to parent list page |

---

## Best Practices for Future SWM Development

### 1. **Check Component Before Adding External Navigation**
```bash
# Search for existing "Volver" in component
grep -r "Volver" tonyblanco-app/components/<ComponentName>/
```

### 2. **Preferred Pattern: Internal Navigation**
Workspace components SHOULD include their own back navigation as part of their UI design:

```tsx
// GOOD: Navigation integrated in workspace component
export default function MyWorkspace() {
  const router = useRouter();
  
  return (
    <div>
      <header>
        <button onClick={() => router.push('/dashboard/therapist')}>
          ← Volver al espacio clínico
        </button>
      </header>
      {/* workspace content */}
    </div>
  );
}
```

### 3. **When to Use External `<TherapistBackLink />`**
Only when:
- Workspace component is **purely presentational** (no navigation logic)
- Component is **shared across contexts** (therapist/patient/personal)
- Page is a **simple wrapper** with no custom header/navigation

### 4. **Avoid Duplication**
Before adding external link:
1. Read component source code
2. Search for "Volver", "back", "Link", "router.push"
3. Visually test in browser
4. If component has internal nav → DO NOT add external `<TherapistBackLink />`

---

## Navigation Patterns by Type

### Pattern A: Internal Component Navigation (Preferred)
```tsx
// page.tsx
export default function MyPage() {
  return <MyWorkspace />; // Component handles its own nav
}

// MyWorkspace component
<Link href="/dashboard/therapist">← Volver</Link>
```

### Pattern B: External Page Wrapper (When needed)
```tsx
// page.tsx
import TherapistBackLink from '@/components/TherapistBackLink';

export default function MyPage() {
  return (
    <>
      <TherapistBackLink />
      <MyWorkspace /> {/* Component has NO internal nav */}
    </>
  );
}
```

### Pattern C: Custom Inline (Special cases)
```tsx
// holistica-aplicada/page.tsx
<button onClick={() => router.back()}>Volver</button>
```

---

## Commit History

- **2026-01-30**: Initial incorrect implementation — added `<TherapistBackLink />` to ALL SWM pages
- **2026-01-30**: Audit and correction — removed duplicates from 6 pages, kept only on 2 pages that needed it

---

## File Locations

- **Reusable component**: `tonyblanco-app/components/TherapistBackLink/index.tsx`
- **SWM pages directory**: `tonyblanco-app/app/(dashboard)/dashboard/therapist/(swm)/*/page.tsx`
- **Workspace components**: `tonyblanco-app/components/*Workspace*/`

---

## Checklist for New SWM

When creating a new SWM workspace:

- [ ] Does the workspace component include back navigation? (YES → done)
- [ ] Is the component purely presentational? (YES → add `<TherapistBackLink />`)
- [ ] Test visually: is there duplicate "Volver"? (YES → remove external link)
- [ ] Update this audit document with new SWM status

---

## Related Documentation

- `docs/SWM_THERAPIST_CONFIG.md` — Therapist Config workspace (uses external link)
- `docs/HOLISTIC_FEDERATION_POLICY.md` — Workspace isolation rules
- `docs/AGENT_ONBOARDING_README.md` — SWM architecture overview
