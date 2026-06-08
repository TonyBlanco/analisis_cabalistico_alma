import { redirect } from "next/navigation";

/** Legacy route — canonical module is `stress-regulation` (DB + FE). */
export default function StressLegacyRedirectPage() {
  redirect("/dashboard/patient/tests/stress-regulation");
}