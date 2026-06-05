import Link from 'next/link';
import SiteLegalFooter from './SiteLegalFooter';

type LegalPageLayoutProps = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
};

export default function LegalPageLayout({ title, updatedAt, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm text-violet-700 hover:underline">
          ← Volver al inicio
        </Link>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Última actualización: {updatedAt}</p>
          <div className="prose prose-gray mt-8 max-w-none">{children}</div>
        </div>
      </div>
      <SiteLegalFooter />
    </div>
  );
}
