# cabala_py/numerology.py
from .data import ALFABETO_ESPANOL_1995, ALFABETO_PITAGORICO, VOCALES, MAX_SEFIRA, MAX_SENDERO
from .utils import reduccion_cabalistica, reducir_teosofica

def calcular_valores_nombre(nombre_completo, sistema="dshevastan"):
    """
    Calcula Esencia (vocales), Expresión (consonantes) y Total (Herencia)
    adaptándose al sistema de cálculo elegido.
    """
    # Selección del alfabeto según el sistema
    if sistema == "pitagorico":
        alfabeto = ALFABETO_PITAGORICO
    # Aquí podrías añadir más sistemas como 'caldeo' o 'hebreo' en el futuro
    # elif sistema == "caldeo":
    #     alfabeto = ALFABETO_CALDEO
    else:
        # Por defecto, se usa el sistema Dshevastan (Español con Ñ)
        alfabeto = ALFABETO_ESPANOL_1995

    suma_total = 0
    suma_vocales = 0
    suma_consonantes = 0

    # Limpiar y normalizar el nombre
    nombre_limpio = ''.join(c for c in nombre_completo if c.isalpha())

    for letra in nombre_limpio:
        valor = alfabeto.get(letra.upper(), 0)
        
        suma_total += valor
        
        if letra.upper() in VOCALES:
            suma_vocales += valor
        else:
            suma_consonantes += valor

    # --- LÓGICA DE REDUCCIÓN POR SISTEMA ---
    if sistema == "pitagorico":
        # Reducción estándar numerológica (1-9), manteniendo números maestros 11, 22, 33.
        esencia, _ = reduccion_cabalistica(suma_vocales, max_limite=9, mantener_maestros=True)
        expresion, expresion_reducida = reduccion_cabalistica(suma_consonantes, max_limite=9, mantener_maestros=True)
        herencia, herencia_reducida = reduccion_cabalistica(suma_total, max_limite=9, mantener_maestros=True)
    else:
        # Reducción Cabalística (Dshevastan)
        # Esencia se reduce a 1-9 (o 10), los demás a 1-22.
        esencia, _ = reduccion_cabalistica(suma_vocales, max_limite=MAX_SEFIRA) 
        expresion, expresion_reducida = reduccion_cabalistica(suma_consonantes, max_limite=MAX_SENDERO)
        herencia, herencia_reducida = reduccion_cabalistica(suma_total, max_limite=MAX_SENDERO)

    return {
        "suma_vocales": suma_vocales,
        "esencia": f"{esencia}/{esencia}" if esencia <= 9 else f"{esencia}/{reducir_teosofica(esencia)}",
        "suma_consonantes": suma_consonantes,
        "expresion": f"{expresion}/{expresion_reducida}" if expresion != expresion_reducida else str(expresion),
        "suma_total": suma_total,
        "herencia": f"{herencia}/{herencia_reducida}" if herencia != herencia_reducida else str(herencia)
    }

def calcular_camino_destino(dia, mes, anio):
    """Calcula el Camino de Vida (Edad de Transformación) y el Número de Destino."""
    
    # [cite_start]Suma de todos los dígitos de la fecha de nacimiento [cite: 774]
    total_suma = sum(int(d) for d in str(dia)) + sum(int(d) for d in str(mes)) + sum(int(d) for d in str(anio))
    
    # [cite_start]Camino de Vida: Total sin reducir (es la edad de transformación) [cite: 774]
    camino_vida = total_suma

    # [cite_start]Número de Destino: Reducción del total a una cifra <= 22, manteniendo Maestros. [cite: 776]
    destino, destino_reducido = reduccion_cabalistica(total_suma, max_limite=MAX_SENDERO, mantener_maestros=True)
    
    # [cite_start]Formato de salida: Mantiene el formato con dígito reducido si es necesario (ej. 10/1) [cite: 332]
    if destino != destino_reducido:
        destino_formato = f"{destino}/{destino_reducido}"
    else:
        destino_formato = str(destino)

    return {
        "camino_vida": camino_vida,
        "destino": destino_formato
    }

# FALTARÍA: Implementar la Lógica de Inclusión de Base (Casas 1-9) para Coquatrix
# Esto requiere procesar el nombre completo, contar las letras por valor
# [cite_start]y distribuirlas en las 9 casas (Casas 1-9) [cite: 2705]

# ... continuaremos con esto en el siguiente paso.