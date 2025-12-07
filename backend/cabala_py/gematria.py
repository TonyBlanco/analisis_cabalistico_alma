# cabala_py/gematria.py
"""
Múltiples Sistemas de Gematría Cabalística
Incluye métodos hebreos, occidentales y modernos
"""

# ============================================================================
# 1. GEMATRÍA HEBREA CLÁSICA (Mispar Hechrachi)
# ============================================================================
# El sistema original usado en la Cábala judía
# Cada letra hebrea tiene un valor numérico específico

ALFABETO_HEBREO_CLASICO = {
    # Unidades (1-9)
    'א': 1,   # Alef
    'ב': 2,   # Bet
    'ג': 3,   # Gimel
    'ד': 4,   # Dalet
    'ה': 5,   # He
    'ו': 6,   # Vav
    'ז': 7,   # Zayin
    'ח': 8,   # Het
    'ט': 9,   # Tet
    
    # Decenas (10-90)
    'י': 10,  # Yod
    'כ': 20,  # Kaf
    'ל': 30,  # Lamed
    'מ': 40,  # Mem
    'נ': 50,  # Nun
    'ס': 60,  # Samekh
    'ע': 70,  # Ayin
    'פ': 80,  # Pe
    'צ': 90,  # Tzadi
    
    # Centenas (100-400)
    'ק': 100, # Qof
    'ר': 200, # Resh
    'ש': 300, # Shin
    'ת': 400, # Tav
    
    # Letras finales (mismo valor que la forma regular)
    'ך': 20,  # Kaf final
    'ם': 40,  # Mem final
    'ן': 50,  # Nun final
    'ף': 80,  # Pe final
    'ץ': 90   # Tzadi final
}


# ============================================================================
# 2. GEMATRÍA PITAGÓRICA (Reducción a 1-9)
# ============================================================================
# Sistema greco-romano basado en Pitágoras
# Usado en numerología occidental clásica

ALFABETO_PITAGORICO = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}


# ============================================================================
# 3. GEMATRÍA CALDEA (Sistema Babilónico)
# ============================================================================
# Uno de los sistemas más antiguos (3000+ años)
# No usa el 9 (considerado sagrado)
# Basado en vibraciones sonoras, no en orden alfabético

ALFABETO_CALDEO = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'U': 6, 'V': 6, 'W': 6,
    'O': 7, 'Z': 7,
    'F': 8, 'P': 8
    # Nota: No hay 9 en el sistema Caldeo
}


# ============================================================================
# 4. MÉTODO MARTINE COQUATRIX (Francés)
# ============================================================================
# Numeróloga francesa del siglo XX
# Adaptación para el alfabeto francés

ALFABETO_COQUATRIX = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}


# ============================================================================
# 5. MÉTODO DSHEVASTAN® (Español Moderno)
# ============================================================================
# Sistema moderno para español (ya definido en data.py)
# Incluye tratamiento especial de la Ñ

ALFABETO_DSHEVASTAN = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'Ñ': 7, 'O': 6, 'P': 8, 'Q': 9,
    'R': 9, 'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}


# ============================================================================
# 6. GEMATRÍA ORDINAL (Simple)
# ============================================================================
# Cada letra = su posición en el alfabeto (A=1, B=2, ... Z=26)

ALFABETO_ORDINAL = {
    chr(i): i - 64 for i in range(65, 91)  # A=1, B=2, ..., Z=26
}


# ============================================================================
# 7. GEMATRÍA INGLESA/SIMPLE (English Gematria)
# ============================================================================
# Sistema desarrollado para el inglés moderno
# A=1, B=2, C=3... Z=26

ALFABETO_INGLES_SIMPLE = ALFABETO_ORDINAL.copy()


# ============================================================================
# 8. GEMATRÍA INVERSA (Reversed)
# ============================================================================
# Orden inverso: Z=1, Y=2, ... A=26
# Usado en cálculos cabalísticos avanzados

ALFABETO_INVERSO = {
    chr(i): 26 - (i - 65) for i in range(65, 91)  # Z=1, Y=2, ..., A=26
}


# ============================================================================
# 9. GEMATRÍA HEBRAICA OCCIDENTAL (Sefer Yetzirah)
# ============================================================================
# Adaptación occidental del sistema hebreo para alfabeto latino

ALFABETO_HEBRAICO_OCCIDENTAL = {
    # Madres (3 letras primordiales)
    'A': 1,   'M': 40,  'S': 300,
    
    # Dobles (7 letras con doble pronunciación)
    'B': 2,   'G': 3,   'D': 4,   'K': 20,
    'P': 80,  'R': 200, 'T': 400,
    
    # Simples (12 letras restantes)
    'H': 5,   'V': 6,   'Z': 7,   'Ch': 8,  'Tz': 9,
    'I': 10,  'L': 30,  'N': 50,  'X': 60,
    'O': 70,  'F': 90,  'Q': 100,
    
    # Complementarias
    'C': 3,   'E': 5,   'J': 10,  'U': 6,
    'W': 6,   'Y': 10
}


# ============================================================================
# 10. SISTEMA DE LOS 22 ARCANOS (Tarot Cabalístico)
# ============================================================================
# Cada letra corresponde a un Arcano Mayor del Tarot
# Valores 1-22 (no se reduce)

ALFABETO_TAROT = {
    'A': 1,  'B': 2,  'C': 3,  'D': 4,  'E': 5,  'F': 6,
    'G': 7,  'H': 8,  'I': 9,  'J': 10, 'K': 11, 'L': 12,
    'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18,
    'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 1,  'X': 2,
    'Y': 3,  'Z': 4
}


# ============================================================================
# FUNCIONES DE CÁLCULO UNIVERSAL
# ============================================================================

def calcular_gematria(texto, sistema='pitagorico'):
    """
    Calcula el valor gemátrico de un texto según el sistema especificado.
    
    Args:
        texto: Cadena de texto a calcular
        sistema: Nombre del sistema a usar
        
    Returns:
        dict: Resultado con suma total y desglose
    """
    sistemas = {
        'hebreo': ALFABETO_HEBREO_CLASICO,
        'pitagorico': ALFABETO_PITAGORICO,
        'caldeo': ALFABETO_CALDEO,
        'coquatrix': ALFABETO_COQUATRIX,
        'dshevastan': ALFABETO_DSHEVASTAN,
        'ordinal': ALFABETO_ORDINAL,
        'ingles': ALFABETO_INGLES_SIMPLE,
        'inverso': ALFABETO_INVERSO,
        'hebraico_occidental': ALFABETO_HEBRAICO_OCCIDENTAL,
        'tarot': ALFABETO_TAROT
    }
    
    if sistema not in sistemas:
        raise ValueError(f"Sistema '{sistema}' no reconocido. Opciones: {list(sistemas.keys())}")
    
    alfabeto = sistemas[sistema]
    texto_limpio = ''.join(c for c in texto.upper() if c.isalpha() or c in alfabeto)
    
    valores = []
    suma_total = 0
    
    for letra in texto_limpio:
        valor = alfabeto.get(letra, 0)
        if valor > 0:
            valores.append((letra, valor))
            suma_total += valor
    
    return {
        'texto': texto,
        'sistema': sistema,
        'suma_total': suma_total,
        'valores': valores,
        'cantidad_letras': len(valores)
    }


def comparar_sistemas(texto, sistemas_a_comparar=None):
    """
    Calcula y compara el mismo texto en múltiples sistemas.
    
    Args:
        texto: Texto a analizar
        sistemas_a_comparar: Lista de sistemas (None = todos)
        
    Returns:
        dict: Resultados de todos los sistemas
    """
    if sistemas_a_comparar is None:
        sistemas_a_comparar = [
            'pitagorico', 'caldeo', 'dshevastan', 
            'ordinal', 'coquatrix'
        ]
    
    resultados = {}
    
    for sistema in sistemas_a_comparar:
        try:
            resultados[sistema] = calcular_gematria(texto, sistema)
        except Exception as e:
            resultados[sistema] = {'error': str(e)}
    
    return resultados


def analisis_gemátrico_completo(nombre_completo, fecha_nacimiento=None):
    """
    Realiza un análisis gemátrico completo usando múltiples sistemas.
    
    Args:
        nombre_completo: Nombre a analizar
        fecha_nacimiento: Tupla (dia, mes, anio) opcional
        
    Returns:
        dict: Análisis completo multi-sistema
    """
    # Separar componentes del nombre
    partes = nombre_completo.strip().split()
    
    analisis = {
        'nombre_completo': nombre_completo,
        'sistemas': {},
        'comparativa': []
    }
    
    # Calcular con cada sistema
    sistemas = ['pitagorico', 'caldeo', 'dshevastan', 'ordinal']
    
    for sistema in sistemas:
        resultado = calcular_gematria(nombre_completo, sistema)
        analisis['sistemas'][sistema] = resultado
        
        analisis['comparativa'].append({
            'sistema': sistema,
            'valor': resultado['suma_total']
        })
    
    # Ordenar por valor
    analisis['comparativa'].sort(key=lambda x: x['valor'])
    
    return analisis


# ============================================================================
# INFORMACIÓN DE LOS SISTEMAS
# ============================================================================

INFORMACION_SISTEMAS = {
    'hebreo': {
        'nombre': 'Gematría Hebrea Clásica (Mispar Hechrachi)',
        'origen': 'Cábala Judía Tradicional',
        'antigüedad': '~2000+ años',
        'uso': 'Análisis de textos sagrados hebreos (Torá, Talmud)',
        'caracteristicas': 'Valores 1-400, sistema base de la Cábala'
    },
    'pitagorico': {
        'nombre': 'Gematría Pitagórica',
        'origen': 'Grecia Antigua - Pitágoras',
        'antigüedad': '~500 BCE',
        'uso': 'Numerología occidental clásica',
        'caracteristicas': 'Reducción a 1-9, base de la numerología moderna'
    },
    'caldeo': {
        'nombre': 'Sistema Caldeo',
        'origen': 'Babilonia Antigua',
        'antigüedad': '~3000+ años',
        'uso': 'Análisis vibracional del sonido',
        'caracteristicas': 'No usa el 9, basado en fonética'
    },
    'dshevastan': {
        'nombre': 'Método Dshevastan®',
        'origen': 'España - Sistema Moderno',
        'antigüedad': '1995+',
        'uso': 'Numerología cabalística en español',
        'caracteristicas': 'Adaptado al español, incluye Ñ'
    },
    'ordinal': {
        'nombre': 'Gematría Ordinal Simple',
        'origen': 'Sistema Universal',
        'antigüedad': 'Moderno',
        'uso': 'Análisis básico, fácil de calcular',
        'caracteristicas': 'A=1, B=2... Z=26'
    },
    'coquatrix': {
        'nombre': 'Método Coquatrix',
        'origen': 'Francia - Martine Coquatrix',
        'antigüedad': 'Siglo XX',
        'uso': 'Numerología francesa, Inclusión de Base',
        'caracteristicas': 'Sistema de las 9 casas'
    }
}


def obtener_info_sistema(sistema):
    """Retorna información sobre un sistema específico."""
    return INFORMACION_SISTEMAS.get(sistema, {
        'nombre': sistema,
        'info': 'Sistema no documentado'
    })


# ============================================================================
# EXPORTACIONES
# ============================================================================

__all__ = [
    # Alfabetos
    'ALFABETO_HEBREO_CLASICO',
    'ALFABETO_PITAGORICO',
    'ALFABETO_CALDEO',
    'ALFABETO_COQUATRIX',
    'ALFABETO_DSHEVASTAN',
    'ALFABETO_ORDINAL',
    'ALFABETO_INGLES_SIMPLE',
    'ALFABETO_INVERSO',
    'ALFABETO_HEBRAICO_OCCIDENTAL',
    'ALFABETO_TAROT',
    
    # Funciones
    'calcular_gematria',
    'comparar_sistemas',
    'analisis_gemátrico_completo',
    'obtener_info_sistema',
    
    # Datos
    'INFORMACION_SISTEMAS'
]


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("SISTEMAS DE GEMATRÍA DISPONIBLES")
    print("=" * 80)
    
    # Mostrar información de cada sistema
    for sistema, info in INFORMACION_SISTEMAS.items():
        print(f"\n📚 {info['nombre']}")
        print(f"   Origen: {info['origen']}")
        print(f"   Antigüedad: {info['antigüedad']}")
        print(f"   Uso: {info['uso']}")
        print(f"   Características: {info['caracteristicas']}")
    
    # Ejemplo de cálculo
    print("\n" + "=" * 80)
    print("EJEMPLO: Calculando 'MARIA' en diferentes sistemas")
    print("=" * 80)
    
    resultados = comparar_sistemas("MARIA")
    
    for sistema, resultado in resultados.items():
        if 'error' not in resultado:
            print(f"\n{sistema.upper()}: {resultado['suma_total']}")
            print(f"  Desglose: {' + '.join([f'{l}({v})' for l, v in resultado['valores']])}")
    
    print("\n" + "=" * 80)