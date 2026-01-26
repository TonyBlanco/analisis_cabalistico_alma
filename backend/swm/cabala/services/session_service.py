"""
Cabala Session Service - Data Pipeline Integration.

Syncs clinical test results with CabalaSession to enrich the Tree of Life workspace
with data from AQ-Kabbalah, ASRS-Essence, and SHA-Harmony tests.
"""

import logging
from typing import Optional, Dict, Any, List
from django.db.models import QuerySet

logger = logging.getLogger(__name__)


# Threshold for "illuminating" a sefirah based on AQ-Kabbalah responses
SEFIRA_ILLUMINATION_THRESHOLD = 7  # Score > 7 on likert_10 activates the sefirah


def get_test_results_for_patient(patient, test_code: str, limit: int = 1):
    """
    Fetch recent TestResults for a patient and test code.
    
    Args:
        patient: User instance (the patient)
        test_code: TestModule.code to filter by
        limit: Max results to return
        
    Returns:
        QuerySet of TestResult or None
    """
    from api.test_models import TestResult
    
    try:
        results = TestResult.objects.filter(
            patient=patient,
            test_module__code=test_code,
            is_archived=False
        ).select_related('test_module').order_by('-created_at')[:limit]
        
        return results if results.exists() else None
    except Exception as e:
        logger.warning(f"Error fetching test results for {test_code}: {e}")
        return None


def extract_sefira_scores_from_aq(aq_result) -> Dict[str, float]:
    """
    Extract sefirah scores from AQ-Kabbalah test result.
    
    Args:
        aq_result: TestResult instance
        
    Returns:
        Dict mapping sefira name to score (0-10)
    """
    scores = {}
    
    if not aq_result:
        return scores
    
    # Try input_data first (raw responses)
    data = aq_result.input_data or {}
    if isinstance(data, dict):
        answers = data.get('answers', data)
        
        # Map question IDs to sefirot
        sefira_map = {
            'aq_keter': 'keter',
            'aq_chokhmah': 'chokhmah',
            'aq_binah': 'binah',
            'aq_chesed': 'chesed',
            'aq_gevurah': 'gevurah',
            'aq_tiferet': 'tiferet',
            'aq_netzach': 'netzach',
            'aq_hod': 'hod',
            'aq_yesod': 'yesod',
            'aq_malkhut': 'malkhut',
        }
        
        for q_id, sefira in sefira_map.items():
            value = answers.get(q_id)
            if isinstance(value, (int, float)):
                scores[sefira] = float(value)
    
    # Fallback: check details field
    if not scores and aq_result.details:
        details = aq_result.details
        if isinstance(details, dict):
            sefira_scores = details.get('sefira_scores', {})
            if sefira_scores:
                scores = {k: float(v) for k, v in sefira_scores.items() if isinstance(v, (int, float))}
    
    return scores


def update_tree_from_aq(cabala_session, aq_result) -> bool:
    """
    Update the tree_state of a CabalaSession based on AQ-Kabbalah results.
    
    High scores (>7) on a sefirah question will "illuminate" that sefirah
    in the tree visualization.
    
    Args:
        cabala_session: CabalaSession instance
        aq_result: TestResult instance from aq_kabbalah
        
    Returns:
        True if tree was updated, False otherwise
    """
    sefira_scores = extract_sefira_scores_from_aq(aq_result)
    
    if not sefira_scores:
        logger.info("No sefira scores extracted from AQ result")
        return False
    
    # Get or initialize tree_state
    tree_state = cabala_session.tree_state or {}
    
    # Initialize sefirot state if not present
    if 'sefirot' not in tree_state:
        tree_state['sefirot'] = {}
    
    updated = False
    illuminated_sefirot = []
    
    for sefira, score in sefira_scores.items():
        # Initialize sefira state if not present
        if sefira not in tree_state['sefirot']:
            tree_state['sefirot'][sefira] = {
                'active': False,
                'intensity': 0,
                'clinical_data': {}
            }
        
        sefira_state = tree_state['sefirot'][sefira]
        
        # Store the score
        sefira_state['clinical_data']['aq_score'] = score
        sefira_state['clinical_data']['aq_timestamp'] = aq_result.created_at.isoformat()
        
        # Illuminate if above threshold
        if score >= SEFIRA_ILLUMINATION_THRESHOLD:
            sefira_state['active'] = True
            sefira_state['intensity'] = min(score / 10.0, 1.0)  # Normalize to 0-1
            illuminated_sefirot.append(sefira)
            updated = True
        
        tree_state['sefirot'][sefira] = sefira_state
    
    if updated:
        # Add metadata about the update
        if 'clinical_integrations' not in tree_state:
            tree_state['clinical_integrations'] = []
        
        tree_state['clinical_integrations'].append({
            'type': 'aq_kabbalah',
            'test_result_id': aq_result.id,
            'timestamp': aq_result.created_at.isoformat(),
            'illuminated_sefirot': illuminated_sefirot,
        })
        
        cabala_session.tree_state = tree_state
        cabala_session.save(update_fields=['tree_state', 'updated_at'])
        
        logger.info(f"Tree updated from AQ-Kabbalah. Illuminated: {illuminated_sefirot}")
    
    return updated


def extract_ritmo_from_asrs(asrs_result) -> Optional[Dict[str, Any]]:
    """
    Extract ritmo almico interpretation from ASRS-Essence result.
    
    Args:
        asrs_result: TestResult instance
        
    Returns:
        Dict with ritmo data or None
    """
    if not asrs_result:
        return None
    
    # Check result_data for pre-computed interpretation
    if asrs_result.result_data and isinstance(asrs_result.result_data, dict):
        rd = asrs_result.result_data
        if 'ritmo_esencial' in rd:
            return {
                'ritmo_esencial': rd.get('ritmo_esencial'),
                'mundo_predominante': rd.get('mundo_predominante', 'Atzilut'),
                'nivel_del_alma': rd.get('nivel_del_alma', 'Jaiá'),
                'indice_coherencia': rd.get('indice_coherencia'),
                'lectura': rd.get('lectura'),
                'foco_de_trabajo': rd.get('foco_de_trabajo'),
            }
    
    # Compute from raw responses
    data = asrs_result.input_data or {}
    answers = data.get('answers', data) if isinstance(data, dict) else {}
    
    if not answers:
        return None
    
    # Extract numeric values
    raw_vals = []
    for key in sorted(answers.keys()):
        val = answers[key]
        if isinstance(val, (int, float)):
            raw_vals.append(val)
    
    if not raw_vals:
        return None
    
    # Simple interpretation based on average scores
    avg_score = sum(raw_vals) / len(raw_vals)
    max_possible = 5.0  # Assuming likert_5
    
    # Determine ritmo state
    if avg_score >= 4.0:
        ritmo = 'fluido'
        mundo = 'Atzilut'
    elif avg_score >= 3.0:
        ritmo = 'latente'
        mundo = 'Beria'
    elif avg_score >= 2.0:
        ritmo = 'forzado'
        mundo = 'Yetzirah'
    else:
        ritmo = 'fragmentado'
        mundo = 'Beria'  # Fragmentado goes back to Beria for restructuring
    
    coherence = avg_score / max_possible
    
    return {
        'ritmo_esencial': ritmo,
        'mundo_predominante': mundo,
        'nivel_del_alma': 'Jaiá',
        'indice_coherencia': round(coherence, 3),
        'lectura': f'Ritmo {ritmo}: {"El flujo de intención a acción está armonizado." if ritmo == "fluido" else "Se detectan bloqueos en el flujo vital."}',
        'foco_de_trabajo': _get_foco_for_ritmo(ritmo),
    }


def _get_foco_for_ritmo(ritmo: str) -> str:
    """Get therapeutic focus based on ritmo state."""
    focos = {
        'fluido': 'Mantener el equilibrio y profundizar la conexión espiritual.',
        'latente': 'Explorar formas de contacto entre intención y acción.',
        'forzado': 'Reducir la fricción entre voluntad y movimiento.',
        'fragmentado': 'Priorizar anclaje y trabajo de integración.',
    }
    return focos.get(ritmo, 'Explorar el ritmo interno del alma.')


def extract_harmony_from_sha(sha_result) -> Optional[Dict[str, Any]]:
    """
    Extract harmony audit data from SHA-Harmony result.
    
    Args:
        sha_result: TestResult instance
        
    Returns:
        Dict with harmony data or None
    """
    if not sha_result:
        return None
    
    # Check result_data for pre-computed data
    if sha_result.result_data and isinstance(sha_result.result_data, dict):
        return sha_result.result_data
    
    # Compute from raw responses
    data = sha_result.input_data or {}
    answers = data.get('answers', data) if isinstance(data, dict) else {}
    
    if not answers:
        return None
    
    # Extract scores by category
    categories = {}
    for q_id, value in answers.items():
        if isinstance(value, (int, float)):
            # Infer category from question ID pattern
            if 'equilibrio' in q_id.lower():
                categories.setdefault('equilibrio', []).append(value)
            elif 'control' in q_id.lower() or 'impuls' in q_id.lower():
                categories.setdefault('contencion', []).append(value)
            elif 'relacion' in q_id.lower():
                categories.setdefault('relaciones', []).append(value)
            else:
                categories.setdefault('general', []).append(value)
    
    # Calculate averages
    harmony_scores = {}
    for cat, vals in categories.items():
        if vals:
            harmony_scores[cat] = round(sum(vals) / len(vals), 2)
    
    # Overall harmony index
    all_vals = [v for vals in categories.values() for v in vals]
    overall = round(sum(all_vals) / len(all_vals), 2) if all_vals else 0
    
    return {
        'harmony_index': overall,
        'category_scores': harmony_scores,
        'balance_assessment': 'equilibrado' if overall >= 3.5 else 'en proceso',
    }


def sync_clinical_context(cabala_session) -> Dict[str, Any]:
    """
    Synchronize clinical test results with a CabalaSession.
    
    Searches for recent AQ-Kabbalah, ASRS-Essence, and SHA-Harmony results
    for the patient and enriches the session's clinical_context.
    
    Args:
        cabala_session: CabalaSession instance
        
    Returns:
        Dict summarizing what was synced
    """
    patient = cabala_session.patient
    sync_summary = {
        'synced': [],
        'not_found': [],
        'errors': [],
    }
    
    # Initialize clinical_context if needed
    if not cabala_session.clinical_context:
        cabala_session.clinical_context = {}
    
    # 1. Sync AQ-Kabbalah
    try:
        aq_results = get_test_results_for_patient(patient, 'aq_kabbalah')
        if aq_results:
            aq_result = aq_results.first()
            sefira_scores = extract_sefira_scores_from_aq(aq_result)
            
            if sefira_scores:
                cabala_session.clinical_context['aq_kabbalah'] = {
                    'sefira_scores': sefira_scores,
                    'test_result_id': aq_result.id,
                    'timestamp': aq_result.created_at.isoformat(),
                }
                
                # Also update tree state
                update_tree_from_aq(cabala_session, aq_result)
                
                sync_summary['synced'].append('aq_kabbalah')
            else:
                sync_summary['not_found'].append('aq_kabbalah (no scores)')
        else:
            sync_summary['not_found'].append('aq_kabbalah')
    except Exception as e:
        logger.error(f"Error syncing aq_kabbalah: {e}")
        sync_summary['errors'].append(f'aq_kabbalah: {str(e)}')
    
    # 2. Sync ASRS-Essence
    try:
        asrs_results = get_test_results_for_patient(patient, 'asrs_essence')
        if asrs_results:
            asrs_result = asrs_results.first()
            ritmo_data = extract_ritmo_from_asrs(asrs_result)
            
            if ritmo_data:
                cabala_session.clinical_context['ritmo_almico'] = ritmo_data
                cabala_session.clinical_context['ritmo_almico']['test_result_id'] = asrs_result.id
                cabala_session.clinical_context['ritmo_almico']['timestamp'] = asrs_result.created_at.isoformat()
                
                sync_summary['synced'].append('asrs_essence')
            else:
                sync_summary['not_found'].append('asrs_essence (no data)')
        else:
            sync_summary['not_found'].append('asrs_essence')
    except Exception as e:
        logger.error(f"Error syncing asrs_essence: {e}")
        sync_summary['errors'].append(f'asrs_essence: {str(e)}')
    
    # 3. Sync SHA-Harmony
    try:
        sha_results = get_test_results_for_patient(patient, 'sha_harmony')
        if sha_results:
            sha_result = sha_results.first()
            harmony_data = extract_harmony_from_sha(sha_result)
            
            if harmony_data:
                cabala_session.clinical_context['sha_harmony'] = harmony_data
                cabala_session.clinical_context['sha_harmony']['test_result_id'] = sha_result.id
                cabala_session.clinical_context['sha_harmony']['timestamp'] = sha_result.created_at.isoformat()
                
                sync_summary['synced'].append('sha_harmony')
            else:
                sync_summary['not_found'].append('sha_harmony (no data)')
        else:
            sync_summary['not_found'].append('sha_harmony')
    except Exception as e:
        logger.error(f"Error syncing sha_harmony: {e}")
        sync_summary['errors'].append(f'sha_harmony: {str(e)}')
    
    # Save if anything was synced
    if sync_summary['synced']:
        cabala_session.save(update_fields=['clinical_context', 'updated_at'])
        logger.info(f"Clinical context synced: {sync_summary['synced']}")
    
    return sync_summary


def get_clinical_summary_for_session(cabala_session) -> Dict[str, Any]:
    """
    Get a summary of clinical data available for a CabalaSession.
    
    Returns:
        Dict with summary info for frontend display
    """
    ctx = cabala_session.clinical_context or {}
    tree = cabala_session.tree_state or {}
    
    summary = {
        'has_ritmo_almico': 'ritmo_almico' in ctx,
        'has_aq_kabbalah': 'aq_kabbalah' in ctx,
        'has_sha_harmony': 'sha_harmony' in ctx,
        'illuminated_sefirot': [],
        'ritmo_state': None,
        'harmony_index': None,
    }
    
    # Extract ritmo state
    if summary['has_ritmo_almico']:
        ritmo = ctx['ritmo_almico']
        summary['ritmo_state'] = ritmo.get('ritmo_esencial')
        summary['mundo_predominante'] = ritmo.get('mundo_predominante')
    
    # Extract illuminated sefirot from tree state
    sefirot = tree.get('sefirot', {})
    for sefira, state in sefirot.items():
        if isinstance(state, dict) and state.get('active'):
            summary['illuminated_sefirot'].append({
                'name': sefira,
                'intensity': state.get('intensity', 0),
                'aq_score': state.get('clinical_data', {}).get('aq_score'),
            })
    
    # Extract harmony index
    if summary['has_sha_harmony']:
        summary['harmony_index'] = ctx['sha_harmony'].get('harmony_index')
    
    return summary
