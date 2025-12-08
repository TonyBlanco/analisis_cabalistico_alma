// lib/api.ts
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CalculoRequest {
  nombre: string;
  dia: number;
  mes: number;
  anio: number;
  sistema?: string;
}

export interface CalculoResponse {
  numeros_principales: {
    esencia: {
      valor: string;
      numero: number;
      tipo: string;
      arbol: any;
    };
    expresion: {
      valor: string;
      numero: number;
      tipo: string;
      arbol: any;
    };
    herencia: {
      valor: string;
      numero: number;
      tipo: string;
      arbol: any;
    };
    destino: {
      valor: string;
      numero: number;
      tipo: string;
      arbol: any;
    };
    camino_vida: {
      valor: number;
      descripcion: string;
    };
  };
  inclusion_base: {
    casas: Record<number, number>;
    dominantes: number[];
    ausentes: number[];
    maestrias: number[];
  };
  // ... otros campos del response
}

export async function calcularAnalisisCabalistico(data: CalculoRequest): Promise<CalculoResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario no autenticado. Inicia sesión para continuar.');
  }

  const response = await fetch(`${API_BASE_URL}/api/calcular/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error: any = new Error(errorData.detalle || errorData.error || 'Error desconocido');
    error.response = { data: errorData };
    
    if (response.status === 401) {
      error.message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (response.status === 403) {
      error.message = errorData.detalle || 'Acceso denegado';
    } else if (response.status === 400) {
      error.message = errorData.detalle || errorData.error || 'Datos inválidos';
    }
    
    throw error;
  }

  return response.json();
}