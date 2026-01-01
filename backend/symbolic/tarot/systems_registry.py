"""
Registry for Tarot symbolic systems (SWM v3).

Safety:
- Data-only, no IO.
- Activation is explicit via `status="active"`.
"""

SYSTEMS_REGISTRY = [
    {
        "id": "golden_dawn_tarot",
        "module": "symbolic.tarot.systems.golden_dawn_tarot",
        "status": "active",
    },
    {
        "id": "rota_tarot",
        "module": "symbolic.tarot.systems.rota_tarot",
        "status": "active",
    },
    {
        "id": "tarot_de_marsella_symbolic",
        "module": "symbolic.tarot.systems.tarot_de_marsella_symbolic",
        "status": "active",
    },
    {
        "id": "rider_waite_symbolic",
        "module": "symbolic.tarot.systems.rider_waite_symbolic",
        "status": "active",
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
