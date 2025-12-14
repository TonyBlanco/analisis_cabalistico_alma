'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, Sparkles, Bell, BellOff } from 'lucide-react';
import angelsData from '@/data/seventyTwoAngels.json';
import { calculateGuardianAngel, formatPresidingDates, type Angel } from '@/lib/angels-system';

interface AngelCalendarProps {
  onDateSelect?: (date: Date, angel: Angel | null) => void;
  showNotifications?: boolean;
}

export default function AngelCalendar({ onDateSelect, showNotifications = true }: AngelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Set<string>>(new Set());

  const angels = angelsData as Angel[];

  // Obtener primer y último día del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    const angel = calculateGuardianAngel(date, angels);
    if (onDateSelect) {
      onDateSelect(date, angel);
    }
  };

  const getAngelForDate = (day: number): Angel | null => {
    const date = new Date(year, month, day);
    return calculateGuardianAngel(date, angels);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const toggleNotification = (dateKey: string) => {
    const newNotifications = new Set(notifications);
    if (newNotifications.has(dateKey)) {
      newNotifications.delete(dateKey);
    } else {
      newNotifications.add(dateKey);
    }
    setNotifications(newNotifications);
    
    // Aquí podrías guardar en localStorage o enviar al backend
    localStorage.setItem('angelNotifications', JSON.stringify(Array.from(newNotifications)));
  };

  // Crear array de días del calendario (incluyendo días vacíos del inicio)
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const selectedAngel = selectedDate ? getAngelForDate(selectedDate.getDate()) : null;

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-blue-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header del calendario */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-purple-300" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-purple-300 text-sm mt-1">Calendario de los 72 Ángeles</p>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-purple-300" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-purple-300 text-sm font-semibold py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const angel = getAngelForDate(day);
            const dateKey = `${year}-${month}-${day}`;
            const hasNotification = notifications.has(dateKey);

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square rounded-lg p-2 cursor-pointer transition-all duration-200
                  ${isToday(day) ? 'ring-2 ring-purple-500' : ''}
                  ${isSelected(day) 
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white scale-105 shadow-lg shadow-purple-500/50' 
                    : 'bg-slate-800/50 hover:bg-slate-700/70 text-gray-300'
                  }
                  ${angel ? 'border border-purple-500/30' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-bold ${isToday(day) && !isSelected(day) ? 'text-purple-400' : ''}`}>
                      {day}
                    </span>
                    {angel && (
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  
                  {angel && (
                    <div className="mt-auto">
                      <p className="text-[10px] font-semibold truncate">
                        {angel.name.en}
                      </p>
                    </div>
                  )}

                  {showNotifications && hasNotification && (
                    <Bell className="w-3 h-3 text-green-400 mt-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información del día seleccionado */}
      {selectedDate && selectedAngel && (
        <div className="p-6 border-t border-purple-500/30 bg-purple-950/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-purple-300 text-sm mb-1">
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <h3 className="text-2xl font-bold text-white mb-1">
                {selectedAngel.name.en}
              </h3>
              <p className="text-xl text-purple-200 font-hebrew">
                {selectedAngel.name.he}
              </p>
            </div>
            
            {showNotifications && (
              <button
                onClick={() => toggleNotification(`${year}-${month}-${selectedDate.getDate()}`)}
                className={`p-3 rounded-lg transition-all ${
                  notifications.has(`${year}-${month}-${selectedDate.getDate()}`)
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
                title={notifications.has(`${year}-${month}-${selectedDate.getDate()}`) 
                  ? 'Desactivar notificación' 
                  : 'Activar notificación'
                }
              >
                {notifications.has(`${year}-${month}-${selectedDate.getDate()}`) 
                  ? <Bell className="w-5 h-5" />
                  : <BellOff className="w-5 h-5" />
                }
              </button>
            )}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-purple-300 text-sm mb-2">Atributo Divino</p>
            <p className="text-white">
              {selectedAngel.attribute.en}
            </p>
          </div>

          <button
            onClick={() => window.location.href = `/angels/${selectedAngel.name.en.toLowerCase()}`}
            className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Ver meditación y detalles
          </button>
        </div>
      )}

      {/* Leyenda */}
      <div className="p-4 border-t border-purple-500/30 bg-slate-900/30">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-600 to-blue-600" />
            <span className="text-gray-400">Día seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-purple-500" />
            <span className="text-gray-400">Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-gray-400">Presidencia angélica</span>
          </div>
          {showNotifications && (
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Notificación activa</span>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .font-hebrew {
          font-family: 'David Libre', 'Times New Roman', serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
