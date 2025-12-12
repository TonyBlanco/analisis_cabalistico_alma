'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, TestTube, Home, LogOut, Settings, CreditCard, FileText, Menu, X, ShoppingBag, Activity, Users, Video, MessageSquare, MessageCircle } from 'lucide-react';

interface UserProfile {
  username: string;
  full_name?: string;
  email: string;
  user_type: string;
}

export default function MainNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const loadUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/me/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/dashboard/personal', color: 'text-[#D4AF37]' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', color: 'text-orange-400' },
    { icon: Users, label: 'Pacientes', path: '/patients', color: 'text-cyan-400' },
    { icon: Activity, label: 'Bienestar', path: '/wellness', color: 'text-pink-400' },
    { icon: TestTube, label: 'Tests', path: '/tests', color: 'text-purple-400' },
    { icon: FileText, label: 'Resultados', path: '/tests/results', color: 'text-blue-400' },
    { icon: User, label: 'Mi Cuenta', path: '/dashboard/account', color: 'text-green-400' },
    { icon: CreditCard, label: 'Suscripción', path: '/pricing', color: 'text-yellow-400' },
  ];

  // Determine if we're on landing page or dashboard
  const isLanding = pathname === '/';
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLoginOrRegister = pathname === '/login' || pathname === '/register';

  // Don't show nav on login/register pages
  if (isLoginOrRegister) {
    return null;
  }

  // On dashboard pages, hide nav (they have their own navigation)
  if (isDashboard) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isLanding 
            ? 'bg-black/50 backdrop-blur-md border-b border-white/10' 
            : 'border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => router.push(isLanding ? '/' : '/dashboard/personal')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span 
                className={`text-2xl font-light title-font ${isLanding ? 'text-white' : ''}`}
                style={{ color: isLanding ? '#D4AF37' : '#D4AF37' }}
              >
                ✨ Mi Camino del Alma
              </span>
            </button>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === item.path
                      ? isLanding 
                        ? 'bg-white/10 text-white' 
                        : 'bg-slate-800 text-white'
                      : isLanding
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${pathname === item.path ? item.color : isLanding ? 'text-white/70' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}

              {/* Quick Communication Tools */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                <button
                  onClick={() => window.open('https://zoom.us/start/videomeeting', '_blank')}
                  className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                  title="Iniciar Zoom"
                >
                  <Video className="w-4 h-4 text-blue-400" />
                </button>
                
                <button
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  className="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors"
                  title="Google Meet"
                >
                  <Video className="w-4 h-4 text-green-400" />
                </button>
                
                <button
                  onClick={() => window.open('https://chat.google.com', '_blank')}
                  className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
                  title="Google Chat"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </button>
                
                <button
                  onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 transition-colors"
                  title="WhatsApp Web"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* User Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {userProfile?.full_name?.[0] || userProfile?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {userProfile?.full_name || userProfile?.username || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400">@{userProfile?.username || 'user'}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">
                        {userProfile?.full_name || userProfile?.username}
                      </p>
                      <p className="text-xs text-gray-400">{userProfile?.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-xs text-purple-300">
                        {userProfile?.user_type === 'personal' ? '👤 Personal' : '👨‍⚕️ Terapeuta'}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/dashboard/personal');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <Home className="w-4 h-4" />
                        Mi Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push('/tests');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <TestTube className="w-4 h-4" />
                        Tests Disponibles
                      </button>
                      <button
                        onClick={() => {
                          router.push('/tests/results');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Mis Resultados
                      </button>
                    </div>

                    <div className="border-t border-slate-800 my-1"></div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/dashboard/account');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Mi Cuenta
                      </button>
                      <button
                        onClick={() => {
                          router.push('/pricing');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Suscripción
                      </button>
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </button>
                    </div>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav 
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isLanding 
            ? 'bg-black/50 backdrop-blur-md border-b border-white/10' 
            : 'border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.push(isLanding ? '/' : '/dashboard/personal')}
            className={`text-lg font-light title-font ${isLanding ? 'text-white' : ''}`}
            style={{ color: '#D4AF37' }}
          >
            ✨ Mi Camino
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-800 bg-slate-900 pb-4 animate-in slide-in-from-top-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {userProfile?.full_name?.[0] || userProfile?.username?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {userProfile?.full_name || userProfile?.username}
                  </p>
                  <p className="text-xs text-gray-400">{userProfile?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="px-2 pt-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    pathname === item.path
                      ? 'bg-slate-800 text-white'
                      : 'text-gray-300 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${pathname === item.path ? item.color : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 mx-2 my-2"></div>

            <div className="px-2 space-y-1">
              <button
                onClick={() => {
                  router.push('/settings');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-slate-800/50"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Configuración</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-8px); }
          to { transform: translateY(0); }
        }
        
        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
