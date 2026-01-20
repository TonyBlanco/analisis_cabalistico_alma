"""
Banco sintético para SCL-90-R (90 ítems originales inspirados en las 9 dimensiones).
No se reproducen ítems con copyright: los textos son originales, diseñados para evaluar
las dimensiones listadas por el usuario (somatización, obsesión-compulsión, etc.).

Incluye:
- `SCL90_ITEMS`: lista con 90 diccionarios (id, instrument, dimension, intensity, text, reverse_scored)
- `select_items_scdf`: selección estratificada compatible SCDF
- `export_scl90_json`: exportar JSON
"""

from typing import List, Dict, Optional
import random
import json
from pathlib import Path

DIMENSIONS = [
    "somatizacion",
    "obsesion_compulsion",
    "sensibilidad_interpersonal",
    "depresion",
    "ansiedad",
    "hostilidad",
    "ansiedad_fobica",
    "ideacion_paranoide",
    "psicoticismo",
]

INTENSITIES = ["leve", "moderado", "alto"]

# Simple templates per dimension (original phrasing)
TEMPLATES = {
    "somatizacion": [
        "He notado molestias físicas inexplicables recientemente.",
        "Siento molestias en el estómago que no parecen debidas a comida.",
        "He tenido dolores musculares sin causa clara.",
        "Me molestan el pecho o punzadas que me preocupan.",
        "Percibo cambios en mi digestión cuando estoy estresado/a.",
        "Siento tensión o dolor en la cabeza con frecuencia.",
        "Experimento sensación de hormigueo o entumecimiento en partes del cuerpo.",
        "Mi cuerpo presenta molestias que interfieren en mis tareas.",
        "Siento cansancio físico sin haber hecho esfuerzo.",
        "He notado cambios en mi respiración en momentos de tensión."
    ],
    "obsesion_compulsion": [
        "Me aparecen pensamientos repetitivos que me molestan.",
        "Siento la necesidad de revisar cosas más de una vez.",
        "Tengo rituales que repito para sentirme seguro/a.",
        "Me cuesta detener ideas que vuelven con fuerza.",
        "Tengo preocupaciones persistentes sobre la limpieza o el orden.",
        "Siento impulsos de comprobar algo aun cuando sé que no es necesario.",
        "Me distraigo por pensamientos intrusivos en mi día.",
        "A veces actúo según reglas internas que me imponen ansiedad.",
        "Los pensamientos repetitivos interfieren en mi concentración.",
        "Siento alivio temporal al realizar ciertas acciones repetitivas."
    ],
    "sensibilidad_interpersonal": [
        "Me siento incómodo/a en presencia de personas nuevas.",
        "A menudo creo que otros me juzgan negativamente.",
        "Me resulta difícil confiar en los demás.",
        "Me siento inferior cuando comparo mis habilidades con las de otros.",
        "Evito situaciones sociales por miedo a la crítica.",
        "Me siento fácilmente herido/a por comentarios ajenos.",
        "Tiendo a interpretar de forma negativa las interacciones sociales.",
        "Me cuesta expresar mis opiniones por temor al rechazo.",
        "Siento vergüenza con facilidad en grupos.",
        "Prefiero aislarme cuando siento que no encajo."
    ],
    "depresion": [
        "Me siento con ánimo bajo y sin energía la mayor parte del tiempo.",
        "He perdido interés en actividades que antes disfrutaba.",
        "Me cuesta motivarme para llevar a cabo tareas diarias.",
        "Siento tristeza persistente sin causa aparente.",
        "Tengo dificultades para conciliar el sueño o duermo demasiado.",
        "Me siento inútil o con baja autoestima frecuentemente.",
        "Pierdo apetito o como en exceso por emociones.",
        "Me cuesta concentrarme en lo que hago.",
        "Siento pesadez emocional que me ralentiza.",
        "Tengo pensamientos negativos sobre mi futuro."
    ],
    "ansiedad": [
        "Siento nerviosismo o tensión que me resulta difícil controlar.",
        "Tengo episodios de pánico o aprensión intensa.",
        "Me preocupa con frecuencia que algo malo ocurra.",
        "Siento una inquietud interna que no cede.",
        "Mi corazón se acelera en situaciones cotidianos de estrés.",
        "Me cuesta relajarme aun en momentos seguros.",
        "Siento un estado de alerta constante.",
        "Tengo dificultades para quedarme quieto/a por la inquietud.",
        "Me preocupo por pequeñas cosas hasta que me angustian.",
        "Evito situaciones que me producen mucha ansiedad."
    ],
    "hostilidad": [
        "Me siento irritable o fácilmente enojado/a con los demás.",
        "Tengo pensamientos de enfado que a veces deseo expresar.",
        "Me cuesta controlar reacciones bruscas ante frustraciones.",
        "Siento deseos de confrontar a quienes me provocan.",
        "Me irrito con comentarios que considero injustos.",
        "A veces tengo impulsos de actuar de forma agresiva.",
        "Me cuesta perdonar ofensas menores.",
        "Siento tensión hacia personas que no comparten mis opiniones.",
        "Me cuesta calmarme una vez que me enfado.",
        "Puedo mostrar hostilidad en conversaciones tensas."
    ],
    "ansiedad_fobica": [
        "Evito lugares o situaciones que me generan miedo intenso.",
        "Siento miedo marcado ante ciertos objetos o animales.",
        "Mi vida se ajusta para prevenir encuentros con lo que temo.",
        "Me paraliza la idea de enfrentar ciertas situaciones sociales.",
        "Siento temor irracional en espacios abiertos o cerrados.",
        "Me cuesta moverme por lugares que me provocan ansiedad fóbica.",
        "Tengo ataques de fuga o deseo de escapar en presencia de lo que temo.",
        "El miedo limita mis actividades cotidianas.",
        "Me angustia la posibilidad de encontrar aquello que temo.",
        "He evitado viajes o encuentros por miedo intenso."
    ],
    "ideacion_paranoide": [
        "Me cuesta confiar en las intenciones de otras personas.",
        "A veces creo que otros conspiran en mi contra.",
        "Interpreto gestos o palabras como amenazas personales.",
        "Me preocupo por la lealtad de quienes me rodean.",
        "Estoy atento/a a señales que considero de traición.",
        "Sospecho que se habla de mí a mis espaldas sin pruebas.",
        "Me siento vigilado/a o evaluado/a por otros frecuentemente.",
        "Tengo dificultad para compartir información personal por temor.",
        "A veces me siento hostigado/a por acciones ajenas.",
        "Me cuesta aceptar explicaciones inocentes de los demás."
    ],
    "psicoticismo": [
        "Me siento a veces desconectado/a de la realidad común.",
        "He tenido experiencias perceptivas inusuales que me confunden.",
        "Siento que mis ideas no son comprendidas por los demás.",
        "Me aislo porque creo diferente a la mayoría.",
        "Tengo pensamientos extraños que me resultan inquietantes.",
        "Ocasionalmente pierdo el hilo de la realidad temporalmente.",
        "Me cuesta distinguir entre lo real y lo imaginado en momentos.",
        "Siento que nadie comparte mi forma de ver las cosas.",
        "Mis comportamientos pueden parecer raros para otros.",
        "Experimento episodios breves de despersonalización o desconcierto."
    ]
}


def build_scl90_items() -> List[Dict]:
    items: List[Dict] = []
    counter = 1
    for dim in DIMENSIONS:
        templates = TEMPLATES[dim]
        # 10 items per dimension -> total 90
        for i in range(10):
            intensity = INTENSITIES[i % len(INTENSITIES)]
            text = templates[i % len(templates)].strip()
            item = {
                "id": f"SCL90_{counter:03d}",
                "instrument": "SCL-90-R_sintetico",
                "dimension": dim,
                "intensity": intensity,
                "weight": 1,
                "text": text,
                "reverse_scored": False
            }
            items.append(item)
            counter += 1
    return items


SCL90_ITEMS = build_scl90_items()
BASE_DIR = Path(__file__).resolve().parent
SCL90_DATA_PATH = BASE_DIR / "scl90_items.json"


def select_items_scdf(n: int = 20, seed: Optional[int] = None, dimensions: Optional[List[str]] = None) -> List[Dict]:
    if seed is not None:
        random.seed(seed)
    pool = [it for it in SCL90_ITEMS if (dimensions is None or it["dimension"] in dimensions)]
    # Stratify by dimension
    strat = {}
    for it in pool:
        strat.setdefault(it["dimension"], []).append(it)
    selected = []
    keys = list(strat.keys())
    idx = 0
    while len(selected) < n and any(strat.values()):
        key = keys[idx % len(keys)]
        bucket = strat.get(key)
        if bucket:
            choice = random.choice(bucket)
            selected.append(choice)
            bucket.remove(choice)
        idx += 1
    if seed is not None:
        selected = sorted(selected, key=lambda x: (x['dimension'], x['id']))
    return selected[:n]


def export_scl90_json(path: Optional[str] = None) -> None:
    target = Path(path) if path else SCL90_DATA_PATH
    with open(str(target), "w", encoding="utf-8") as f:
        json.dump(SCL90_ITEMS, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    print(f"SCL-90 sintético: {len(SCL90_ITEMS)} ítems")
    export_scl90_json()
    print("Exportado scl90_items.json")
