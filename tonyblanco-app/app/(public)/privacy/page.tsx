import LegalPageLayout from '@/components/public/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" updatedAt="5 de junio de 2026">
      <p>
        En Studios33 tratamos los datos personales con el objetivo de prestar acceso a la plataforma,
        gestionar cuentas, proteger la seguridad del servicio y atender solicitudes de soporte.
      </p>
      <h2>Datos que podemos tratar</h2>
      <ul>
        <li>Datos de cuenta y autenticación.</li>
        <li>Datos de uso necesarios para operar la plataforma.</li>
        <li>Información que el usuario aporta de forma voluntaria en formularios o sesiones.</li>
      </ul>
      <h2>Finalidad del tratamiento</h2>
      <ul>
        <li>Permitir el acceso a funciones contratadas o habilitadas.</li>
        <li>Mantener la seguridad, trazabilidad y soporte operativo.</li>
        <li>Cumplir obligaciones legales aplicables.</li>
      </ul>
      <h2>Cookies y tecnologías similares</h2>
      <p>
        Este sitio puede usar cookies técnicas, analíticas o de consentimiento a través del gestor de
        cookies configurado en el sitio. Puedes ampliar la información en la política de cookies.
      </p>
      <h2>Derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación, supresión o limitación del tratamiento escribiendo a los
        canales de contacto habilitados por la organización.
      </p>
    </LegalPageLayout>
  );
}
