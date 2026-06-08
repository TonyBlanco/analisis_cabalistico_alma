import { redirect } from "next/navigation";

/** Legacy results route — canonical module is `stress-regulation`. */
export default function StressLegacyResultRedirectPage() {
  redirect("/dashboard/patient/tests/stress-regulation/result");
}