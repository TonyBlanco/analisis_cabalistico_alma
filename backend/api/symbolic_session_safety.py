"""
Defense-in-depth role-aware safety mirror for symbolic session-note persistence.

CANONICAL SOURCE OF TRUTH: packages/symbolic/tree/clinical-lexicon.ts
This Python module mirrors that policy so that a direct POST to the Django
endpoint (bypassing the Next.js BFF) is still subject to:
  - the clinical-lexicon block for the observational role
    (lifted only for the verified clinical role), and
  - the anti-fraud rail (ALWAYS enforced, every role, never lifted).

Keep both lists in sync with the TypeScript source.
"""
from typing import Dict, List

# Mirror of SYMBOLIC_INTERPRETER_META.prohibitedTerms (clinical lexicon).
CLINICAL_LEXICON_TERMS: List[str] = [
    'diagnóstico', 'diagnostico', 'diagnosis', 'trastorno', 'disorder',
    'patología', 'patologia', 'pathology', 'enfermedad', 'disease',
    'debes', 'must', 'tienes que', 'have to', 'definitivamente',
    'definitely', 'siempre', 'always', 'nunca', 'never',
]

# Mirror of ANTI_FRAUD_TERMS — never lifted, for any role.
ANTI_FRAUD_TERMS: List[str] = [
    'cura garantizada', 'curación garantizada', 'sanación garantizada',
    'cura milagrosa', 'curación milagrosa', 'sanación milagrosa',
    'remedio milagroso', 'garantiza la cura', 'garantizo la cura',
    'te garantizo la sanación', 'guaranteed cure', 'miracle cure',
    'te receto', 'le receto', 'recetar medicamentos',
    'prescribir medicamentos', 'ajustar la dosis', 'aumentar la dosis',
    'reducir la dosis', 'cambiar la dosis', 'i prescribe',
    'suspender la medicación', 'suspende la medicación',
    'deja la medicación', 'dejar la medicación',
    'abandona el tratamiento médico', 'abandonar el tratamiento médico',
    'reemplaza el tratamiento médico', 'sustituye el tratamiento médico',
    'no necesitas medicación', 'no necesitas un médico',
    'stop your medication', 'replace medical treatment',
]


def enforce_anti_fraud_rail(content: str) -> Dict[str, object]:
    """Anti-fraud rail — always enforced, for every role."""
    lowered = (content or '').lower()
    warnings = [
        f'Anti-fraud rail violation: "{term}"'
        for term in ANTI_FRAUD_TERMS
        if term.lower() in lowered
    ]
    return {'passed': len(warnings) == 0, 'warnings': warnings}


def validate_safety_for_role(content: str, role: str = 'observational') -> Dict[str, object]:
    """Role-aware validation: clinical lexicon blocked unless role == 'clinical';
    anti-fraud rail always applied."""
    lowered = (content or '').lower()
    warnings: List[str] = []
    if role != 'clinical':
        warnings.extend(
            f'Prohibited term detected: "{term}"'
            for term in CLINICAL_LEXICON_TERMS
            if term.lower() in lowered
        )
    warnings.extend(enforce_anti_fraud_rail(content)['warnings'])
    return {'passed': len(warnings) == 0, 'warnings': warnings}
