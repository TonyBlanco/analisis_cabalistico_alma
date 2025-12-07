# cabala_py/data.py
"""
Datos base del sistema de Numerología Cabalística
Incluye alfabetos, constantes y familias de números según el Método Dshevastan®
"""

# ============================================================================
# ALFABETO ESPAÑOL (Método Dshevastan® desde 1995)
# ============================================================================

ALFABETO_ESPANOL_1995 = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'Ñ': 7, 'O': 6, 'P': 8, 'Q': 9,
    'R': 9, 'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

# Alias para compatibilidad
ALFABETO_ESPANOL = ALFABETO_ESPANOL_1995


# ============================================================================
# ALFABETO PITAGÓRICO (Numerología Occidental)
# ============================================================================

ALFABETO_PITAGORICO = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

# ============================================================================
# VOCALES (para cálculo de Esencia/Alma)
# ============================================================================

VOCALES = {'A', 'E', 'I', 'O', 'U'}


# ============================================================================
# NÚMEROS MAESTROS (no se reducen en ciertos cálculos)
# ============================================================================

NUMEROS_MAESTROS = {11, 22, 33}


# ============================================================================
# LÍMITES DE REDUCCIÓN POR CONCEPTO
# ============================================================================

# Esencia (Alma): Se reduce a 1-9 (Sefiroth)
MAX_SEFIRA = 9

# Expresión, Herencia, Destino: Se reduce a 1-22 (Senderos)
MAX_SENDERO = 22


# ============================================================================
# FAMILIAS DE NÚMEROS (Sistema Dshevastan®)
# Para análisis de Bloques, Maestrías y Karma
# ============================================================================

FAMILIAS_DSHEVASTAN = {
    1: [1, 10, 19],
    2: [2, 11, 20],
    3: [3, 12, 21],
    4: [4, 13, 22],
    5: [5, 14],
    6: [6, 15],
    7: [7, 16],
    8: [8, 17],
    9: [9, 18],
}


# ============================================================================
# INFORMACIÓN ADICIONAL
# ============================================================================

SISTEMA_INFO = {
    "nombre": "Método Dshevastan®",
    "alfabeto": "Español (desde 1995)",
    "version": "2.0",
    "autor": "Sistema Integrado de Numerología Cabalística"
}


# ============================================================================
# FUNCIONES DE UTILIDAD PARA DATOS
# ============================================================================

def obtener_valor_letra(letra, alfabeto=None):
    """
    Obtiene el valor numérico de una letra según el alfabeto especificado.
    
    Args:
        letra: Carácter a consultar
        alfabeto: Diccionario de alfabeto (por defecto ALFABETO_ESPANOL_1995)
    
    Returns:
        int: Valor numérico de la letra, o 0 si no se encuentra
    """
    if alfabeto is None:
        alfabeto = ALFABETO_ESPANOL_1995
    
    return alfabeto.get(letra.upper(), 0)


def es_vocal(letra):
    """
    Verifica si una letra es vocal.
    
    Args:
        letra: Carácter a verificar
    
    Returns:
        bool: True si es vocal, False en caso contrario
    """
    return letra.upper() in VOCALES


def obtener_familia(numero):
    """
    Obtiene la familia Dshevastan® a la que pertenece un número.
    
    Args:
        numero: Número a consultar (1-22)
    
    Returns:
        int: Número de familia (1-9), o None si no pertenece a ninguna
    """
    for familia, miembros in FAMILIAS_DSHEVASTAN.items():
        if numero in miembros:
            return familia
    return None


def es_numero_maestro(numero):
    """
    Verifica si un número es un Número Maestro.
    
    Args:
        numero: Número a verificar
    
    Returns:
        bool: True si es número maestro (11, 22, 33)
    """
    return numero in NUMEROS_MAESTROS


# ============================================================================
# VALIDACIONES
# ============================================================================

def validar_alfabeto():
    """Valida que el alfabeto esté correctamente definido."""
    # Verificar que todas las letras españolas estén presentes
    letras_esperadas = set('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ')
    letras_presentes = set(ALFABETO_ESPANOL_1995.keys())
    
    if letras_esperadas != letras_presentes:
        faltantes = letras_esperadas - letras_presentes
        extras = letras_presentes - letras_esperadas
        raise ValueError(
            f"Alfabeto inválido. Faltantes: {faltantes}, Extras: {extras}"
        )
    
    # Verificar que todos los valores estén en rango 1-9
    valores = set(ALFABETO_ESPANOL_1995.values())
    if not valores.issubset(set(range(1, 10))):
        raise ValueError("Algunos valores del alfabeto están fuera del rango 1-9")
    
    return True


def validar_familias():
    """Valida que las familias estén correctamente definidas."""
    todos_numeros = []
    for miembros in FAMILIAS_DSHEVASTAN.values():
        todos_numeros.extend(miembros)
    
    # Verificar que no haya duplicados
    if len(todos_numeros) != len(set(todos_numeros)):
        raise ValueError("Hay números duplicados en las familias")
    
    # Verificar que estén todos los números del 1 al 22
    esperados = set(range(1, 23))
    presentes = set(todos_numeros)
    
    if esperados != presentes:
        faltantes = esperados - presentes
        extras = presentes - esperados
        raise ValueError(
            f"Familias incompletas. Faltantes: {faltantes}, Extras: {extras}"
        )
    
    return True


# ============================================================================
# INICIALIZACIÓN Y VERIFICACIÓN
# ============================================================================

def verificar_integridad_datos():
    """Verifica la integridad de todos los datos al cargar el módulo."""
    try:
        validar_alfabeto()
        validar_familias()
        return True
    except ValueError as e:
        print(f"⚠️  Advertencia en cabala_py/data.py: {e}")
        return False


# Ejecutar verificación al importar
_DATOS_VALIDOS = verificar_integridad_datos()


# ============================================================================
# EXPORTACIONES
# ============================================================================

__all__ = [
    'ALFABETO_ESPANOL_1995',
    'ALFABETO_ESPANOL',
    'ALFABETO_PITAGORICO',
    'VOCALES',
    'NUMEROS_MAESTROS',
    'MAX_SEFIRA',
    'MAX_SENDERO',
    'FAMILIAS_DSHEVASTAN',
    'SISTEMA_INFO',
    'obtener_valor_letra',
    'es_vocal',
    'obtener_familia',
    'es_numero_maestro',
    'validar_alfabeto',
    'validar_familias',
    'verificar_integridad_datos'
]


# ============================================================================
# MODO DE PRUEBA
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("VERIFICACIÓN DE DATOS - cabala_py/data.py")
    print("=" * 70)
    
    print("\n✓ Alfabeto Español (Dshevastan® 1995):")
    print(f"  Total de letras: {len(ALFABETO_ESPANOL_1995)}")
    print(f"  Ejemplo: A={ALFABETO_ESPANOL_1995['A']}, "
          f"M={ALFABETO_ESPANOL_1995['M']}, "
          f"Z={ALFABETO_ESPANOL_1995['Z']}")
    
    print("\n✓ Vocales:")
    print(f"  {VOCALES}")
    
    print("\n✓ Números Maestros:")
    print(f"  {NUMEROS_MAESTROS}")
    
    print("\n✓ Límites de Reducción:")
    print(f"  Esencia (Sefiroth): 1-{MAX_SEFIRA}")
    print(f"  Expresión/Herencia (Senderos): 1-{MAX_SENDERO}")
    
    print("\n✓ Familias Dshevastan®:")
    for familia, miembros in FAMILIAS_DSHEVASTAN.items():
        print(f"  Familia {familia}: {miembros}")
    
    print("\n✓ Funciones de utilidad:")
    print(f"  obtener_valor_letra('M'): {obtener_valor_letra('M')}")
    print(f"  es_vocal('A'): {es_vocal('A')}")
    print(f"  es_vocal('M'): {es_vocal('M')}")
    print(f"  obtener_familia(11): {obtener_familia(11)}")
    print(f"  es_numero_maestro(22): {es_numero_maestro(22)}")
    
    print("\n✓ Validaciones:")
    print(f"  Alfabeto válido: {validar_alfabeto()}")
    print(f"  Familias válidas: {validar_familias()}")
    
    print("\n" + "=" * 70)
    print("✅ TODOS LOS DATOS SON VÁLIDOS")
    print("=" * 70)