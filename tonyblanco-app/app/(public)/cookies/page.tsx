import Script from 'next/script';
import LegalPageLayout from '@/components/public/LegalPageLayout';

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Política de Cookies" updatedAt="5 de junio de 2026">
      <p>
        Studios33 utiliza cookies y tecnologías equivalentes para asegurar el funcionamiento básico del
        sitio, recordar preferencias y gestionar el consentimiento cuando corresponda.
      </p>
      <h2>Tipos de cookies</h2>
      <ul>
        <li>Cookies técnicas necesarias para autenticación y navegación.</li>
        <li>Cookies de preferencias para recordar opciones del usuario.</li>
        <li>Cookies de analítica o gestión de consentimiento si están habilitadas.</li>
      </ul>
      <h2>Gestión del consentimiento</h2>
      <p>
        El sitio integra un gestor de cookies configurable por script externo. Puedes aceptar, rechazar o
        revisar tus preferencias desde el banner o panel que se muestre en la web.
      </p>
      <h2>Cómo desactivarlas</h2>
      <p>
        También puedes limitar o bloquear cookies desde la configuración de tu navegador, aunque algunas
        funciones podrían dejar de estar disponibles.
      </p>
      <h2>Declaración de cookies</h2>
      <p>
        A continuación se muestra la declaración detallada de cookies detectadas en el sitio.
      </p>
      <Script
        id="cookie-declaration-report"
        src="https://report.cookie-script.com/r/3137ed99ea4d07a01c82e4a6a5b6e414.js"
        strategy="afterInteractive"
        charSet="UTF-8"
        data-cookiescriptreport="report"
      />
    </LegalPageLayout>
  );
}
