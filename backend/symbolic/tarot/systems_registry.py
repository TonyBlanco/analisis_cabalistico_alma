"""
Passive registry for planned tarot symbolic systems.

Safety:
- Not imported in runtime flows.
- No side effects, no deck logic, no IO.
"""

SYSTEMS_REGISTRY = [
    {
        "id": "golden_dawn_tarot",
        "module": "symbolic.tarot.systems.golden_dawn_tarot",
        "status": "planned",
    },
    {
        "id": "rota_tarot",
        "module": "symbolic.tarot.systems.rota_tarot",
        "status": "planned",
    },
    {
        "id": "tarot_de_marsella_symbolic",
        "module": "symbolic.tarot.systems.tarot_de_marsella_symbolic",
        "status": "planned",
    },
    {
        "id": "rider_waite_symbolic",
        "module": "symbolic.tarot.systems.rider_waite_symbolic",
        "status": "planned",
    },
    {
        "id": "tarot_cabalistico_tree_of_life",
        "module": "symbolic.tarot.systems.tarot_cabalistico_tree_of_life",
        "status": "planned",
    },
    {
        "id": "generic_symbolic_oracle",
        "module": "symbolic.tarot.systems.generic_symbolic_oracle",
        "status": "planned",
    },
]

