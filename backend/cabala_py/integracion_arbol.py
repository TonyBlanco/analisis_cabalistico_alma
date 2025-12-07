# cabala_py/integracion_arbol.py
"""
Módulo de integración entre la Ficha Numerológica y el Árbol de la Vida
Mapea automáticamente los números calculados a sus correspondencias cabalísticas
"""

from .arbol_vida import (
    SEFIROTH, 
    SENDEROS, 
    obtener_sefira_por_numero, 
    obtener_sendero_por_numero,
    obtener_interpretacion_sefira
)
from .numerology import calcular_valores_nombre, calcular_camino_destino
from .inclusion import calcular_inclusion_base
from .utils import reduccion_cabalistica, reducir_teosofica


def generar_mapa_cabalista_completo(nombre_completo, dia, mes, anio, sistema="dshevastan"):
    """
    Genera un mapa cabalístico completo integrando:
    1. Cálculos numerológicos (Dshevastan®)
    2. Inclusión de Base (Coquatrix)
    3. Correspondencias en el Árbol de la Vida
    
    Retorna un diccionario completo con toda la información estructurada.
    """
    
    # 1. Cálculos básicos
    calculos_nombre = calcular_valores_nombre(nombre_completo, sistema=sistema)
    calculos_fecha = calcular_camino_destino(dia, mes, anio)
    inclusion = calcular_inclusion_base(nombre_completo, dia, mes, anio)
    
    # 2. Extraer números principales
    esencia_num = int(calculos_nombre['esencia'].split('/')[0])
    expresion_num = int(calculos_nombre['expresion'].split('/')[0])
    herencia_num = int(calculos_nombre['herencia'].split('/')[0])
    destino_num = int(calculos_fecha['destino'].split('/')[0])
    camino_vida_num = calculos_fecha['camino_vida']
    
    # 3. Mapear a Sefiroth y Senderos
    mapa = {
        "identidad": {
            "nombre": nombre_completo,
            "fecha_nacimiento": f"{dia:02d}/{mes:02d}/{anio}"
        },
        
        "numeros_principales": {
            "esencia": {
                "valor": calculos_nombre['esencia'],
                "numero": esencia_num,
                "tipo": "sefira",
                "arbol": mapear_a_arbol_vida(esencia_num)
            },
            "expresion": {
                "valor": calculos_nombre['expresion'],
                "numero": expresion_num,
                "tipo": "sefira" if expresion_num <= 10 else "sendero",
                "arbol": mapear_a_arbol_vida(expresion_num)
            },
            "herencia": {
                "valor": calculos_nombre['herencia'],
                "numero": herencia_num,
                "tipo": "sefira" if herencia_num <= 10 else "sendero",
                "arbol": mapear_a_arbol_vida(herencia_num)
            },
            "destino": {
                "valor": calculos_fecha['destino'],
                "numero": destino_num,
                "tipo": "sefira" if destino_num <= 10 else "sendero",
                "arbol": mapear_a_arbol_vida(destino_num)
            },
            "camino_vida": {
                "valor": camino_vida_num,
                "descripcion": f"Edad de transformación: {camino_vida_num} años"
            }
        },
        
        "inclusion_base": {
            "casas": inclusion["casas"],
            "dominantes": inclusion["numeros_dominantes"],
            "ausentes": inclusion["numeros_ausentes"],
            "maestrias": inclusion["maestrias"]
        },
        
        "analisis_cabalista": generar_analisis_cabalista(
            esencia_num, expresion_num, herencia_num, destino_num
        ),
        
        "recomendaciones": generar_recomendaciones(
            esencia_num, expresion_num, destino_num, inclusion
        ),

        # Datos extendidos solicitados
        "temas_clave": generar_temas_clave(
            esencia_num, expresion_num, destino_num, camino_vida_num
        ),
        "estructura_energetica": generar_estructura_energetica(inclusion),
        "vibraciones": generar_vibraciones(
            esencia_num, expresion_num, herencia_num, destino_num, camino_vida_num
        ),
        "cuentas_pendientes": generar_cuentas_pendientes(inclusion["casas"]),
        "dias_fuerza": calcular_dias_fuerza_personal(dia),
        "turbulencias": calcular_turbulencias(camino_vida_num, inclusion),
        "secuencia_principal": construir_secuencia_principal(
            esencia_num, expresion_num, herencia_num, destino_num, camino_vida_num
        )
    }
    
    return mapa


def mapear_a_arbol_vida(numero):
    """
    Mapea un número específico a su correspondencia en el Árbol de la Vida.
    Retorna información detallada de la Sefirá o Sendero.
    """
    if numero <= 10:
        sefira = obtener_sefira_por_numero(numero)
        if sefira:
            return {
                "tipo": "sefira",
                "id": sefira["id"],
                "nombre_es": sefira["nombre"]["es"],
                "nombre_he": sefira["nombre"]["he"],
                "arcangel": sefira.get("arcangel", "N/A"),
                "planeta": sefira.get("planeta", "N/A"),
                "chakra": sefira.get("chakra", "N/A"),
                "color": sefira.get("color", {}).get("reina", "N/A"),
                "orden_angelica": sefira.get("orden_angelica", "N/A"),
                "significado": obtener_significado_sefira(sefira["id"])
            }
    elif 11 <= numero <= 22:
        sendero = obtener_sendero_por_numero(numero)
        if sendero:
            return {
                "tipo": "sendero",
                "numero": sendero["numero"],
                "letra_hebrea": sendero.get("letra_hebrea", "N/A"),
                "tarot": sendero.get("tarot", "N/A"),
                "nombre_tarot": sendero.get("nombre", "N/A"),
                "conexion": sendero["id"],
                "significado": obtener_significado_sendero(numero)
            }
    
    return {
        "tipo": "compuesto",
        "numero": numero,
        "nota": "Número compuesto - requiere análisis de familias"
    }


def obtener_significado_sefira(sefira_id):
    """Retorna el significado cabalístico de una Sefirá."""
    significados = {
        "keter": "Voluntad pura y unidad divina. Corona de la creación.",
        "chochmah": "Sabiduría intuitiva y chispa creativa.",
        "binah": "Comprensión profunda y estructura del pensamiento.",
        "chesed": "Misericordia, bondad y expansión generosa.",
        "gevurah": "Fuerza, disciplina y justicia rigurosa.",
        "tiferet": "Belleza, armonía y equilibrio central.",
        "netzach": "Victoria, eternidad y persistencia emocional.",
        "hod": "Esplendor intelectual y claridad mental.",
        "yesod": "Fundamento de la manifestación y conexión astral.",
        "malchut": "Reino material y manifestación física.",
        "daat": "Conocimiento oculto y puente entre mundos."
    }
    return significados.get(sefira_id, "Sin descripción disponible")


def obtener_significado_sendero(numero):
    """Retorna el significado de un Sendero según su número."""
    significados = {
        11: "El Loco - Comienzo espontáneo, potencial ilimitado",
        12: "El Mago - Maestría, habilidad, manifestación consciente",
        13: "La Sacerdotisa - Intuición, misterio, sabiduría oculta",
        14: "La Emperatriz - Fertilidad, abundancia, creatividad",
        15: "El Emperador - Autoridad, estructura, orden establecido",
        16: "El Hierofante - Tradición, enseñanza espiritual",
        17: "Los Enamorados - Elección, unión, dualidad armónica",
        18: "El Carro - Voluntad dirigida, victoria, determinación",
        19: "La Fuerza - Coraje interno, dominio de instintos",
        20: "El Ermitaño - Introspección, búsqueda interior, sabiduría",
        21: "La Rueda - Ciclos, destino, cambios inevitables",
        22: "La Justicia - Equilibrio, karma, causa y efecto"
    }
    return significados.get(numero, f"Sendero {numero} - Significado en desarrollo")


def generar_analisis_cabalista(esencia, expresion, herencia, destino):
    """
    Genera un análisis textual de las correspondencias cabalísticas.
    """
    analisis = []
    
    # Análisis de Esencia (Alma)
    sefira_esencia = obtener_sefira_por_numero(esencia)
    if sefira_esencia:
        analisis.append({
            "aspecto": "Esencia del Alma",
            "correspondencia": f"{sefira_esencia['nombre']['es']} ({sefira_esencia['nombre']['roman']})",
            "interpretacion": f"Tu esencia vibra en {sefira_esencia['nombre']['es']}, "
                            f"regida por el Arcángel {sefira_esencia.get('arcangel', 'N/A')}. "
                            f"Representa {obtener_significado_sefira(sefira_esencia['id'])}"
        })
    
    # Análisis de Destino
    if destino <= 10:
        sefira_destino = obtener_sefira_por_numero(destino)
        if sefira_destino:
            analisis.append({
                "aspecto": "Destino",
                "correspondencia": f"{sefira_destino['nombre']['es']} ({sefira_destino['nombre']['roman']})",
                "interpretacion": f"Tu destino te lleva hacia {sefira_destino['nombre']['es']}, "
                                f"asociada con {sefira_destino.get('planeta', 'energías cósmicas')}."
            })
    else:
        sendero_destino = obtener_sendero_por_numero(destino)
        if sendero_destino:
            analisis.append({
                "aspecto": "Destino",
                "correspondencia": f"Sendero {destino} - {sendero_destino.get('nombre', 'N/A')}",
                "interpretacion": f"Tu destino transita por el {sendero_destino.get('nombre', 'sendero')} "
                                f"({sendero_destino.get('letra_hebrea', 'N/A')}). "
                                f"{obtener_significado_sendero(destino)}"
            })
    
    return analisis


def generar_recomendaciones(esencia, expresion, destino, inclusion_data):
    """
    Genera recomendaciones prácticas basadas en el perfil cabalístico.
    """
    recomendaciones = []
    
    # Recomendaciones por Esencia
    sefira = obtener_sefira_por_numero(esencia)
    if sefira:
        rec_esencia = {
            "keter": "Meditación en silencio, conexión con lo trascendente",
            "chochmah": "Desarrollo de la intuición, estudios filosóficos",
            "binah": "Análisis profundo, estructuración del conocimiento",
            "chesed": "Actos de generosidad, expansión social",
            "gevurah": "Disciplina física, artes marciales, establecer límites",
            "tiferet": "Equilibrio mente-cuerpo-espíritu, yoga, arte",
            "netzach": "Expresión artística, cultivo de la pasión",
            "hod": "Estudio intelectual, comunicación efectiva",
            "yesod": "Trabajo con sueños, visualización creativa",
            "malchut": "Conexión con la naturaleza, trabajo físico"
        }
        
        recomendaciones.append({
            "categoria": "Práctica Espiritual",
            "basado_en": f"Esencia {esencia} ({sefira['nombre']['es']})",
            "sugerencia": rec_esencia.get(sefira['id'], "Meditación general")
        })
    
    # Recomendaciones por números ausentes (Karmas)
    if inclusion_data["numeros_ausentes"]:
        recomendaciones.append({
            "categoria": "Lecciones Kármicas",
            "basado_en": f"Números ausentes: {inclusion_data['numeros_ausentes']}",
            "sugerencia": f"Trabaja conscientemente con las energías de: "
                         f"{', '.join([SEFIROTH[list(SEFIROTH.keys())[n-1]]['nombre']['es'] for n in inclusion_data['numeros_ausentes'] if n <= 10])}"
        })
    
    # Recomendaciones por Maestrías
    if inclusion_data["maestrias"]:
        recomendaciones.append({
            "categoria": "Dones Naturales",
            "basado_en": f"Números de maestría: {inclusion_data['maestrias']}",
            "sugerencia": "Estos son tus dones innatos - úsalos para servir a otros"
        })
    
    return recomendaciones


# ============================================================================
# CAPAS EXTENDIDAS SOLICITADAS
# ============================================================================

def generar_temas_clave(esencia, expresion, destino, camino_vida):
    """Temas de origen, transformación y destino basados en los números principales."""
    origen = mapear_a_arbol_vida(esencia)
    transformacion_num, _ = reduccion_cabalistica(camino_vida, max_limite=22, mantener_maestros=True)
    transformacion = mapear_a_arbol_vida(transformacion_num)
    destino_info = mapear_a_arbol_vida(destino)
    
    return {
        "tema_origen": origen,
        "principio_transformacion": {
            "numero": transformacion_num,
            "arbol": transformacion,
            "edad_transformacion": camino_vida
        },
        "tema_destino": destino_info
    }


def generar_estructura_energetica(inclusion):
    """
    Resume la energía general: imagen del alma, razones kármicas y equilibrio de casas.
    """
    return {
        "imagen_alma": inclusion["numeros_dominantes"],
        "razones_karmicas": inclusion["numeros_ausentes"],
        "familias": inclusion.get("analisis_familias", {}),
        "grafico_simple": {n: "|" * inclusion["casas"][n] for n in inclusion["casas"]}
    }


def generar_vibraciones(esencia, expresion, herencia, destino, camino_vida):
    """
    Números de vibración clave. Se usan los cálculos ya existentes como base.
    """
    return {
        "cuerpo": expresion,
        "alma": esencia,
        "espiritu": herencia,
        "efecto_sanador": destino,
        "lema_vida": camino_vida
    }


def generar_cuentas_pendientes(casas):
    """
    Representa las cuentas pendientes (ausencias o bajas frecuencias) con barras.
    """
    cuentas = {}
    for numero, freq in casas.items():
        cuentas[numero] = {
            "frecuencia": freq,
            "barras": "|" * freq if freq > 0 else ""
        }
    return cuentas


def calcular_dias_fuerza_personal(dia_nacimiento):
    """
    Días del mes que comparten la misma raíz que el día de nacimiento.
    """
    raiz = reducir_teosofica(dia_nacimiento)
    dias = [d for d in range(1, 32) if reducir_teosofica(d) == raiz]
    return {
        "dia_original": dia_nacimiento,
        "raiz": raiz,
        "dias_sinergicos": dias
    }


def calcular_turbulencias(camino_vida, inclusion):
    """
    Edad de transformación y posibles turbulencias si coincide con karmas/ausencias.
    """
    camino_reducido, _ = reduccion_cabalistica(camino_vida, max_limite=9)
    turbulencias = []
    for karma in inclusion.get("numeros_ausentes", []):
        if karma == camino_reducido:
            turbulencias.append("La edad de transformación toca un número kármico; atención a ese ciclo.")
    return {
        "edad_transformacion": camino_vida,
        "camino_reducido": camino_reducido,
        "notas": turbulencias
    }


def construir_secuencia_principal(esencia, expresion, herencia, destino, camino_vida):
    """Secuencia numérica de referencia para visualizar el recorrido personal."""
    return [
        {"etapa": "Origen (Esencia)", "valor": esencia},
        {"etapa": "Expresión (Cuerpo)", "valor": expresion},
        {"etapa": "Herencia (Espíritu)", "valor": herencia},
        {"etapa": "Destino", "valor": destino},
        {"etapa": "Transformación", "valor": camino_vida}
    ]


# ============================================================================
# EJEMPLO DE USO COMPLETO
# ============================================================================

if __name__ == "__main__":
    # Generar mapa cabalístico completo
    mapa = generar_mapa_cabalista_completo(
        nombre_completo="MARIA GARCIA LOPEZ",
        dia=15,
        mes=8,
        anio=1990
    )
    
    print("=" * 80)
    print("MAPA CABALÍSTICO COMPLETO")
    print("=" * 80)
    
    print(f"\n👤 Identidad: {mapa['identidad']['nombre']}")
    print(f"📅 Fecha: {mapa['identidad']['fecha_nacimiento']}")
    
    print("\n🌟 NÚMEROS PRINCIPALES Y CORRESPONDENCIAS:")
    print("-" * 80)
    
    for concepto, datos in mapa['numeros_principales'].items():
        if concepto != 'camino_vida':
            print(f"\n{concepto.upper()}:")
            print(f"  Valor: {datos['valor']}")
            print(f"  Tipo: {datos['tipo'].upper()}")
            
            arbol = datos.get('arbol', {})
            if arbol.get('tipo') == 'sefira':
                print(f"  🔮 Sefirá: {arbol['nombre_es']} ({arbol['nombre_he']})")
                print(f"  👼 Arcángel: {arbol['arcangel']}")
                print(f"  🪐 Planeta: {arbol['planeta']}")
                print(f"  💫 Significado: {arbol['significado']}")
            elif arbol.get('tipo') == 'sendero':
                print(f"  🛤️ Sendero: {arbol['numero']}")
                print(f"  🃏 Tarot: {arbol['nombre_tarot']}")
                print(f"  ✍️ Letra: {arbol['letra_hebrea']}")
                print(f"  💫 Significado: {arbol['significado']}")
    
    print("\n\n📊 INCLUSIÓN DE BASE:")
    print("-" * 80)
    print(f"Números Dominantes: {mapa['inclusion_base']['dominantes']}")
    print(f"Números Ausentes (Karmas): {mapa['inclusion_base']['ausentes']}")
    print(f"Maestrías: {mapa['inclusion_base']['maestrias']}")
    
    print("\n\n🔮 ANÁLISIS CABALÍSTICO:")
    print("-" * 80)
    for analisis in mapa['analisis_cabalista']:
        print(f"\n{analisis['aspecto'].upper()}:")
        print(f"  Correspondencia: {analisis['correspondencia']}")
        print(f"  {analisis['interpretacion']}")
    
    print("\n\n💡 RECOMENDACIONES:")
    print("-" * 80)
    for rec in mapa['recomendaciones']:
        print(f"\n{rec['categoria']}:")
        print(f"  Basado en: {rec['basado_en']}")
        print(f"  ➜ {rec['sugerencia']}")
    
    print("\n" + "=" * 80)
