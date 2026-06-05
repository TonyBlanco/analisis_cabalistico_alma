import SiteLegalFooter from '@/components/public/SiteLegalFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-gray-800 mb-4 title-font">
            Holistica Aplicada
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Bienestar integral y desarrollo humano
          </p>
          <p className="text-base text-gray-500 mb-8 max-w-2xl mx-auto">
            Plataforma integral para exploracion, conciencia y acompanamiento en sabidurias ancestrales.
          </p>
          <div className="flex justify-center">
            <a
              href="/login"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-colors text-sm font-medium"
            >
              Acceder a la plataforma
            </a>
          </div>
        </div>
      </div>
      <SiteLegalFooter />
    </div>
  );
}
