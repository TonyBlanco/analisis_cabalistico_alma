#!/usr/bin/env python3
"""
Menú Interactivo de Consola - Sistema de Numerología Cabalística
Interfaz hermosa con colores, explicaciones y navegación fácil
"""

import sys
import json
from datetime import datetime

# For Windows consoles, force UTF-8 so emojis/acentos render correctamente
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    from cabala_py.integracion_arbol import generar_mapa_cabalista_completo
    from cabala_py.inclusion import calcular_inclusion_base, interpretar_inclusion
    from cabala_py.numerology import calcular_valores_nombre, calcular_camino_destino
    from cabala_py.gematria import calcular_gematria, comparar_sistemas, INFORMACION_SISTEMAS
    from cabala_py.utils import reduccion_cabalistica, reducir_teosofica
    from cabala_py.data import ALFABETO_ESPANOL_1995
    MODULOS_OK = True
except ImportError as e:
    print(f"⚠️  Advertencia: {e}")
    MODULOS_OK = False


# ============================================================================
# COLORES ANSI PARA TERMINAL
# ============================================================================

class Colors:
    """Códigos ANSI para colores en terminal"""
    # Colores básicos
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    
    # Colores de texto
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Colores brillantes
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'
    
    # Fondos
    BG_BLACK = '\033[40m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'


# ============================================================================
# MÉTODOS DISPONIBLES CON INFORMACIÓN COMPLETA
# ============================================================================

METODOS = {
    "dshevastan": {
        "nombre": "Dshevastan®",
        "descripcion": "Sistema moderno para español con Ñ",
        "origen": "España (1995+)",
        "ideal_para": "Nombres en español",
        "caracteristicas": [
            "Incluye la letra Ñ",
            "Integra Árbol de la Vida",
            "Sistema 1-22 (Senderos)",
            "Análisis completo"
        ],
        "color": Colors.BRIGHT_MAGENTA,
        "icono": "🇪🇸",
        "idioma": "español"
    },
    "pitagorico": {
        "nombre": "Pitagórico",
        "descripcion": "Base de la numerología occidental",
        "origen": "Grecia (~500 BCE)",
        "ideal_para": "Nombres en inglés y análisis universal",
        "caracteristicas": [
            "Reduce a 1-9",
            "Números Maestros (11, 22, 33)",
            "Sistema universal",
            "Arquetipos clásicos"
        ],
        "color": Colors.BRIGHT_BLUE,
        "icono": "🏛️",
        "idioma": "universal"
    },
    "caldeo": {
        "nombre": "Caldeo",
        "descripcion": "Sistema vibracional antiguo",
        "origen": "Babilonia (~3000+ años)",
        "ideal_para": "Análisis vibracional y sonoro",
        "caracteristicas": [
            "No usa el número 9",
            "Basado en sonido",
            "Sistema más antiguo",
            "Vibración fonética"
        ],
        "color": Colors.BRIGHT_CYAN,
        "icono": "🌙",
        "idioma": "universal"
    },
    "hebreo": {
        "nombre": "Hebreo Clásico",
        "descripcion": "Gematría tradicional de la Cábala",
        "origen": "Israel (~2000+ años)",
        "ideal_para": "Textos hebreos y sagrados",
        "caracteristicas": [
            "Valores 1-400",
            "Sistema original",
            "Para nombres hebreos",
            "Análisis de Torá"
        ],
        "color": Colors.BRIGHT_YELLOW,
        "icono": "🕍",
        "idioma": "hebreo"
    },
    "coquatrix": {
        "nombre": "Coquatrix",
        "descripcion": "Sistema de las 9 Casas",
        "origen": "Francia (Siglo XX)",
        "ideal_para": "Análisis profundo de personalidad",
        "caracteristicas": [
            "Inclusión de Base",
            "9 Casas de vida",
            "Identifica karmas",
            "Nombre + fecha"
        ],
        "color": Colors.BRIGHT_GREEN,
        "icono": "🇫🇷",
        "idioma": "francés/universal"
    },
    "ordinal": {
        "nombre": "Ordinal Simple",
        "descripcion": "Sistema más básico",
        "origen": "Universal (Moderno)",
        "ideal_para": "Cálculos rápidos",
        "caracteristicas": [
            "A=1, B=2... Z=26",
            "Muy simple",
            "No reduce números",
            "Fácil de calcular"
        ],
        "color": Colors.BRIGHT_WHITE,
        "icono": "📊",
        "idioma": "universal"
    },
    "comparar": {
        "nombre": "Comparar Múltiples",
        "descripcion": "Analiza con varios sistemas",
        "origen": "Análisis Multi-Sistema",
        "ideal_para": "Ver diferentes perspectivas",
        "caracteristicas": [
            "Compara 5 sistemas",
            "Perspectiva completa",
            "Identifica patrones",
            "Recomendado para explorar"
        ],
        "color": Colors.BRIGHT_RED,
        "icono": "🔮",
        "idioma": "todos"
    }
}

# Significados básicos para interpretar sumas y reducciones
SIGNIFICADOS_NUMEROS = {
    1: "Inicio, identidad, liderazgo",
    2: "Cooperación, vínculos, sensibilidad",
    3: "Creatividad, expresión, sociabilidad",
    4: "Estructura, trabajo, disciplina",
    5: "Cambio, libertad, movimiento",
    6: "Servicio, armonía, responsabilidad",
    7: "Búsqueda, introspección, espiritualidad",
    8: "Poder, logro material, gestión",
    9: "Cierre, sabiduría, servicio humanitario",
    11: "Visión inspirada (Maestro)",
    22: "Constructor de lo grande (Maestro)",
    33: "Maestro sanador/comunitario"
}


# ============================================================================
# FUNCIONES DE UTILIDAD PARA LA INTERFAZ
# ============================================================================

def limpiar_pantalla():
    """Limpia la pantalla de la consola"""
    import os
    os.system('cls' if os.name == 'nt' else 'clear')


def imprimir_banner():
    """Imprime el banner principal del programa"""
    banner = f"""
{Colors.BRIGHT_MAGENTA}╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║          {Colors.BRIGHT_CYAN}✨ SISTEMA DE NUMEROLOGÍA CABALÍSTICA ✨{Colors.BRIGHT_MAGENTA}                 ║
║                                                                       ║
║              {Colors.BRIGHT_YELLOW}🌟 Descubre tu Destino a través de los Números 🌟{Colors.BRIGHT_MAGENTA}         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""
    print(banner)


def imprimir_separador(caracter="─", longitud=75, color=Colors.BRIGHT_BLUE):
    """Imprime una línea separadora"""
    print(f"{color}{caracter * longitud}{Colors.RESET}")


def imprimir_titulo(texto, color=Colors.BRIGHT_CYAN):
    """Imprime un título destacado"""
    print(f"\n{color}{Colors.BOLD}{'═' * 75}")
    print(f"  {texto}")
    print(f"{'═' * 75}{Colors.RESET}\n")


def imprimir_subtitulo(texto, color=Colors.BRIGHT_YELLOW):
    """Imprime un subtítulo"""
    print(f"{color}{Colors.BOLD}▸ {texto}{Colors.RESET}")


def imprimir_info(etiqueta, valor, color_etiqueta=Colors.BRIGHT_GREEN):
    """Imprime información con formato"""
    print(f"{color_etiqueta}{etiqueta}:{Colors.RESET} {valor}")


def imprimir_lista(items, color=Colors.BRIGHT_WHITE, prefijo="  •"):
    """Imprime una lista de items"""
    for item in items:
        print(f"{color}{prefijo} {item}{Colors.RESET}")


def imprimir_box(titulo, contenido, color=Colors.BRIGHT_CYAN):
    """Imprime contenido en una caja"""
    width = 71
    print(f"\n{color}┌{'─' * width}┐")
    print(f"│ {Colors.BOLD}{titulo.center(width - 2)}{Colors.RESET}{color} │")
    print(f"├{'─' * width}┤{Colors.RESET}")
    for linea in contenido:
        padding = width - len(linea) - 2
        print(f"{color}│{Colors.RESET} {linea}{' ' * padding} {color}│{Colors.RESET}")
    print(f"{color}└{'─' * width}┘{Colors.RESET}\n")


def esperar_enter(mensaje="Presiona ENTER para continuar..."):
    """Espera que el usuario presione Enter"""
    input(f"\n{Colors.BRIGHT_BLACK}{mensaje}{Colors.RESET}")


# ============================================================================
# FUNCIONES DE ENTRADA DE DATOS
# ============================================================================

def solicitar_idioma():
    """Solicita el idioma del nombre para recomendar método"""
    imprimir_titulo("🌍 SELECCIÓN DE IDIOMA", Colors.BRIGHT_CYAN)
    
    print(f"{Colors.BRIGHT_WHITE}¿En qué idioma está el nombre a analizar?{Colors.RESET}\n")
    
    opciones = [
        ("1", "🇪🇸 Español", "dshevastan"),
        ("2", "🇬🇧 Inglés", "pitagorico"),
        ("3", "🇮🇱 Hebreo", "hebreo"),
        ("4", "🌐 Otro/Universal", "ordinal")
    ]
    
    for num, desc, _ in opciones:
        print(f"  {Colors.BRIGHT_YELLOW}{num}.{Colors.RESET} {desc}")
    
    print(f"\n  {Colors.BRIGHT_MAGENTA}0.{Colors.RESET} Elegir método manualmente")
    
    while True:
        opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige una opción (0-4): {Colors.RESET}").strip()
        
        if opcion == "0":
            return None
        
        for num, _, metodo in opciones:
            if opcion == num:
                metodo_info = METODOS[metodo]
                print(f"\n{Colors.BRIGHT_GREEN}✓ Recomendado: {metodo_info['icono']} {metodo_info['nombre']}{Colors.RESET}")
                return metodo
        
        print(f"{Colors.BRIGHT_RED}Opción inválida. Intenta de nuevo.{Colors.RESET}")


def mostrar_metodos_disponibles():
    """Muestra todos los métodos disponibles con detalles"""
    imprimir_titulo("📚 MÉTODOS DISPONIBLES", Colors.BRIGHT_CYAN)
    
    metodos_lista = list(METODOS.items())
    
    for idx, (key, info) in enumerate(metodos_lista, 1):
        print(f"\n{info['color']}{Colors.BOLD}{idx}. {info['icono']} {info['nombre']}{Colors.RESET}")
        print(f"   {Colors.DIM}{info['descripcion']}{Colors.RESET}")
        print(f"   {Colors.BRIGHT_BLACK}Origen: {info['origen']}{Colors.RESET}")
        print(f"   {Colors.BRIGHT_BLACK}Ideal para: {info['ideal_para']}{Colors.RESET}")
    
    return metodos_lista


def solicitar_metodo():
    """Solicita al usuario que elija un método"""
    # Primero preguntar idioma
    metodo_recomendado = solicitar_idioma()
    
    if metodo_recomendado:
        confirmar = input(f"\n{Colors.BRIGHT_YELLOW}¿Usar este método? (S/n): {Colors.RESET}").strip().lower()
        if confirmar != 'n':
            return metodo_recomendado
    
    # Mostrar todos los métodos
    limpiar_pantalla()
    imprimir_banner()
    metodos_lista = mostrar_metodos_disponibles()
    
    while True:
        try:
            opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige un método (1-{len(metodos_lista)}): {Colors.RESET}").strip()
            idx = int(opcion) - 1
            
            if 0 <= idx < len(metodos_lista):
                metodo_key = metodos_lista[idx][0]
                return metodo_key
            else:
                print(f"{Colors.BRIGHT_RED}Número fuera de rango. Intenta de nuevo.{Colors.RESET}")
        except ValueError:
            print(f"{Colors.BRIGHT_RED}Entrada inválida. Ingresa un número.{Colors.RESET}")


def solicitar_datos_personales():
    """Solicita nombre y fecha de nacimiento"""
    imprimir_titulo("👤 DATOS PERSONALES", Colors.BRIGHT_YELLOW)
    
    # Nombre
    while True:
        nombre = input(f"{Colors.BRIGHT_GREEN}Nombre completo: {Colors.RESET}").strip().upper()
        if nombre:
            break
        print(f"{Colors.BRIGHT_RED}El nombre no puede estar vacío.{Colors.RESET}")
    
    # Fecha de nacimiento
    print(f"\n{Colors.BRIGHT_CYAN}Fecha de Nacimiento:{Colors.RESET}")
    
    while True:
        try:
            dia = int(input(f"  Día (1-31): ").strip())
            if 1 <= dia <= 31:
                break
            print(f"{Colors.BRIGHT_RED}Día inválido.{Colors.RESET}")
        except ValueError:
            print(f"{Colors.BRIGHT_RED}Ingresa un número válido.{Colors.RESET}")
    
    while True:
        try:
            mes = int(input(f"  Mes (1-12): ").strip())
            if 1 <= mes <= 12:
                break
            print(f"{Colors.BRIGHT_RED}Mes inválido.{Colors.RESET}")
        except ValueError:
            print(f"{Colors.BRIGHT_RED}Ingresa un número válido.{Colors.RESET}")
    
    while True:
        try:
            anio = int(input(f"  Año (ej. 1990): ").strip())
            if 1900 <= anio <= datetime.now().year:
                break
            print(f"{Colors.BRIGHT_RED}Año inválido.{Colors.RESET}")
        except ValueError:
            print(f"{Colors.BRIGHT_RED}Ingresa un número válido.{Colors.RESET}")
    
    # Confirmar datos
    fecha_str = f"{dia:02d}/{mes:02d}/{anio}"
    print(f"\n{Colors.BRIGHT_CYAN}Datos ingresados:{Colors.RESET}")
    imprimir_info("  Nombre", nombre, Colors.BRIGHT_YELLOW)
    imprimir_info("  Fecha de nacimiento", fecha_str, Colors.BRIGHT_YELLOW)
    
    confirmar = input(f"\n{Colors.BRIGHT_GREEN}¿Son correctos estos datos? (S/n): {Colors.RESET}").strip().lower()
    
    if confirmar == 'n':
        return solicitar_datos_personales()
    
    return nombre, dia, mes, anio


# ============================================================================
# FUNCIONES DE PROCESAMIENTO
# ============================================================================

def ejecutar_analisis(metodo, nombre, dia, mes, anio):
    """Ejecuta el análisis según el método seleccionado"""
    
    if not MODULOS_OK:
        return {
            "error": "Módulos no disponibles",
            "mensaje": "Verifica que cabala_py esté instalado correctamente"
        }
    
    try:
        if metodo == "dshevastan":
            resultado = generar_mapa_cabalista_completo(nombre, dia, mes, anio)
            return {
                "tipo": "dshevastan",
                "datos": resultado
            }
        
        elif metodo == "coquatrix":
            inclusion = calcular_inclusion_base(nombre, dia, mes, anio)
            interpretacion = interpretar_inclusion(inclusion)
            return {
                "tipo": "coquatrix",
                "inclusion": inclusion,
                "interpretacion": interpretacion
            }
        
        elif metodo == "comparar":
            sistemas = ['pitagorico', 'caldeo', 'dshevastan', 'ordinal']
            resultados = comparar_sistemas(nombre, sistemas)
            return {
                "tipo": "comparar",
                "resultados": resultados
            }
        
        elif metodo in ["pitagorico", "caldeo", "hebreo", "ordinal"]:
            resultado = calcular_gematria(nombre, metodo)
            return {
                "tipo": "gematria",
                "sistema": metodo,
                "datos": resultado
            }
        
        else:
            return {
                "error": "Método no implementado",
                "metodo": metodo
            }
    
    except Exception as e:
        return {
            "error": str(e),
            "tipo": "excepcion"
        }


def mostrar_resultados(resultado, metodo_info):
    """Muestra los resultados del análisis de forma hermosa"""
    limpiar_pantalla()
    imprimir_banner()
    
    color = metodo_info['color']
    
    imprimir_titulo(f"{metodo_info['icono']} RESULTADO - {metodo_info['nombre'].upper()}", color)
    
    # Verificar errores
    if "error" in resultado:
        imprimir_box("ERROR", [resultado.get("mensaje", resultado["error"])], Colors.BRIGHT_RED)
        return
    
    # Mostrar según tipo de resultado
    tipo = resultado.get("tipo")
    
    if tipo == "dshevastan":
        mostrar_resultado_dshevastan(resultado["datos"])
    
    elif tipo == "coquatrix":
        mostrar_resultado_coquatrix(resultado)
    
    elif tipo == "comparar":
        mostrar_resultado_comparar(resultado["resultados"])
    
    elif tipo == "gematria":
        mostrar_resultado_gematria(resultado)
    
    else:
        print(json.dumps(resultado, ensure_ascii=False, indent=2))


def mostrar_resultado_dshevastan(datos):
    """Muestra resultado del método Dshevastan"""
    # Identidad
    imprimir_subtitulo("📋 IDENTIDAD")
    imprimir_info("  Nombre", datos["identidad"]["nombre"])
    imprimir_info("  Fecha", datos["identidad"]["fecha_nacimiento"])
    
    # Números principales
    print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}🔢 NÚMEROS PRINCIPALES{Colors.RESET}")
    
    nums = datos["numeros_principales"]
    
    for concepto in ["esencia", "expresion", "herencia", "destino"]:
        if concepto in nums:
            info = nums[concepto]
            nombre_concepto = concepto.replace("_", " ").title()
            print(f"\n  {Colors.BRIGHT_CYAN}• {nombre_concepto}:{Colors.RESET} {Colors.BRIGHT_WHITE}{Colors.BOLD}{info['valor']}{Colors.RESET}")
            
            if 'arbol' in info and info['arbol']:
                arbol = info['arbol']
                if arbol.get('tipo') == 'sefira':
                    print(f"    {Colors.BRIGHT_GREEN}→ Sefirá: {arbol['nombre_es']} ({arbol['nombre_he']}){Colors.RESET}")
                    print(f"    {Colors.BRIGHT_BLACK}  Arcángel: {arbol['arcangel']}{Colors.RESET}")
    
    # Inclusión
    print(f"\n{Colors.BRIGHT_MAGENTA}{Colors.BOLD}📊 INCLUSIÓN DE BASE{Colors.RESET}")
    inclusion = datos["inclusion_base"]
    
    if inclusion["dominantes"]:
        print(f"  {Colors.BRIGHT_GREEN}• Dominantes: {', '.join(map(str, inclusion['dominantes']))}{Colors.RESET}")
    
    if inclusion["ausentes"]:
        print(f"  {Colors.BRIGHT_RED}• Ausentes (Karmas): {', '.join(map(str, inclusion['ausentes']))}{Colors.RESET}")
    
    if inclusion["maestrias"]:
        print(f"  {Colors.BRIGHT_YELLOW}• Maestrías: {', '.join(map(str, inclusion['maestrias']))}{Colors.RESET}")

    # Temas clave
    temas = datos.get("temas_clave", {})
    if temas:
        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}🧭 TEMAS CLAVE{Colors.RESET}")
        origen = temas.get("tema_origen", {})
        if origen:
            print(f"  Origen: {origen.get('nombre_es', 'N/A')} ({origen.get('tipo', '')})")
        transform = temas.get("principio_transformacion", {})
        if transform:
            print(f"  Transformación: {transform.get('numero')} (edad {transform.get('edad_transformacion')})")
        destino = temas.get("tema_destino", {})
        if destino:
            print(f"  Destino: {destino.get('nombre_es', destino.get('tipo', ''))}")

    # Números de vibración
    vibr = datos.get("vibraciones", {})
    if vibr:
        print(f"\n{Colors.BRIGHT_GREEN}{Colors.BOLD}🔔 NÚMEROS DE VIBRACIÓN{Colors.RESET}")
        imprimir_info("  Cuerpo", vibr.get("cuerpo"))
        imprimir_info("  Alma", vibr.get("alma"))
        imprimir_info("  Espíritu", vibr.get("espiritu"))
        imprimir_info("  Efecto sanador", vibr.get("efecto_sanador"))
        imprimir_info("  Lema de vida", vibr.get("lema_vida"))

    # Cuentas pendientes (barras)
    cuentas = datos.get("cuentas_pendientes", {})
    if cuentas:
        print(f"\n{Colors.BRIGHT_MAGENTA}{Colors.BOLD}📉 CUENTAS PENDIENTES{Colors.RESET}")
        for num in sorted(cuentas.keys()):
            info = cuentas[num]
            barras = info.get("barras", "")
            print(f"  {num}: {Colors.BRIGHT_WHITE}{barras or '—'}{Colors.RESET} ({info.get('frecuencia', 0)})")

    # Días de fuerza personal
    fuerza = datos.get("dias_fuerza", {})
    if fuerza:
        print(f"\n{Colors.BRIGHT_YELLOW}{Colors.BOLD}📅 DÍAS DE FUERZA PERSONAL{Colors.RESET}")
        print(f"  Día de nacimiento: {fuerza.get('dia_original')}")
        print(f"  Raíz: {fuerza.get('raiz')} → Días sinérgicos: {', '.join(map(str, fuerza.get('dias_sinergicos', [])))}")

    # Turbulencias
    turb = datos.get("turbulencias", {})
    if turb:
        print(f"\n{Colors.BRIGHT_RED}{Colors.BOLD}⚡ TURBULENCIAS ESPIRITUALES{Colors.RESET}")
        print(f"  Edad de transformación: {turb.get('edad_transformacion')} (raíz {turb.get('camino_reducido')})")
        for nota in turb.get("notas", []):
            print(f"   • {nota}")

    # Secuencia principal
    secuencia = datos.get("secuencia_principal", [])
    if secuencia:
        print(f"\n{Colors.BRIGHT_CYAN}{Colors.BOLD}🧬 SECUENCIA NUMÉRICA PRINCIPAL{Colors.RESET}")
        for item in secuencia:
            print(f"  {item['etapa']}: {item['valor']}")


def mostrar_resultado_coquatrix(resultado):
    """Muestra resultado del método Coquatrix"""
    inclusion = resultado["inclusion"]
    
    print(f"{Colors.BRIGHT_CYAN}📊 Distribución en las 9 Casas:{Colors.RESET}\n")
    
    for casa in range(1, 10):
        frecuencia = inclusion["casas"][casa]
        barra = "█" * frecuencia if frecuencia > 0 else "○"
        color = Colors.BRIGHT_GREEN if frecuencia > 0 else Colors.BRIGHT_BLACK
        print(f"  Casa {casa}: {color}{barra} ({frecuencia}){Colors.RESET}")
    
    print(f"\n{Colors.BRIGHT_YELLOW}💡 Interpretación:{Colors.RESET}")
    for linea in resultado["interpretacion"]:
        print(f"  • {linea}")


def mostrar_resultado_comparar(resultados):
    """Muestra comparación de múltiples sistemas"""
    print(f"{Colors.BRIGHT_CYAN}Comparando sistemas:{Colors.RESET}\n")
    
    # Ordenar por valor
    items = [(sistema, datos) for sistema, datos in resultados.items() if "error" not in datos]
    items.sort(key=lambda x: x[1]["suma_total"], reverse=True)
    
    max_valor = max(datos["suma_total"] for _, datos in items) if items else 1
    
    for sistema, datos in items:
        valor = datos["suma_total"]
        barra_len = int((valor / max_valor) * 30)
        barra = "█" * barra_len
        
        color = METODOS.get(sistema, {}).get("color", Colors.BRIGHT_WHITE)
        print(f"  {color}{sistema.upper():<15}{Colors.RESET} {Colors.BRIGHT_WHITE}{valor:>4}{Colors.RESET} {color}{barra}{Colors.RESET}")


def mostrar_resultado_gematria(resultado):
    """Muestra resultado de gematría simple"""
    datos = resultado["datos"]
    sistema = resultado["sistema"]
    info_sistema = INFORMACION_SISTEMAS.get(sistema, {})
    
    imprimir_info("Sistema", sistema.upper())
    if info_sistema:
        imprimir_info("Nombre", info_sistema.get("nombre", ""))
        imprimir_info("Origen", info_sistema.get("origen", ""))
        imprimir_info("Uso", info_sistema.get("uso", ""))
        if sistema == "caldeo":
            print(f"{Colors.BRIGHT_BLACK}Nota: Caldeo no usa el número 9; se centra en la vibración sonora.{Colors.RESET}")
    
    suma = datos["suma_total"]
    reduc, reduc_simple = reduccion_cabalistica(suma, max_limite=22, mantener_maestros=True)
    reduc_teos = reducir_teosofica(suma)
    significado = SIGNIFICADOS_NUMEROS.get(reduc, SIGNIFICADOS_NUMEROS.get(reduc_teos, ""))
    
    imprimir_info("Suma Total", suma)
    imprimir_info("Reducción cabalística", f"{reduc}" + (f"/{reduc_simple}" if reduc != reduc_simple else ""))
    imprimir_info("Reducción teosófica", reduc_teos)
    if significado:
        imprimir_info("Interpretación básica", significado)
    
    print(f"\n{Colors.BRIGHT_CYAN}Desglose:{Colors.RESET}")
    desglose = " + ".join([f"{letra}({valor})" for letra, valor in datos["valores"]])
    print(f"  {desglose}")


# ============================================================================
# MENÚ PRINCIPAL
# ============================================================================

def menu_principal():
    """Menú principal del programa"""
    while True:
        limpiar_pantalla()
        imprimir_banner()
        
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}MENÚ PRINCIPAL{Colors.RESET}\n")
        
        opciones = [
            ("1", "🔮 Generar Análisis Numerológico", "analizar"),
            ("2", "📚 Ver Información de Métodos", "info"),
            ("3", "❓ Ayuda y Guía de Uso", "ayuda"),
            ("4", "🚪 Salir", "salir")
        ]
        
        for num, desc, _ in opciones:
            print(f"  {Colors.BRIGHT_YELLOW}{num}.{Colors.RESET} {desc}")
        
        opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige una opción (1-4): {Colors.RESET}").strip()
        
        # Procesar opción
        for num, _, accion in opciones:
            if opcion == num:
                if accion == "salir":
                    limpiar_pantalla()
                    print(f"\n{Colors.BRIGHT_CYAN}✨ Gracias por usar el Sistema de Numerología Cabalística ✨{Colors.RESET}\n")
                    print(f"{Colors.BRIGHT_YELLOW}Que los números iluminen tu camino 🌟{Colors.RESET}\n")
                    sys.exit(0)
                
                elif accion == "analizar":
                    ejecutar_flujo_analisis()
                
                elif accion == "info":
                    mostrar_info_metodos()
                
                elif accion == "ayuda":
                    mostrar_ayuda()
                
                break
        else:
            print(f"{Colors.BRIGHT_RED}Opción inválida.{Colors.RESET}")
            esperar_enter()


def ejecutar_flujo_analisis():
    """Flujo completo de análisis"""
    limpiar_pantalla()
    imprimir_banner()
    
    # Paso 1: Elegir método
    metodo = solicitar_metodo()
    metodo_info = METODOS[metodo]
    
    # Paso 2: Solicitar datos
    limpiar_pantalla()
    imprimir_banner()
    nombre, dia, mes, anio = solicitar_datos_personales()
    
    # Paso 3: Procesar
    print(f"\n{Colors.BRIGHT_CYAN}⏳ Procesando análisis...{Colors.RESET}")
    resultado = ejecutar_analisis(metodo, nombre, dia, mes, anio)
    
    # Paso 4: Mostrar resultados
    mostrar_resultados(resultado, metodo_info)
    
    # Paso 5: Opciones post-resultado
    print(f"\n{Colors.BRIGHT_CYAN}Opciones:{Colors.RESET}")
    print(f"  {Colors.BRIGHT_YELLOW}1.{Colors.RESET} Guardar resultado")
    print(f"  {Colors.BRIGHT_YELLOW}2.{Colors.RESET} Nuevo análisis")
    print(f"  {Colors.BRIGHT_YELLOW}3.{Colors.RESET} Menú principal")
    
    opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige (1-3): {Colors.RESET}").strip()
    
    if opcion == "1":
        guardar_resultado(nombre, resultado)
    elif opcion == "2":
        ejecutar_flujo_analisis()


def mostrar_info_metodos():
    """Muestra información detallada de todos los métodos"""
    limpiar_pantalla()
    imprimir_banner()
    imprimir_titulo("📚 INFORMACIÓN DE MÉTODOS", Colors.BRIGHT_CYAN)
    
    for key, info in METODOS.items():
        print(f"\n{info['color']}{Colors.BOLD}{'=' * 75}")
        print(f"{info['icono']} {info['nombre'].upper()}")
        print(f"{'=' * 75}{Colors.RESET}\n")
        
        imprimir_info("Descripción", info['descripcion'], info['color'])
        imprimir_info("Origen", info['origen'], info['color'])
        imprimir_info("Ideal para", info['ideal_para'], info['color'])
        
        print(f"\n{info['color']}Características:{Colors.RESET}")
        imprimir_lista(info['caracteristicas'], info['color'])
    
    esperar_enter()


def mostrar_ayuda():
    """Muestra la guía de ayuda"""
    limpiar_pantalla()
    imprimir_banner()
    imprimir_titulo("❓ GUÍA DE USO", Colors.BRIGHT_YELLOW)
    
    ayuda = [
        "1. Elige el método según el idioma del nombre:",
        "   • Español → Dshevastan®",
        "   • Inglés → Pitagórico o Caldeo",
        "   • Hebreo → Hebreo Clásico",
        "",
        "2. Ingresa el nombre COMPLETO (como aparece en documentos)",
        "",
        "3. Ingresa la fecha de nacimiento exacta",
        "",
        "4. Revisa los resultados y su interpretación",
        "",
        "5. Para análisis profundo, usa 'Comparar Múltiples'",
        "",
        "💡 Consejos:",
        "   • Usa mayúsculas para nombres",
        "   • Incluye todos los apellidos",
        "   • La fecha debe ser exacta",
        "   • Prueba varios métodos para perspectivas diferentes"
    ]
    
    imprimir_lista(ayuda, Colors.BRIGHT_WHITE, "")
    esperar_enter()


def guardar_resultado(nombre, resultado):
    """Guarda el resultado en un archivo"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"numerologia_{nombre.replace(' ', '_')}_{timestamp}.json"
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        
        print(f"\n{Colors.BRIGHT_GREEN}✓ Resultado guardado en: {filename}{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.BRIGHT_RED}✗ Error al guardar: {e}{Colors.RESET}")
    
    esperar_enter()


# ============================================================================
# FUNCIONES ADICIONALES Y EASTER EGGS
# ============================================================================

def mostrar_numero_del_dia():
    """Muestra el número del día actual"""
    hoy = datetime.now()
    suma = sum(int(d) for d in hoy.strftime("%d%m%Y"))
    
    # Reducir a un solo dígito
    while suma > 9:
        suma = sum(int(d) for d in str(suma))
    
    print(f"\n{Colors.BRIGHT_MAGENTA}✨ Número del Día: {suma} ✨{Colors.RESET}")
    
    significados = {
        1: "Nuevos comienzos, liderazgo, independencia",
        2: "Colaboración, equilibrio, diplomacia",
        3: "Creatividad, expresión, alegría",
        4: "Trabajo, estabilidad, construcción",
        5: "Cambio, libertad, aventura",
        6: "Armonía, responsabilidad, servicio",
        7: "Introspección, espiritualidad, análisis",
        8: "Poder, abundancia, manifestación",
        9: "Culminación, sabiduría, altruismo"
    }
    
    print(f"{Colors.BRIGHT_CYAN}Energía del día: {significados.get(suma, 'Desconocida')}{Colors.RESET}\n")


def verificar_compatibilidad(nombre1, nombre2):
    """Verifica compatibilidad entre dos nombres"""
    if not MODULOS_OK:
        print(f"{Colors.BRIGHT_RED}Módulos no disponibles{Colors.RESET}")
        return
    
    print(f"\n{Colors.BRIGHT_CYAN}Calculando compatibilidad...{Colors.RESET}\n")
    
    # Calcular valores con Pitagórico
    resultado1 = calcular_gematria(nombre1, 'pitagorico')
    resultado2 = calcular_gematria(nombre2, 'pitagorico')
    
    valor1 = resultado1['suma_total']
    valor2 = resultado2['suma_total']
    
    # Reducir a un dígito
    while valor1 > 9:
        valor1 = sum(int(d) for d in str(valor1))
    while valor2 > 9:
        valor2 = sum(int(d) for d in str(valor2))
    
    diferencia = abs(valor1 - valor2)
    
    # Calcular compatibilidad
    if diferencia == 0:
        compatibilidad = 100
        mensaje = "¡Compatibilidad perfecta! Vibración idéntica."
    elif diferencia <= 2:
        compatibilidad = 85
        mensaje = "Excelente compatibilidad. Energías complementarias."
    elif diferencia <= 4:
        compatibilidad = 65
        mensaje = "Buena compatibilidad. Algunas diferencias enriquecedoras."
    elif diferencia <= 6:
        compatibilidad = 45
        mensaje = "Compatibilidad moderada. Requiere esfuerzo mutuo."
    else:
        compatibilidad = 25
        mensaje = "Baja compatibilidad. Energías muy diferentes."
    
    # Mostrar resultados
    imprimir_info(f"{nombre1}", f"Número {valor1}", Colors.BRIGHT_YELLOW)
    imprimir_info(f"{nombre2}", f"Número {valor2}", Colors.BRIGHT_YELLOW)
    print(f"\n{Colors.BRIGHT_MAGENTA}{'=' * 50}")
    print(f"💑 Compatibilidad: {compatibilidad}%")
    print(f"{'=' * 50}{Colors.RESET}")
    print(f"\n{mensaje}\n")


def menu_herramientas_extras():
    """Menú con herramientas adicionales"""
    while True:
        limpiar_pantalla()
        imprimir_banner()
        imprimir_titulo("🛠️ HERRAMIENTAS EXTRAS", Colors.BRIGHT_MAGENTA)
        
        opciones = [
            ("1", "📅 Número del Día", "dia"),
            ("2", "💑 Compatibilidad de Nombres", "compatibilidad"),
            ("3", "🔢 Calculadora Rápida", "calculadora"),
            ("4", "🎲 Número Aleatorio Místico", "aleatorio"),
            ("5", "⬅️  Volver al Menú Principal", "volver")
        ]
        
        for num, desc, _ in opciones:
            print(f"  {Colors.BRIGHT_YELLOW}{num}.{Colors.RESET} {desc}")
        
        opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige (1-5): {Colors.RESET}").strip()
        
        if opcion == "1":
            limpiar_pantalla()
            imprimir_banner()
            mostrar_numero_del_dia()
            esperar_enter()
        
        elif opcion == "2":
            limpiar_pantalla()
            imprimir_banner()
            imprimir_titulo("💑 COMPATIBILIDAD DE NOMBRES", Colors.BRIGHT_MAGENTA)
            nombre1 = input(f"{Colors.BRIGHT_GREEN}Primer nombre: {Colors.RESET}").strip().upper()
            nombre2 = input(f"{Colors.BRIGHT_GREEN}Segundo nombre: {Colors.RESET}").strip().upper()
            verificar_compatibilidad(nombre1, nombre2)
            esperar_enter()
        
        elif opcion == "3":
            calculadora_rapida()
        
        elif opcion == "4":
            mostrar_numero_mistico()
            esperar_enter()
        
        elif opcion == "5":
            break
        else:
            print(f"{Colors.BRIGHT_RED}Opción inválida{Colors.RESET}")
            esperar_enter()


def calculadora_rapida():
    """Calculadora simple de gematría"""
    limpiar_pantalla()
    imprimir_banner()
    imprimir_titulo("🔢 CALCULADORA RÁPIDA", Colors.BRIGHT_CYAN)
    
    palabra = input(f"{Colors.BRIGHT_GREEN}Palabra o nombre: {Colors.RESET}").strip().upper()
    
    if not MODULOS_OK:
        print(f"{Colors.BRIGHT_RED}Módulos no disponibles{Colors.RESET}")
        esperar_enter()
        return
    
    print(f"\n{Colors.BRIGHT_CYAN}Calculando en múltiples sistemas...{Colors.RESET}\n")
    
    sistemas = ['pitagorico', 'caldeo', 'ordinal']
    for sistema in sistemas:
        try:
            resultado = calcular_gematria(palabra, sistema)
            color = METODOS.get(sistema, {}).get('color', Colors.BRIGHT_WHITE)
            print(f"  {color}{sistema.upper():<15}{Colors.RESET} = {Colors.BRIGHT_WHITE}{resultado['suma_total']}{Colors.RESET}")
        except:
            pass
    
    esperar_enter()


def mostrar_numero_mistico():
    """Genera y muestra un número místico aleatorio con significado"""
    import random
    
    limpiar_pantalla()
    imprimir_banner()
    imprimir_titulo("🎲 NÚMERO MÍSTICO DEL MOMENTO", Colors.BRIGHT_MAGENTA)
    
    numero = random.randint(1, 9)
    
    significados = {
        1: ("El Iniciador", "Es momento de comenzar algo nuevo. Confía en tu liderazgo."),
        2: ("El Equilibrista", "Busca balance y armonía. Colabora con otros."),
        3: ("El Creador", "Expresa tu creatividad. Comunica tus ideas."),
        4: ("El Constructor", "Trabaja con disciplina. Construye bases sólidas."),
        5: ("El Aventurero", "Abraza el cambio. Busca nuevas experiencias."),
        6: ("El Sanador", "Cuida de otros. Busca armonía en tus relaciones."),
        7: ("El Místico", "Medita y reflexiona. Busca respuestas internas."),
        8: ("El Manifestador", "Es tiempo de abundancia. Confía en tu poder."),
        9: ("El Sabio", "Comparte tu sabiduría. Ayuda a la humanidad.")
    }
    
    titulo, mensaje = significados[numero]
    
    print(f"\n{Colors.BRIGHT_YELLOW}{'*' * 60}")
    print(f"  Tu número místico es: {Colors.BRIGHT_WHITE}{Colors.BOLD}{numero}{Colors.RESET}{Colors.BRIGHT_YELLOW}")
    print(f"  {titulo}")
    print(f"{'*' * 60}{Colors.RESET}\n")
    
    print(f"{Colors.BRIGHT_CYAN}{mensaje}{Colors.RESET}\n")


# ============================================================================
# MENÚ PRINCIPAL MEJORADO
# ============================================================================

def menu_principal_mejorado():
    """Menú principal mejorado con más opciones"""
    while True:
        limpiar_pantalla()
        imprimir_banner()
        
        # Mostrar número del día en la parte superior
        hoy = datetime.now()
        print(f"{Colors.BRIGHT_BLACK}Hoy es {hoy.strftime('%d de %B, %Y')}{Colors.RESET}")
        mostrar_numero_del_dia()
        
        print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}MENÚ PRINCIPAL{Colors.RESET}\n")
        
        opciones = [
            ("1", "🔮 Generar Análisis Numerológico Completo", "analizar"),
            ("2", "📚 Ver Información Detallada de Métodos", "info"),
            ("3", "🛠️ Herramientas Extras (Compatibilidad, etc.)", "extras"),
            ("4", "❓ Ayuda y Guía de Uso", "ayuda"),
            ("5", "💾 Ver Análisis Guardados", "historial"),
            ("6", "🚪 Salir", "salir")
        ]
        
        for num, desc, _ in opciones:
            print(f"  {Colors.BRIGHT_YELLOW}{num}.{Colors.RESET} {desc}")
        
        opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige una opción (1-6): {Colors.RESET}").strip()
        
        # Procesar opción
        for num, _, accion in opciones:
            if opcion == num:
                if accion == "salir":
                    despedida()
                    sys.exit(0)
                
                elif accion == "analizar":
                    ejecutar_flujo_analisis()
                
                elif accion == "info":
                    mostrar_info_metodos()
                
                elif accion == "ayuda":
                    mostrar_ayuda()
                
                elif accion == "extras":
                    menu_herramientas_extras()
                
                elif accion == "historial":
                    mostrar_historial()
                
                break
        else:
            print(f"{Colors.BRIGHT_RED}Opción inválida.{Colors.RESET}")
            esperar_enter()


def despedida():
    """Mensaje de despedida"""
    limpiar_pantalla()
    
    despedida_art = f"""
{Colors.BRIGHT_CYAN}
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║        ✨ Gracias por usar el Sistema de Numerología ✨       ║
    ║                      Cabalística                              ║
    ║                                                               ║
    ║           {Colors.BRIGHT_YELLOW}🌟 Que los números iluminen tu camino 🌟{Colors.BRIGHT_CYAN}           ║
    ║                                                               ║
    ║              {Colors.BRIGHT_MAGENTA}"El universo está escrito en lenguaje{Colors.BRIGHT_CYAN}            ║
    ║              {Colors.BRIGHT_MAGENTA}matemático" - Galileo Galilei{Colors.BRIGHT_CYAN}                  ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
{Colors.RESET}
"""
    print(despedida_art)


def mostrar_historial():
    """Muestra el historial de análisis guardados"""
    import glob
    import os
    
    limpiar_pantalla()
    imprimir_banner()
    imprimir_titulo("💾 HISTORIAL DE ANÁLISIS", Colors.BRIGHT_CYAN)
    
    archivos = glob.glob("numerologia_*.json")
    
    if not archivos:
        print(f"{Colors.BRIGHT_YELLOW}No hay análisis guardados todavía.{Colors.RESET}\n")
        esperar_enter()
        return
    
    print(f"Se encontraron {len(archivos)} análisis guardados:\n")
    
    for idx, archivo in enumerate(archivos, 1):
        # Obtener información del archivo
        stats = os.stat(archivo)
        fecha = datetime.fromtimestamp(stats.st_mtime)
        tamano = stats.st_size
        
        print(f"{Colors.BRIGHT_YELLOW}{idx}.{Colors.RESET} {archivo}")
        print(f"   {Colors.BRIGHT_BLACK}Fecha: {fecha.strftime('%d/%m/%Y %H:%M')} | Tamaño: {tamano} bytes{Colors.RESET}")
    
    print(f"\n{Colors.BRIGHT_GREEN}Opciones:{Colors.RESET}")
    print(f"  {Colors.BRIGHT_YELLOW}[número]{Colors.RESET} Ver análisis")
    print(f"  {Colors.BRIGHT_YELLOW}[0]{Colors.RESET} Volver")
    
    opcion = input(f"\n{Colors.BRIGHT_GREEN}Elige: {Colors.RESET}").strip()
    
    if opcion == "0":
        return
    
    try:
        idx = int(opcion) - 1
        if 0 <= idx < len(archivos):
            with open(archivos[idx], 'r', encoding='utf-8') as f:
                contenido = json.load(f)
            
            limpiar_pantalla()
            imprimir_banner()
            print(f"\n{Colors.BRIGHT_CYAN}Contenido de: {archivos[idx]}{Colors.RESET}\n")
            print(json.dumps(contenido, ensure_ascii=False, indent=2))
            esperar_enter()
    except:
        print(f"{Colors.BRIGHT_RED}Opción inválida{Colors.RESET}")
        esperar_enter()


# ============================================================================
# PUNTO DE ENTRADA PRINCIPAL
# ============================================================================

def main():
    """Función principal del programa"""
    try:
        # Verificar que los módulos estén disponibles
        if not MODULOS_OK:
            print(f"\n{Colors.BRIGHT_RED}⚠️  ADVERTENCIA{Colors.RESET}")
            print(f"Algunos módulos no están disponibles.")
            print(f"El programa funcionará con funcionalidad limitada.\n")
            esperar_enter()
        
        # Iniciar menú principal
        menu_principal_mejorado()
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.BRIGHT_YELLOW}Programa interrumpido por el usuario.{Colors.RESET}")
        despedida()
        sys.exit(0)
    
    except Exception as e:
        print(f"\n{Colors.BRIGHT_RED}Error inesperado: {e}{Colors.RESET}")
        esperar_enter()
        sys.exit(1)


if __name__ == "__main__":
    main()
