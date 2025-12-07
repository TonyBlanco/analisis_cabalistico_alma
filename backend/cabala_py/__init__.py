# cabala_py/__init__.py
"""
Sistema de Numerología Cabalística Integrado

Este paquete proporciona herramientas para:
- Cálculos numerológicos (Método Dshevastan®)
- Inclusión de Base (Método Coquatrix)
- Correspondencias con el Árbol de la Vida Cabalístico

Uso básico:
    from cabala_py import calcular_valores_nombre, calcular_camino_destino
    from cabala_py import generar_mapa_cabalista_completo
    
    resultado = calcular_valores_nombre("MARIA GARCIA")
    mapa = generar_mapa_cabalista_completo("MARIA GARCIA", 15, 8, 1990)
"""

__version__ = "2.0.0"
__author__ = "Sistema de Numerología Cabalística"

# Importar las constantes principales
from .data import (
    ALFABETO_ESPANOL_1995,
    ALFABETO_ESPANOL,
    VOCALES,
    NUMEROS_MAESTROS,
    MAX_SEFIRA,
    MAX_SENDERO,
    FAMILIAS_DSHEVASTAN
)

# Importar funciones de utilidad
from .utils import (
    reducir_teosofica,
    reduccion_cabalistica
)

# Importar funciones de numerología
from .numerology import (
    calcular_valores_nombre,
    calcular_camino_destino
)

# Importar funciones de inclusión
from .inclusion import (
    calcular_inclusion_base,
    interpretar_inclusion,
    generar_grafico_inclusion
)

# Importar datos del Árbol de la Vida
from .arbol_vida import (
    SEFIROTH,
    SENDEROS,
    obtener_sefira_por_numero,
    obtener_sendero_por_numero,
    mapear_numero_a_arbol
)

# Importar la integración completa
from .integracion_arbol import (
    generar_mapa_cabalista_completo,
    mapear_a_arbol_vida,
    obtener_significado_sefira,
    obtener_significado_sendero
)

# Gematría
from .gematria import (
    calcular_gematria,
    comparar_sistemas,
    INFORMACION_SISTEMAS
)

# Definir qué se exporta con "from cabala_py import *"
__all__ = [
    # Versión
    '__version__',
    '__author__',
    
    # Constantes
    'ALFABETO_ESPANOL_1995',
    'ALFABETO_ESPANOL',
    'VOCALES',
    'NUMEROS_MAESTROS',
    'MAX_SEFIRA',
    'MAX_SENDERO',
    'FAMILIAS_DSHEVASTAN',
    
    # Utilidades
    'reducir_teosofica',
    'reduccion_cabalistica',
    
    # Numerología básica
    'calcular_valores_nombre',
    'calcular_camino_destino',
    
    # Inclusión de Base
    'calcular_inclusion_base',
    'interpretar_inclusion',
    'generar_grafico_inclusion',
    
    # Árbol de la Vida
    'SEFIROTH',
    'SENDEROS',
    'obtener_sefira_por_numero',
    'obtener_sendero_por_numero',
    'mapear_numero_a_arbol',
    
    # Integración completa
    'generar_mapa_cabalista_completo',
    'mapear_a_arbol_vida',
    'obtener_significado_sefira',
    'obtener_significado_sendero',

    # Gematría
    'calcular_gematria',
    'comparar_sistemas',
    'INFORMACION_SISTEMAS'
]


def info():
    """Imprime información sobre el paquete."""
    print(f"""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          Sistema de Numerología Cabalística Integrado            ║
║                                                                   ║
║  Versión: {__version__:<53}║
║                                                                   ║
║  Características:                                                 ║
║  • Método Dshevastan® (Alfabeto Español 1995)                    ║
║  • Inclusión de Base (Método Coquatrix)                          ║
║  • Árbol de la Vida Cabalístico (10 Sefiroth + 22 Senderos)     ║
║                                                                   ║
║  Uso rápido:                                                      ║
║    from cabala_py import generar_mapa_cabalista_completo         ║
║    mapa = generar_mapa_cabalista_completo("NOMBRE", 15, 8, 1990) ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """)


# Verificar que todos los módulos se importaron correctamente
try:
    # Verificar que las funciones principales están disponibles
    assert callable(calcular_valores_nombre)
    assert callable(calcular_camino_destino)
    assert callable(calcular_inclusion_base)
    assert callable(generar_mapa_cabalista_completo)
    
    # Verificar que los datos están disponibles
    assert len(ALFABETO_ESPANOL_1995) == 27  # 26 letras + Ñ
    assert len(SEFIROTH) == 11  # 10 + Da'at
    
    _PACKAGE_OK = True
    
except (AssertionError, ImportError) as e:
    _PACKAGE_OK = False
    print(f"⚠️  Advertencia: Algunos componentes del paquete no están disponibles: {e}")


if __name__ == "__main__":
    info()
