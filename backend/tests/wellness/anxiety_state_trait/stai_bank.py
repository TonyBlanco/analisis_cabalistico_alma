"""
Banco de Ítems para Test de Ansiedad (tipo STAI adaptado)
120 preguntas organizadas por dominio, intensidad y variante semántica
Sistema de selección dinámica compatible con SCDF
NO es diagnóstico clínico - Es herramienta de wellness/autoconocimiento

Este módulo genera el banco de 120 ítems (4 clústeres x 15 ítems por dominio)
y provee funciones de selección estratificada y exportación.
"""

from typing import List, Dict, Optional
import random
from datetime import datetime
import json

# Utility: intensities and valences to cycle through
INTENSITIES = ["bajo", "medio", "alto"]

# Cluster definitions and templates (Spanish)
CLUSTERS = {
    # DOMINIO: ESTADO (A-State) - cómo te sientes AHORA
    "estado": {
        "tension_corporal": {
            "neg_templates": [
                "En este momento siento mis músculos tensos.",
                "Ahora noto rigidez en mi cuello o espalda.",
                "Mi cuerpo está muy tenso en este momento.",
                "Siento una leve tensión en mi pecho ahora.",
                "Ahora mis manos están crispadas o apretadas.",
                "Siento una tensión intensa en todo mi cuerpo.",
                "Noto cierta rigidez en mi mandíbula.",
                "Tengo los puños cerrados sin darme cuenta.",
                "Siento como si mi cuerpo fuera una cuerda estirada.",
                "Sudo de nervios y noto tensión física.",
                "Siento tensión en los hombros ahora.",
                "Tengo molestias musculares por tensión en este momento.",
                "Mi pecho se siente contraído ahora.",
                "Mi postura se siente rígida y tensa.",
                "Siento incomodidad física por tensión." 
            ],
            "pos_templates": [
                "Me siento físicamente relajado/a ahora.",
                "En este momento mi cuerpo está en calma.",
                "Mis hombros están sueltos y cómodos ahora.",
                "Me siento completamente distendido/a físicamente.",
                "Mi respiración es fluida y sin esfuerzo.",
                "Ahora me siento cómodo/a en mi postura.",
                "Mis hombros están sueltos y cómodos ahora.",
                "Me siento distendido/a y libre de tensión.",
                "Mi cuerpo está relajado y sin molestias.",
                "Siento alivio físico y relajación.",
                "Estoy relajado/a y cómodo/a en este momento.",
                "Mi musculatura está relajada ahora.",
                "No siento tensión física en este momento.",
                "Mi cuerpo está en equilibrio y calma.",
                "Me siento físicamente estable y sereno/a."
            ]
        },
        "inquietud_mental": {
            "neg_templates": [
                "Mi mente está un poco agitada en este momento.",
                "Ahora me cuesta concentrarme en lo que hago.",
                "Mi mente está dando vueltas sin parar.",
                "Tengo pensamientos intrusivos que me distraen.",
                "Siento mi mente dispersa e inquieta.",
                "Ahora siento ruido mental que no puedo acallar.",
                "Tengo una cascada de pensamientos ansiosos.",
                "Noto cierta dispersión en mis pensamientos.",
                "Me está costando un poco mantener la atención.",
                "Hay pensamientos que no me dejan concentrar.",
                "Me siento mentalmente inquieto/a ahora.",
                "Mi cabeza está ocupada por preocupaciones pequeñas.",
                "Siento intranquilidad mental que no se calma.",
                "Mi mente salta de un pensamiento a otro constantemente.",
                "Tengo pensamientos acelerados que me incomodan."
            ],
            "pos_templates": [
                "En este momento me siento mentalmente tranquilo/a.",
                "Ahora puedo pensar con claridad.",
                "Mi mente está completamente serena ahora.",
                "Me siento enfocado/a en lo que estoy haciendo.",
                "Ahora mi mente fluye con facilidad.",
                "Me siento mentalmente centrado/a y en paz.",
                "Puedo ordenar mis ideas con calma ahora.",
                "Siento claridad y calma mental en este momento.",
                "Mi concentración está estable ahora.",
                "Tengo una sensación de quietud mental.",
                "No me siento intranquilo/a mentalmente ahora.",
                "Pienso con calma y sin prisa ahora.",
                "Mi mente se siente en equilibrio.",
                "Siento tranquilidad en mis pensamientos.",
                "Estoy mentalmente en calma y atendiendo al presente."
            ]
        },
        "sintomas_fisicos": {
            "neg_templates": [
                "Noto mi corazón latiendo un poco más rápido.",
                "Ahora tengo las manos ligeramente húmedas.",
                "Siento palpitaciones fuertes en este momento.",
                "Ahora siento un nudo en el estómago.",
                "Tengo sensación de ahogo o falta de aire.",
                "Siento una ligera presión en el pecho.",
                "Sudo más de lo normal en este momento.",
                "Noto temblor en las manos o piernas.",
                "Siento mareo o inestabilidad ahora.",
                "Tengo la boca seca en este momento.",
                "Siento náuseas leves por nervios.",
                "Tengo molestias estomacales asociadas a ansiedad.",
                "Siento opresión en el pecho.",
                "Mi pulso se acelera con facilidad ahora.",
                "Percibo malestar físico relacionado con nervios."
            ],
            "pos_templates": [
                "Mi respiración es calmada y regular.",
                "Mi cuerpo se siente estable y equilibrado.",
                "Me siento físicamente estable.",
                "Mi pulso es constante y tranquilo.",
                "Me siento físicamente estable.",
                "No noto molestias físicas en este momento.",
                "Siento tranquilidad corporal y respiratoria.",
                "Mi cuerpo está calmado y sin sobresaltos.",
                "Me siento en armonía con mi cuerpo.",
                "No tengo síntomas físicos asociados a nervios.",
                "Mi respiración es profunda y serena.",
                "Percibo calma en mi cuerpo ahora.",
                "Mis sensaciones físicas son de comodidad.",
                "Siento estabilidad física y control.",
                "Estoy físicamente bien y en calma."
            ]
        },
        "preocupacion_inmediata": {
            "neg_templates": [
                "Ahora tengo una pequeña preocupación en mente.",
                "En este momento me preocupa algo que va a pasar.",
                "Siento una fuerte preocupación que no me deja en paz.",
                "Estoy anticipando algo negativo que podría ocurrir.",
                "Siento que algo malo va a suceder pronto.",
                "Hay un pensamiento incómodo rondando mi cabeza.",
                "Pienso repetidamente en algo que me inquieta.",
                "Me siento abrumado/a por lo que tengo que enfrentar.",
                "Tengo una leve sensación de alarma interior.",
                "Me preocupa cómo resultarán las cosas ahora.",
                "Siento inquietud sobre un asunto inmediato.",
                "Mi mente vuelve a un problema que me preocupa.",
                "No puedo dejar de pensar en un posible problema.",
                "Siento tensión mental por una situación actual.",
                "Mi atención está ocupada por una preocupación actual."
            ],
            "pos_templates": [
                "Ahora no tengo nada que me preocupe.",
                "Me siento sin cargas mentales en este momento.",
                "Me siento completamente libre de preocupaciones ahora.",
                "Ahora confío en que todo saldrá bien.",
                "Me siento capaz de manejar lo que venga.",
                "Ahora me siento seguro/a y confiado/a.",
                "Siento tranquilidad respecto a lo que ocurre ahora.",
                "Puedo afrontar lo presente con calma.",
                "Mi mente está libre de preocupaciones inmediatas.",
                "No siento alarma por lo que está pasando.",
                "Me siento equilibrado/a frente a la situación actual.",
                "Confío en mi manejo de lo que sucede ahora.",
                "Tengo serenidad respecto a lo inmediato.",
                "Me encuentro en calma respecto a lo presente.",
                "No me preocupa lo que está ocurriendo ahora."
            ]
        }
    },
    # DOMINIO: RASGO (A-Trait) - cómo te sientes generalmente
    "rasgo": {
        "preocupacion_cronica": {
            "neg_templates": [
                "A veces me preocupo por cosas sin importancia.",
                "Generalmente tengo varias preocupaciones en mente.",
                "Me preocupo constantemente por muchas cosas.",
                "Tiendo a anticipar problemas que podrían no ocurrir.",
                "Es difícil para mí dejar de preocuparme.",
                "A veces doy vueltas a las cosas en mi cabeza.",
                "Me cuesta desconectar de mis preocupaciones.",
                "Suelo imaginar escenarios negativos.",
                "En ocasiones me inquieta lo que piensan de mí.",
                "Siento que mis preocupaciones suelen repetirse.",
                "A menudo me siento inquieto/a por el futuro.",
                "Me siento inclinado/a a preocuparme por lo que podría pasar.",
                "Mis pensamientos suelen centrarse en problemas potenciales.",
                "Suelo anticipar lo peor en muchas situaciones.",
                "Me cuesta confiar plenamente en que las cosas saldrán bien."
            ],
            "pos_templates": [
                "Normalmente no me preocupo demasiado.",
                "Suelo tomar las cosas con calma.",
                "Rara vez me preocupo por el futuro.",
                "Generalmente confío en que las cosas saldrán bien.",
                "Usualmente me siento tranquilo/a con mi vida.",
                "Tengo una actitud serena ante los problemas.",
                "Puedo dejar ir las preocupaciones con facilidad.",
                "Me resulta sencillo relativizar las dificultades.",
                "En general, mantengo la calma ante lo incierto.",
                "Confío en mi capacidad para resolver problemas.",
                "Suelo sentirme en paz respecto al futuro.",
                "No permito que las preocupaciones dominen mi día a día.",
                "Mantengo una perspectiva equilibrada sobre mis problemas.",
                "Me siento con recursos para manejar mis inquietudes.",
                "Tengo una tendencia a la calma frente a lo desconocido."
            ]
        },
        "tension_habitual": {
            "neg_templates": [
                "A veces me siento tenso/a sin motivo aparente.",
                "Generalmente cargo tensión en el cuerpo.",
                "Casi siempre estoy tenso/a o nervioso/a.",
                "Siento rigidez frecuente en mi musculatura.",
                "Me cuesta relajarme al final del día.",
                "Mi cuerpo suele reaccionar con tensión ante pequeñas cosas.",
                "A menudo noto molestias físicas por tensión.",
                "Mantengo una postura rígida por nerviosismo frecuente.",
                "Me encuentro tenso/a en situaciones cotidianas.",
                "Siento que la tensión me acompaña usualmente.",
                "Es habitual que esté en alerta física.",
                "Suele costarme soltar la tensión acumulada.",
                "Mis músculos tienden a estar contraídos con frecuencia.",
                "Me despierto con sensaciones de tensión corporal.",
                "Con regularidad percibo estrés físico en mi cuerpo."
            ],
            "pos_templates": [
                "Normalmente me siento relajado/a.",
                "Suelo estar físicamente cómodo/a.",
                "Puedo relajarme con facilidad en mi vida diaria.",
                "Me siento a gusto en mi cuerpo la mayor parte del tiempo.",
                "Mantengo hábitos que me ayudan a relajarme.",
                "Siento descanso y alivio físico de forma habitual.",
                "No suelo tener tensión física persistente.",
                "Me resulta fácil recuperar la calma corporal.",
                "En general mi musculatura está suelta y cómoda.",
                "Me acostumbro a momentos de relajación cada día.",
                "Tengo una sensación de bienestar corporal estable.",
                "Puedo gestionar mi tensión corporal con técnicas simples.",
                "Mis hábitos fomentan la relajación diaria.",
                "Soy capaz de soltar la tensión con relativa facilidad.",
                "Disfruto de sensación de comodidad física con frecuencia."
            ]
        },
        "sintomas_fisicos_habitual": {
            "neg_templates": [
                "Sueles aparecerme palpitaciones en momentos de estrés.",
                "Con frecuencia tengo molestias estomacales por nervios.",
                "Sudo o tiembloy en situaciones de presión.",
                "A menudo me noto fatigado/a por la tensión.",
                "Siento molestias físicas recurrentes relacionadas con ansiedad.",
                "Mi cuerpo suele reaccionar con síntomas físicos bajo estrés.",
                "Experimenté mareos o inestabilidad en situaciones tensas.",
                "Tengo episodios de falta de aire en momentos de ansiedad.",
                "Me suelen quedar sensaciones físicas molestas después de eventos tensos.",
                "Siento a menudo incomodidad física sin causa médica clara.",
                "Mis reacciones físicas al estrés son frecuentes.",
                "Con regularidad percibo tensión que afecta mi bienestar físico.",
                "Los síntomas físicos aparecen con estrés cotidiano.",
                "Suelo tener molestias físicas en semanas estresantes.",
                "Mi cuerpo responde con síntomas cuando me siento ansioso/a."
            ],
            "pos_templates": [
                "Generalmente no sufro síntomas físicos relacionados con ansiedad.",
                "Mi salud física mantiene estabilidad aun en situaciones estresantes.",
                "Puedo recuperar mi ritmo físico con facilidad.",
                "Rara vez experimento palpitaciones o sudoración por nervios.",
                "Mis reacciones físicas ante estrés suelen ser leves.",
                "No suelo tener síntomas físicos prolongados por ansiedad.",
                "Mantengo una buena regulación corporal en lo cotidiano.",
                "Mi bienestar físico está preservado aun con tensiones.",
                "No suelo tener episodios frecuentes de malestar físico por estrés.",
                "Mi cuerpo vuelve a la normalidad con rapidez.",
                "Puedo manejar mis síntomas físicos con recursos sencillos.",
                "Disfruto de estabilidad física la mayor parte del tiempo.",
                "Mis funciones corporales permanecen estables en general.",
                "Siento equilibrio físico aun en semanas agitadas.",
                "No me afectan continuamente síntomas físicos por estrés."
            ]
        },
        "inquietud_mental_habitual": {
            "neg_templates": [
                "Suelo tener la mente ocupada por pensamientos preocupantes.",
                "Con frecuencia me cuesta relajar mi mente al acostarme.",
                "Mi atención se dispersa con facilidad en el día a día.",
                "Tengo tendencia a rumiar eventos pasados regularmente.",
                "Mis pensamientos suelen acelerarse sin razón clara.",
                "Me resulta difícil mantener la calma mental constantemente.",
                "Siento inquietud mental con regularidad.",
                "Me cuesta desconectar la mente tras el trabajo.",
                "Puedo quedarme pensando en problemas durante horas.",
                "Mi mente tiende a enfocarse en riesgos y peligros.",
                "Es habitual que mis pensamientos sean intrusivos.",
                "Siento que mi mente no descansa lo suficiente.",
                "Con frecuencia mi mente anticipa dificultades.",
                "Tengo tendencia a preocuparme por detalles insignificantes.",
                "Mis pensamientos repetitivos interfieren con mi descanso."
            ],
            "pos_templates": [
                "Por lo general, mantengo la mente tranquila y flexible.",
                "Puedo dejar de pensar en un problema cuando lo deseo.",
                "Disfruto de momentos de claridad mental habitualmente.",
                "Mi mente descansa bien y vuelve a la calma.",
                "Puedo concentrarme sin problemas en tareas diarias.",
                "No suelo quedarme atrapado/a en pensamientos negativos.",
                "Gestiono mis pensamientos de forma equilibrada.",
                "Tengo facilidad para centrarme cuando lo necesito.",
                "Mi mente encuentra pausas de tranquilidad con frecuencia.",
                "Mantengo perspectiva y calma ante mis pensamientos.",
                "No me resulta habitual la rumiación constante.",
                "Siento control sobre mi vida mental la mayoría del tiempo.",
                "Mi pensamiento es claro y sereno con regularidad.",
                "Puedo soltar pensamientos repetitivos con facilidad.",
                "Mi mente suele estar en equilibrio en el día a día."
            ]
        }
    }
}

# Generator to build the explicit BANCO_ITEMS list (120 items total)

def build_banco_items() -> List[Dict]:
    items: List[Dict] = []
    # Estado domain: 4 clusters x 15
    for domain in ["estado"]:
        for cluster_name, cluster_data in CLUSTERS[domain].items():
            negs = cluster_data["neg_templates"]
            poss = cluster_data["pos_templates"]
            # we'll interleave neg/pos variants, cycle through intensity
            for i in range(15):
                intensity = INTENSITIES[i % len(INTENSITIES)]
                # alternate valence negative/positive to ensure variety
                if i % 2 == 0:
                    valence = "negativa"
                    text = negs[i % len(negs)].strip()
                    reverse_scored = False
                else:
                    valence = "positiva"
                    text = poss[i % len(poss)].strip()
                    reverse_scored = True

                # Create an ID consistent with earlier style (E_ + 4-letter cluster + number)
                short = ''.join([c for c in cluster_name if c.isalpha()])[:4].upper()
                item_id = f"E_{short}_{i+1:03d}"

                items.append({
                    "id": item_id,
                    "domain": domain,
                    "cluster": cluster_name,
                    "intensity": intensity,
                    "weight": 1,
                    "valence": valence,
                    "text": text,
                    "reverse_scored": reverse_scored
                })

    # Rasgo domain: 4 clusters x 15
    for domain in ["rasgo"]:
        for cluster_name, cluster_data in CLUSTERS[domain].items():
            negs = cluster_data["neg_templates"]
            poss = cluster_data["pos_templates"]
            for i in range(15):
                intensity = INTENSITIES[i % len(INTENSITIES)]
                if i % 2 == 0:
                    valence = "negativa"
                    text = negs[i % len(negs)].strip()
                    reverse_scored = False
                else:
                    valence = "positiva"
                    text = poss[i % len(poss)].strip()
                    reverse_scored = True

                short = ''.join([c for c in cluster_name if c.isalpha()])[:4].upper()
                item_id = f"R_{short}_{i+1:03d}"

                items.append({
                    "id": item_id,
                    "domain": domain,
                    "cluster": cluster_name,
                    "intensity": intensity,
                    "weight": 1,
                    "valence": valence,
                    "text": text,
                    "reverse_scored": reverse_scored
                })

    # Basic sanity: should be 120 (8 clusters * 15)
    if len(items) != 120:
        raise ValueError(f"Banco generado inesperado: {len(items)} ítems (esperado 120)")

    return items


# Build the bank at import time
BANCO_ITEMS: List[Dict] = build_banco_items()


# Selection function compatible with SCDF: stratified random sampling
# Returns a list of item dicts (id + full metadata). The function tries to
# evenly sample across domain->cluster unless explicit filters used.

def select_items_scdf(n: int = 20, seed: Optional[int] = None, domain: Optional[str] = None, clusters: Optional[List[str]] = None) -> List[Dict]:
    """
    Selecciona `n` ítems del BANCO_ITEMS de forma estratificada por domain->cluster.
    - seed: reproducibilidad
    - domain: "estado" o "rasgo" (si None, usa ambos)
    - clusters: lista de nombres de cluster para limitar (opcional)

    La salida es una lista de ítems (con campos id, domain, cluster, intensity, weight, valence, text, reverse_scored).
    Diseñada para integrarse en un flujo SCDF que espera listas JSON de ítems con metadatos.
    """
    if seed is not None:
        random.seed(seed)

    pool = [it for it in BANCO_ITEMS if (domain is None or it["domain"] == domain)]
    if clusters:
        pool = [it for it in pool if it["cluster"] in clusters]

    # Group by domain->cluster
    strat: Dict[str, List[Dict]] = {}
    for it in pool:
        key = f"{it['domain']}::{it['cluster']}"
        strat.setdefault(key, []).append(it)

    # Determine allocation per stratum (round-robin)
    selected: List[Dict] = []
    strata_keys = list(strat.keys())
    if not strata_keys:
        return []

    idx = 0
    while len(selected) < n and any(strat.values()):
        key = strata_keys[idx % len(strata_keys)]
        bucket = strat.get(key, [])
        if bucket:
            choice = random.choice(bucket)
            selected.append(choice)
            # remove chosen from bucket to avoid repeats
            bucket.remove(choice)
        idx += 1

    # If we didn't reach n because pool small, return all unique
    # Ensure deterministic order if seed provided
    if seed is not None:
        selected = sorted(selected, key=lambda x: (x['domain'], x['cluster'], x['id']))

    return selected[:n]


def export_banco_json(path: str = "banco_items.json") -> None:
    """Exporta el BANCO_ITEMS completo a un archivo JSON (UTF-8)."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(BANCO_ITEMS, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    # Ejemplo de uso rápido
    print(f"Banco de ítems generado: {len(BANCO_ITEMS)} ítems")
    # Selección ejemplo
    muestra = select_items_scdf(n=20, seed=42)
    print("Ejemplo de selección 20 ítems (primeros 5):")
    for it in muestra[:5]:
        print(f"- {it['id']} | {it['domain']} | {it['cluster']} | {it['text']}")
    # Export opcional
    export_banco_json()
    print("Exportado banco_items.json")
