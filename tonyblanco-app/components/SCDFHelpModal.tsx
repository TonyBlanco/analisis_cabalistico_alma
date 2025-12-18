'use client';

import LegacySCDFHelpModal from '../_legacy_components_backup/SCDFHelpModal';

// Bridge to legacy SCDF help modal without modifying legacy code.
export default function SCDFHelpModal(props: any) {
  return <LegacySCDFHelpModal {...props} />;
}
