"use client";

import { useEffect } from "react";

export default function SCDFRedirectPage() {
  useEffect(() => {
    window.location.href =
      "/_legacy_app_backup/(dashboard)/dashboard/tools/scdf";
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>SCDF — Seguimiento Clínico</h1>
      <p>Abriendo herramienta clínica…</p>
    </div>
  );
}
