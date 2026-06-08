import { redirect } from 'next/navigation';

const DJANGO_ADMIN_URL =
  process.env.NEXT_PUBLIC_DJANGO_ADMIN_URL ?? 'https://api.studios33.app/admin/';

/** studios33.app/admin → Django admin en el subdominio API */
export default function DjangoAdminRedirectPage() {
  redirect(DJANGO_ADMIN_URL);
}
