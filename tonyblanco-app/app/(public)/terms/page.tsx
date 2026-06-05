import LegalPageLayout from '@/components/public/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones" updatedAt="5 de junio de 2026">
      <p>
        El acceso y uso de Studios33 implica la aceptación de estas condiciones. La plataforma se ofrece
        para acompañamiento, organización y uso profesional o personal conforme a las funcionalidades
        disponibles en cada cuenta.
      </p>
      <h2>Uso permitido</h2>
      <ul>
        <li>No usar el servicio para actividades ilícitas o contrarias a la buena fe.</li>
        <li>No intentar acceder a datos, cuentas o áreas no autorizadas.</li>
        <li>Usar la información generada con criterio profesional y revisión humana cuando aplique.</li>
      </ul>
      <h2>Disponibilidad</h2>
      <p>
        Podemos actualizar, modificar o interrumpir funciones por mantenimiento, seguridad o evolución del
        producto.
      </p>
      <h2>Responsabilidad</h2>
      <p>
        Salvo que la ley disponga lo contrario, la plataforma se ofrece como herramienta de apoyo y no
        sustituye asesoramiento médico, psicológico, legal o financiero.
      </p>
      <h2>Cuenta y seguridad</h2>
      <p>
        Cada usuario es responsable de custodiar sus credenciales y notificar cualquier uso no autorizado
        de su cuenta.
      </p>
    </LegalPageLayout>
  );
}
