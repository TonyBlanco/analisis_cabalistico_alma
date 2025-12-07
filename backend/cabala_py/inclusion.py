# cabala_py/inclusion.py
"""
Implementación del método de Inclusión de Base (Casas 1-9) de Martine Coquatrix
Este análisis identifica números dominantes, ausentes, maestrías y karmas.
"""

from .data import ALFABETO_ESPANOL_1995, FAMILIAS_DSHEVASTAN
from collections import Counter


def calcular_inclusion_base(nombre_completo, dia, mes, anio, alfabeto=ALFABETO_ESPANOL_1995):
    """
    Calcula la Inclusión de Base: distribución de valores 1-9 en el nombre y fecha.
    
    Retorna:
    - casas: dict con conteo de cada número del 1 al 9
    - numeros_dominantes: números con mayor frecuencia
    - numeros_ausentes: números que no aparecen (Karmas)
    - maestrias: números con 3+ repeticiones
    - analisis_familias: distribución por familias Dshevastan
    """
    
    # Paso 1: Extraer todos los valores numéricos del nombre
    valores_nombre = []
    nombre_limpio = ''.join(c for c in nombre_completo if c.isalpha())
    
    for letra in nombre_limpio.upper():
        valor = alfabeto.get(letra, 0)
        if valor > 0:
            valores_nombre.append(valor)
    
    # Paso 2: Extraer dígitos de la fecha de nacimiento
    valores_fecha = []
    for digito in str(dia) + str(mes) + str(anio):
        valores_fecha.append(int(digito))
    
    # Paso 3: Combinar todos los valores
    todos_valores = valores_nombre + valores_fecha
    
    # Paso 4: Contar frecuencias (Casas 1-9)
    conteo = Counter(todos_valores)
    casas = {i: conteo.get(i, 0) for i in range(1, 10)}
    
    # Paso 5: Análisis de dominantes y ausentes
    max_frecuencia = max(casas.values()) if casas.values() else 0
    numeros_dominantes = [num for num, freq in casas.items() if freq == max_frecuencia and freq > 0]
    numeros_ausentes = [num for num, freq in casas.items() if freq == 0]
    
    # Paso 6: Identificar Maestrías (3 o más repeticiones)
    maestrias = [num for num, freq in casas.items() if freq >= 3]
    
    # Paso 7: Análisis por Familias Dshevastan
    analisis_familias = analizar_por_familias(casas)
    
    return {
        "casas": casas,
        "total_valores": len(todos_valores),
        "numeros_dominantes": numeros_dominantes,
        "numeros_ausentes": numeros_ausentes,  # Karmas potenciales
        "maestrias": maestrias,
        "analisis_familias": analisis_familias,
        "valores_nombre": valores_nombre,
        "valores_fecha": valores_fecha
    }


def analizar_por_familias(casas):
    """
    Agrupa los números según las Familias Dshevastan y calcula totales.
    Útil para identificar patrones energéticos en el perfil numerológico.
    """
    familias_totales = {}
    
    for familia_num, miembros in FAMILIAS_DSHEVASTAN.items():
        total = sum(casas.get(miembro, 0) for miembro in miembros if miembro <= 9)
        familias_totales[familia_num] = {
            "total": total,
            "miembros": {m: casas.get(m, 0) for m in miembros if m <= 9}
        }
    
    return familias_totales


def interpretar_inclusion(inclusion_data):
    """
    Genera una interpretación textual básica de la Inclusión de Base.
    """
    interpretacion = []
    
    # Números dominantes
    if inclusion_data["numeros_dominantes"]:
        nums = ", ".join(map(str, inclusion_data["numeros_dominantes"]))
        interpretacion.append(f"Números Dominantes (mayor presencia): {nums}")
    
    # Números ausentes (Karmas)
    if inclusion_data["numeros_ausentes"]:
        nums = ", ".join(map(str, inclusion_data["numeros_ausentes"]))
        interpretacion.append(f"Números Ausentes (Lecciones Kármicas): {nums}")
    
    # Maestrías
    if inclusion_data["maestrias"]:
        nums = ", ".join(map(str, inclusion_data["maestrias"]))
        interpretacion.append(f"Números de Maestría (3+ repeticiones): {nums}")
    
    # Equilibrio general
    valores_no_cero = [v for v in inclusion_data["casas"].values() if v > 0]
    if valores_no_cero:
        promedio = sum(valores_no_cero) / len(valores_no_cero)
        desviacion = max(valores_no_cero) - min(valores_no_cero)
        
        if desviacion <= 2:
            interpretacion.append("Perfil Equilibrado: distribución armónica de energías")
        elif desviacion > 5:
            interpretacion.append("Perfil Polarizado: contrastes marcados entre energías")
    
    return interpretacion


def generar_grafico_inclusion(casas):
    """
    Genera una representación visual simple de las Casas 1-9.
    Retorna un dict para facilitar visualización en frontend.
    """
    max_valor = max(casas.values()) if casas.values() else 1
    
    grafico = {}
    for num in range(1, 10):
        frecuencia = casas[num]
        porcentaje = (frecuencia / max_valor * 100) if max_valor > 0 else 0
        
        grafico[num] = {
            "frecuencia": frecuencia,
            "porcentaje": round(porcentaje, 1),
            "estado": clasificar_presencia(frecuencia)
        }
    
    return grafico


def clasificar_presencia(frecuencia):
    """Clasifica la presencia de un número según su frecuencia."""
    if frecuencia == 0:
        return "ausente"
    elif frecuencia == 1:
        return "presente"
    elif frecuencia == 2:
        return "reforzado"
    elif frecuencia >= 3:
        return "maestria"
    return "normal"


# Ejemplo de uso
if __name__ == "__main__":
    # Prueba con datos de ejemplo
    resultado = calcular_inclusion_base(
        nombre_completo="JUAN PEREZ",
        dia=15,
        mes=3,
        anio=1985
    )
    
    print("=== INCLUSIÓN DE BASE ===")
    print(f"Casas: {resultado['casas']}")
    print(f"Dominantes: {resultado['numeros_dominantes']}")
    print(f"Ausentes (Karmas): {resultado['numeros_ausentes']}")
    print(f"Maestrías: {resultado['maestrias']}")
    print("\nInterpretación:")
    for linea in interpretar_inclusion(resultado):
        print(f"- {linea}")