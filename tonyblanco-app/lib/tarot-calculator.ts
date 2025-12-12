/**
 * Calculadora de Arcano de Vida basado en la fecha de nacimiento
 * Fórmula: Suma todos los dígitos de la fecha -> Reduce a 1-22
 */

/**
 * Calcula el Arcano de Vida a partir de una fecha de nacimiento
 * @param birthDate Fecha en formato YYYY-MM-DD o Date object
 * @returns Número del arcano (0-21)
 */
export function calculateLifeArcana(birthDate: string | Date): number {
  let date: Date;
  
  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else {
    date = birthDate;
  }
  
  // Extraer día, mes y año
  const day = date.getDate();
  const month = date.getMonth() + 1; // getMonth() retorna 0-11
  const year = date.getFullYear();
  
  // Sumar todos los dígitos
  const sum = sumDigits(day) + sumDigits(month) + sumDigits(year);
  
  // Reducir a 1-22 (0-21 en índice)
  return reduceToArcana(sum);
}

/**
 * Suma los dígitos de un número hasta obtener un solo dígito
 */
function sumDigits(num: number): number {
  let sum = 0;
  let numStr = num.toString();
  
  for (let i = 0; i < numStr.length; i++) {
    sum += parseInt(numStr[i], 10);
  }
  
  return sum;
}

/**
 * Reduce un número a un rango de 0-21 (arcanos del Tarot)
 * Si el resultado es 0, retorna 0 (El Loco)
 * Si es mayor a 21, reduce sumando los dígitos
 */
function reduceToArcana(num: number): number {
  if (num === 0) return 0;
  if (num >= 1 && num <= 21) return num;
  
  // Si es mayor a 21, reducir sumando dígitos
  let reduced = num;
  while (reduced > 21) {
    reduced = sumDigits(reduced);
  }
  
  // Si después de reducir sigue siendo mayor a 21, reducir una vez más
  if (reduced > 21) {
    reduced = sumDigits(reduced);
  }
  
  return reduced;
}

/**
 * Calcula el Arcano de Vida desde un string de fecha
 * Maneja formatos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
 */
export function calculateLifeArcanaFromString(dateString: string): number | null {
  try {
    // Intentar parsear diferentes formatos
    let date: Date;
    
    // Formato YYYY-MM-DD
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Si el primer elemento tiene 4 dígitos, es YYYY-MM-DD
        if (parts[0].length === 4) {
          date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // DD-MM-YYYY
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } else {
        return null;
      }
    }
    // Formato DD/MM/YYYY
    else if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        return null;
      }
    } else {
      return null;
    }
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return calculateLifeArcana(date);
  } catch (error) {
    console.error('Error calculando Arcano de Vida:', error);
    return null;
  }
}

