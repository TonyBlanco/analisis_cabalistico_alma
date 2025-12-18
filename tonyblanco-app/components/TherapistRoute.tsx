'use client';

import LegacyTherapistRoute from '../_legacy_components_backup/TherapistRoute';

// Bridge to legacy therapist route guard without modifying legacy code.
export default function TherapistRoute(props: any) {
  return <LegacyTherapistRoute {...props} />;
}
