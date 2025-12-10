'use client';

import { Button } from '@/components/ui/button';
import { 
  Video, 
  MessageSquare, 
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import type { PatientInfo } from '@/types/patient';

interface CommunicationToolsProps {
  patient: PatientInfo;
}

export default function CommunicationTools({ patient }: CommunicationToolsProps) {
  const handleZoom = () => {
    // Abrir Zoom con el nombre del paciente como tema
    const zoomUrl = 'https://zoom.us/start/videomeeting';
    window.open(zoomUrl, '_blank');
  };

  const handleGoogleMeet = () => {
    // Crear nueva reunión de Google Meet
    const meetUrl = 'https://meet.google.com/new';
    window.open(meetUrl, '_blank');
  };

  const handleWhatsApp = () => {
    if (patient.phone) {
      // Limpiar número de teléfono (solo dígitos)
      const cleanPhone = patient.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Hola ${patient.name}, soy tu terapeuta. ¿Cómo te encuentras hoy?`);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Este paciente no tiene número de teléfono registrado');
    }
  };

  const handleEmail = () => {
    if (patient.email) {
      const subject = encodeURIComponent(`Seguimiento - ${patient.name}`);
      const body = encodeURIComponent(`Hola ${patient.name},\n\nEspero que te encuentres bien.\n\nSaludos,\nTu Terapeuta`);
      window.location.href = `mailto:${patient.email}?subject=${subject}&body=${body}`;
    } else {
      alert('Este paciente no tiene email registrado');
    }
  };

  const handlePhone = () => {
    if (patient.phone) {
      window.location.href = `tel:${patient.phone}`;
    } else {
      alert('Este paciente no tiene número de teléfono registrado');
    }
  };

  const handleGoogleChat = () => {
    // Abrir Google Chat
    const chatUrl = 'https://chat.google.com';
    window.open(chatUrl, '_blank');
  };

  const handleCalendar = () => {
    // Abrir Google Calendar para agendar cita
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1); // 1 hora desde ahora
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // Duración 1 hora
    
    const title = encodeURIComponent(`Sesión con ${patient.name}`);
    const details = encodeURIComponent(`Sesión terapéutica con ${patient.name}`);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
    window.open(calendarUrl, '_blank');
  };

  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Zoom */}
      <Button
        onClick={handleZoom}
        className="bg-blue-600 hover:bg-blue-700 flex-col h-auto py-3"
        title="Iniciar reunión en Zoom"
      >
        <Video className="w-5 h-5 mb-1" />
        <span className="text-xs">Zoom</span>
      </Button>

      {/* Google Meet */}
      <Button
        onClick={handleGoogleMeet}
        className="bg-green-600 hover:bg-green-700 flex-col h-auto py-3"
        title="Crear reunión en Google Meet"
      >
        <Video className="w-5 h-5 mb-1" />
        <span className="text-xs">Meet</span>
      </Button>

      {/* WhatsApp */}
      <Button
        onClick={handleWhatsApp}
        className="bg-emerald-600 hover:bg-emerald-700 flex-col h-auto py-3"
        title="Enviar WhatsApp"
        disabled={!patient.phone}
      >
        <MessageCircle className="w-5 h-5 mb-1" />
        <span className="text-xs">WhatsApp</span>
      </Button>

      {/* Google Chat */}
      <Button
        onClick={handleGoogleChat}
        className="bg-purple-600 hover:bg-purple-700 flex-col h-auto py-3"
        title="Abrir Google Chat"
      >
        <MessageSquare className="w-5 h-5 mb-1" />
        <span className="text-xs">Chat</span>
      </Button>

      {/* Email */}
      <Button
        onClick={handleEmail}
        className="bg-red-600 hover:bg-red-700 flex-col h-auto py-3"
        title="Enviar Email"
        disabled={!patient.email}
      >
        <Mail className="w-5 h-5 mb-1" />
        <span className="text-xs">Email</span>
      </Button>

      {/* Llamada */}
      <Button
        onClick={handlePhone}
        className="bg-cyan-600 hover:bg-cyan-700 flex-col h-auto py-3"
        title="Llamar por teléfono"
        disabled={!patient.phone}
      >
        <Phone className="w-5 h-5 mb-1" />
        <span className="text-xs">Llamar</span>
      </Button>

      {/* Agendar */}
      <Button
        onClick={handleCalendar}
        className="bg-amber-600 hover:bg-amber-700 flex-col h-auto py-3"
        title="Agendar en calendario"
      >
        <Calendar className="w-5 h-5 mb-1" />
        <span className="text-xs">Agendar</span>
      </Button>
    </div>
  );
}
