# cabala_py/arbol_vida.py
"""
Datos estructurados del Árbol de la Vida Cabalístico
Incluye: Sefiroth, Senderos, Nombres Divinos, Arcángeles, Órdenes Angélicas
Adaptado de la tradición hermética occidental
"""

# ============================================================================
# SEFIROTH (Las 10 Emanaciones Divinas + Da'at)
# ============================================================================

SEFIROTH = {
    "keter": {
        "id": "keter",
        "index": 1,
        "nombre": {
            "es": "Corona",
            "en": "Crown",
            "he": "כתר",
            "roman": "Keter"
        },
        "color": {
            "rey": "brillantez",
            "reina": "blanco"
        },
        "planeta": "primum-mobile",
        "numero": 1,
        "chakra": "corona",
        "nombre_divino": {
            "he": "אהיה",
            "roman": "Ehiyeh",
            "es": "Yo Soy"
        },
        "arcangel": "Metatron",
        "orden_angelica": "Chayot HaKodesh",
        "cuerpo": "cráneo",
        "piedra": "diamante",
        "perfume": "ámbar gris",
        "alma": "Yechidah (Unidad)",
        "descripcion": "Voluntad pura y unidad divina. Corona de la creación."
    },
    
    "chochmah": {
        "id": "chochmah",
        "index": 2,
        "nombre": {
            "es": "Sabiduría",
            "en": "Wisdom",
            "he": "חכמה",
            "roman": "Chochmah"
        },
        "color": {
            "rey": "azul suave",
            "reina": "gris"
        },
        "planeta": "zodiaco",
        "numero": 2,
        "chakra": "tercer-ojo",
        "nombre_divino": {
            "he": "יה",
            "roman": "Yah",
            "es": "Señor"
        },
        "arcangel": "Raziel",
        "orden_angelica": "Auphanim",
        "cuerpo": "lado izquierdo de la cara",
        "piedra": "rubí estrella, turquesa",
        "perfume": "almizcle",
        "alma": "Chaya (Vida)"
    },
    
    "binah": {
        "id": "binah",
        "index": 3,
        "nombre": {
            "es": "Comprensión",
            "en": "Understanding",
            "he": "בינה",
            "roman": "Binah"
        },
        "color": {
            "rey": "rojo-violeta profundo",
            "reina": "negro"
        },
        "planeta": "saturno",
        "numero": 3,
        "chakra": "tercer-ojo",
        "nombre_divino": {
            "he": "יהוה אלוהים",
            "roman": "YHVH Elohim",
            "es": "El Señor Dios"
        },
        "arcangel": "Tzaphkiel",
        "orden_angelica": "Aralim",
        "cuerpo": "lado derecho de la cara",
        "piedra": "perla, zafiro estrella",
        "perfume": "mirra, civeta",
        "alma": "Neshamah (Psique)"
    },
    
    "chesed": {
        "id": "chesed",
        "index": 4,
        "nombre": {
            "es": "Misericordia",
            "en": "Mercy",
            "he": "חסד",
            "roman": "Chesed"
        },
        "color": {
            "rey": "violeta profundo",
            "reina": "azul"
        },
        "planeta": "jupiter",
        "numero": 4,
        "chakra": "garganta",
        "nombre_divino": {
            "he": "אל",
            "roman": "El",
            "es": "Dios"
        },
        "arcangel": "Tzadkiel",
        "orden_angelica": "Chashmalim",
        "cuerpo": "brazo izquierdo",
        "piedra": "zafiro, amatista",
        "perfume": "cedro"
    },
    
    "gevurah": {
        "id": "gevurah",
        "index": 5,
        "nombre": {
            "es": "Fuerza/Severidad",
            "en": "Strength",
            "he": "גבורה",
            "roman": "Gevurah"
        },
        "color": {
            "rey": "naranja",
            "reina": "escarlata"
        },
        "planeta": "marte",
        "numero": 5,
        "chakra": "garganta",
        "nombre_divino": {
            "he": "אלוהים גיבור",
            "roman": "Elohim Gibor",
            "es": "Dios de Poder"
        },
        "arcangel": "Khamael",
        "orden_angelica": "Seraphim",
        "cuerpo": "brazo derecho",
        "piedra": "rubí",
        "perfume": "tabaco"
    },
    
    "tiferet": {
        "id": "tiferet",
        "index": 6,
        "nombre": {
            "es": "Belleza/Armonía",
            "en": "Beauty",
            "he": "תפארת",
            "roman": "Tiferet"
        },
        "color": {
            "rey": "rosa",
            "reina": "dorado/amarillo"
        },
        "planeta": "sol",
        "numero": 6,
        "chakra": "corazon",
        "nombre_divino": {
            "he": "יהוה אלוה ודעת",
            "roman": "YHVH Eloah Ve-da'at",
            "es": "Señor Dios del Conocimiento"
        },
        "arcangel": "Raphael",
        "orden_angelica": "Malachim",
        "cuerpo": "pecho/corazón",
        "piedra": "topacio",
        "perfume": "olíbano",
        "alma": "Ruach (Espíritu)"
    },
    
    "netzach": {
        "id": "netzach",
        "index": 7,
        "nombre": {
            "es": "Victoria/Eternidad",
            "en": "Victory",
            "he": "נצח",
            "roman": "Netzach"
        },
        "color": {
            "rey": "amarillo-naranja",
            "reina": "esmeralda"
        },
        "planeta": "venus",
        "numero": 7,
        "chakra": "plexo-solar",
        "nombre_divino": {
            "he": "יהוה צבעות",
            "roman": "YHVH Tzvaot",
            "es": "Señor de los Ejércitos"
        },
        "arcangel": "Haniel",
        "orden_angelica": "Elohim",
        "cuerpo": "cadera izquierda",
        "piedra": "esmeralda",
        "perfume": "rosa, sándalo rojo"
    },
    
    "hod": {
        "id": "hod",
        "index": 8,
        "nombre": {
            "es": "Esplendor/Gloria",
            "en": "Splendor",
            "he": "הוד",
            "roman": "Hod"
        },
        "color": {
            "rey": "violeta",
            "reina": "naranja"
        },
        "planeta": "mercurio",
        "numero": 8,
        "chakra": "plexo-solar",
        "nombre_divino": {
            "he": "אלוהים צבעות",
            "roman": "Elohim Tzvaot",
            "es": "Dios de los Ejércitos"
        },
        "arcangel": "Michael",
        "orden_angelica": "Bnei Elohim",
        "cuerpo": "cadera derecha",
        "piedra": "cuarzo",
        "perfume": "estoraque"
    },
    
    "yesod": {
        "id": "yesod",
        "index": 9,
        "nombre": {
            "es": "Fundamento",
            "en": "Foundation",
            "he": "יסוד",
            "roman": "Yesod"
        },
        "color": {
            "rey": "azul-violeta",
            "reina": "violeta"
        },
        "planeta": "luna",
        "numero": 9,
        "chakra": "sacro",
        "nombre_divino": {
            "he": "שדאי אל חי",
            "roman": "Shaddai El Chai",
            "es": "Dios Todopoderoso Viviente"
        },
        "arcangel": "Gabriel",
        "orden_angelica": "Kerubim",
        "cuerpo": "genitales",
        "piedra": "cuarzo",
        "perfume": "jazmín",
        "alma": "Nephesh (Fuerza Vital)"
    },
    
    "malchut": {
        "id": "malchut",
        "index": 10,
        "nombre": {
            "es": "Reino/Manifestación",
            "en": "Kingdom",
            "he": "מלכות",
            "roman": "Malchut"
        },
        "color": {
            "rey": "amarillo",
            "reina": "oxidado,citrino,oliva,negro"
        },
        "planeta": "tierra",
        "numero": 10,
        "chakra": "raiz",
        "nombre_divino": {
            "he": "אדוני הארץ",
            "roman": "Adonai Ha'aretz",
            "es": "Señor de la Tierra"
        },
        "arcangel": "Sandalphon",
        "orden_angelica": "Ishim",
        "cuerpo": "pies",
        "piedra": "cristal de roca",
        "alma": "Guph (Cuerpo)"
    },
    
    # Da'at - La Sefirá oculta (no siempre representada)
    "daat": {
        "id": "daat",
        "index": 11,
        "nombre": {
            "es": "Conocimiento",
            "en": "Knowledge",
            "he": "דעת",
            "roman": "Da'at"
        },
        "color": {
            "reina": "lavanda"
        },
        "numero": None,  # No tiene número asignado
        "chakra": "garganta",
        "nombre_divino": {
            "he": "יהוה אלוהים",
            "roman": "YHVH Elohim"
        },
        "cuerpo": "garganta",
        "oculto": True
    }
}


# ============================================================================
# SENDEROS (22 Caminos que conectan las Sefiroth)
# Correspondencias con Letras Hebreras y Arcanos del Tarot
# ============================================================================

SENDEROS = {
    # Triángulo Supremo
    "1-2": {"id": "1-2", "numero": 11, "letra_hebrea": "Alef", "tarot": 0, "nombre": "El Loco"},
    "1-3": {"id": "1-3", "numero": 12, "letra_hebrea": "Bet", "tarot": 1, "nombre": "El Mago"},
    "1-6": {"id": "1-6", "numero": 13, "letra_hebrea": "Gimel", "tarot": 2, "nombre": "La Sacerdotisa"},
    "2-3": {"id": "2-3", "numero": 14, "letra_hebrea": "Dalet", "tarot": 3, "nombre": "La Emperatriz"},
    "2-6": {"id": "2-6", "numero": 15, "letra_hebrea": "He", "tarot": 4, "nombre": "El Emperador"},
    
    # Triángulo Ético
    "3-6": {"id": "3-6", "numero": 17, "letra_hebrea": "Zayin", "tarot": 6, "nombre": "Los Enamorados"},
    "2-4": {"id": "2-4", "numero": 16, "letra_hebrea": "Vav", "tarot": 5, "nombre": "El Hierofante"},
    "3-5": {"id": "3-5", "numero": 18, "letra_hebrea": "Het", "tarot": 7, "nombre": "El Carro"},
    "4-5": {"id": "4-5", "numero": 19, "letra_hebrea": "Tet", "tarot": 8, "nombre": "La Fuerza"},
    "4-6": {"id": "4-6", "numero": 20, "letra_hebrea": "Yod", "tarot": 9, "nombre": "El Ermitaño"},
    "5-6": {"id": "5-6", "numero": 22, "letra_hebrea": "Lamed", "tarot": 11, "nombre": "La Justicia"},
    
    # Triángulo Astral
    "4-7": {"id": "4-7", "numero": 21, "letra_hebrea": "Kaf", "tarot": 10, "nombre": "La Rueda"},
    "5-8": {"id": "5-8", "numero": 23, "letra_hebrea": "Mem", "tarot": 12, "nombre": "El Colgado"},
    "6-7": {"id": "6-7", "numero": 24, "letra_hebrea": "Nun", "tarot": 13, "nombre": "La Muerte"},
    "6-8": {"id": "6-8", "numero": 26, "letra_hebrea": "Ayin", "tarot": 15, "nombre": "El Diablo"},
    "6-9": {"id": "6-9", "numero": 25, "letra_hebrea": "Samekh", "tarot": 14, "nombre": "La Templanza"},
    "7-8": {"id": "7-8", "numero": 27, "letra_hebrea": "Pe", "tarot": 16, "nombre": "La Torre"},
    
    # Triángulo Material
    "7-9": {"id": "7-9", "numero": 28, "letra_hebrea": "Tzadi", "tarot": 17, "nombre": "La Estrella"},
    "7-10": {"id": "7-10", "numero": 29, "letra_hebrea": "Qof", "tarot": 18, "nombre": "La Luna"},
    "8-9": {"id": "8-9", "numero": 30, "letra_hebrea": "Resh", "tarot": 19, "nombre": "El Sol"},
    "8-10": {"id": "8-10", "numero": 31, "letra_hebrea": "Shin", "tarot": 20, "nombre": "El Juicio"},
    "9-10": {"id": "9-10", "numero": 32, "letra_hebrea": "Tav", "tarot": 21, "nombre": "El Mundo"}
}


# ============================================================================
# CORRESPONDENCIAS NUMEROLÓGICAS
# Mapeo entre números del 1-22 y las Sefiroth/Senderos
# ============================================================================

def obtener_sefira_por_numero(numero):
    """Obtiene la Sefirá correspondiente a un número del 1 al 10."""
    if 1 <= numero <= 10:
        sefira_ids = [None, "keter", "chochmah", "binah", "chesed", "gevurah", 
                      "tiferet", "netzach", "hod", "yesod", "malchut"]
        return SEFIROTH.get(sefira_ids[numero])
    return None


def obtener_sendero_por_numero(numero):
    """Obtiene el Sendero correspondiente a un número del 11 al 32."""
    if 11 <= numero <= 32:
        for sendero_id, sendero in SENDEROS.items():
            if sendero["numero"] == numero:
                return sendero
    return None


def mapear_numero_a_arbol(numero):
    """
    Mapea cualquier número a su posición en el Árbol de la Vida.
    - 1-10: Sefiroth
    - 11-22: Senderos principales
    - >22: Se reduce según el sistema
    """
    if numero <= 10:
        return {
            "tipo": "sefira",
            "elemento": obtener_sefira_por_numero(numero)
        }
    elif numero <= 22:
        return {
            "tipo": "sendero",
            "elemento": obtener_sendero_por_numero(numero)
        }
    else:
        # Para números mayores, se podría aplicar reducción teosófica
        # o mapeo a través de las Familias Dshevastan
        return {
            "tipo": "complejo",
            "numero_original": numero,
            "nota": "Requiere análisis adicional"
        }


# ============================================================================
# FUNCIONES DE INTEGRACIÓN CON NUMEROLOGÍA
# ============================================================================

def analizar_perfil_cabalista(esencia, expresion, herencia, destino, camino_vida):
    """
    Mapea los números de la Ficha Numerológica al Árbol de la Vida.
    
    Retorna un perfil cabalístico completo con las correspondencias
    de cada número a las Sefiroth y Senderos.
    """
    perfil = {
        "esencia_alma": mapear_numero_a_arbol(esencia),
        "expresion_cuerpo": mapear_numero_a_arbol(expresion),
        "herencia_total": mapear_numero_a_arbol(herencia),
        "destino": mapear_numero_a_arbol(destino),
        "camino_vida": {
            "edad_transformacion": camino_vida,
            "descripcion": f"Transformación prevista alrededor de los {camino_vida} años"
        }
    }
    
    return perfil


def obtener_interpretacion_sefira(sefira_id):
    """Obtiene una interpretación básica de una Sefirá."""
    sefira = SEFIROTH.get(sefira_id)
    if not sefira:
        return None
    
    return {
        "nombre": sefira["nombre"]["es"],
        "numero": sefira["numero"],
        "planeta": sefira.get("planeta", "N/A"),
        "chakra": sefira.get("chakra", "N/A"),
        "arcangel": sefira.get("arcangel", "N/A"),
        "cualidad": f"Representa {sefira['nombre']['es'].lower()} y está asociada con {sefira.get('planeta', 'energías cósmicas')}"
    }


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    # Ejemplo: Analizar una ficha numerológica
    print("=" * 70)
    print("ANÁLISIS CABALÍSTICO DEL PERFIL NUMEROLÓGICO")
    print("=" * 70)
    
    # Datos de ejemplo
    esencia = 7  # Netzach
    expresion = 16  # Sendero 16
    herencia = 14  # Sendero 14
    destino = 9  # Yesod
    camino_vida = 38
    
    perfil = analizar_perfil_cabalista(esencia, expresion, herencia, destino, camino_vida)
    
    print(f"\n📊 Perfil Numerológico:")
    print(f"   Esencia (Alma): {esencia}")
    print(f"   Expresión (Cuerpo): {expresion}")
    print(f"   Herencia: {herencia}")
    print(f"   Destino: {destino}")
    print(f"   Camino de Vida: {camino_vida}")
    
    print(f"\n🌳 Correspondencias en el Árbol de la Vida:")
    
    # Esencia
    if perfil["esencia_alma"]["tipo"] == "sefira":
        sefira = perfil["esencia_alma"]["elemento"]
        print(f"\n✨ ESENCIA ({esencia}): {sefira['nombre']['es']} - {sefira['nombre']['roman']}")
        print(f"   Arcángel: {sefira['arcangel']}")
        print(f"   Planeta: {sefira['planeta']}")
        print(f"   Color: {sefira['color']['reina']}")
    
    # Destino
    if perfil["destino"]["tipo"] == "sefira":
        sefira = perfil["destino"]["elemento"]
        print(f"\n🎯 DESTINO ({destino}): {sefira['nombre']['es']} - {sefira['nombre']['roman']}")
        print(f"   Arcángel: {sefira['arcangel']}")
        print(f"   Chakra: {sefira['chakra']}")