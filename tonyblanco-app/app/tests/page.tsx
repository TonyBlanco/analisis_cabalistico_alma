'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableTests } from '@/lib/test-api';
import { TestModule } from '@/lib/test-types';
import { TestDomain, getTestsByDomain, getTestDomain } from '@/lib/test-domains';
import { 
  Sparkles, Brain, Star, 
  Filter, Search, ArrowRight,
  BookOpen, Users, Shield
} from 'lucide-react';

export default function TestsCatalogPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<TestDomain | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState<'therapist' | 'personal' | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await getAvailableTests();
      setTests(data.tests || []);
      setUserType(data.user_type || null);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const domains: { value: TestDomain | 'all'; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'all', label: 'Todos', icon: <BookOpen className="h-5 w-5" />, color: 'bg-gray-100 hover:bg-gray-200' },
    { value: 'cabala', label: 'Cábala', icon: <Sparkles className="h-5 w-5" />, color: 'bg-purple-100 hover:bg-purple-200' },
    { value: 'psicologia', label: 'Psicología', icon: <Brain className="h-5 w-5" />, color: 'bg-blue-100 hover:bg-blue-200' },
    { value: 'astrologia', label: 'Astrología', icon: <Star className="h-5 w-5" />, color: 'bg-yellow-100 hover:bg-yellow-200' },
  ];

  const filteredTests = tests.filter(test => {
    const domain = getTestDomain(test.code);
    const matchesDomain = selectedDomain === 'all' || domain === selectedDomain;
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const getDomainColor = (domain: TestDomain | null) => {
    switch (domain) {
      case 'cabala': return 'border-purple-500 bg-purple-50';
      case 'psicologia': return 'border-blue-500 bg-blue-50';
      case 'astrologia': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getDomainLabel = (domain: TestDomain | null) => {
    switch (domain) {
      case 'cabala': return 'Cábala';
      case 'psicologia': return 'Psicología';
      case 'astrologia': return 'Astrología';
      default: return 'General';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Catálogo de Tests
          </h1>
          <p className="text-lg text-gray-600">
            Explora nuestros tests organizados por dominio
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtro por dominio */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <Filter className="h-4 w-4 inline mr-1" />
                Dominio
              </label>
              <div className="flex flex-wrap gap-2">
                {domains.map(domain => (
                  <button
                    key={domain.value}
                    onClick={() => setSelectedDomain(domain.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedDomain === domain.value
                        ? `${domain.color} border-2 border-blue-500`
                        : `${domain.color} border-2 border-transparent`
                    }`}
                  >
                    {domain.icon}
                    <span>{domain.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <Search className="h-4 w-4 inline mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => {
            const domain = getTestDomain(test.code);
            // Tests con páginas dedicadas
            let testUrl: string;
            if (test.code === 'scdf') {
              testUrl = '/dashboard/tools/scdf';
            } else if (test.code === 'scid5') {
              testUrl = '/tests/scid5';
            } else {
              testUrl = `/tests/${domain || 'cabala'}/${test.code}`;
            }
            return (
              <div
                key={test.code}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${getDomainColor(domain)} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => {
                  router.push(testUrl);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{test.icon || '📊'}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {test.name}
                      </h3>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                      {getDomainLabel(domain)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {test.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    {test.estimated_duration && (
                      <span>⏱️ {test.estimated_duration} min</span>
                    )}
                    {test.uses_per_month !== null && (
                      <span>
                        {test.uses_per_month === undefined 
                          ? '∞ usos/mes' 
                          : `${test.uses_per_month} usos/mes`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    test.required_access_level === 'free' 
                      ? 'bg-green-100 text-green-800'
                      : test.required_access_level === 'personal'
                      ? 'bg-blue-100 text-blue-800'
                      : test.required_access_level === 'professional'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {test.required_access_level === 'free' ? 'Gratis' :
                     test.required_access_level === 'personal' ? 'Personal' :
                     test.required_access_level === 'professional' ? 'Profesional' : 'Premium'}
                  </span>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                    Ver más
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron tests con los filtros seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
