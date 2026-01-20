"""
MCMI-4-Mystic question selection and scoring utilities.

Handles intelligent question selection with rotation to prevent patients
from seeing the same questions, and processes 195-item test results.
"""

import random
from datetime import datetime
from typing import Dict, List, Tuple
from django.db.models import Q

from api.mcmi4_models import (
    MCMI4MysticQuestionBank,
    MCMI4MysticTestInstance,
    DimensionConfig
)


def generate_mcmi4_mystic_test(patient_id: int) -> List[Dict]:
    """
    Generate a new MCMI-4-Mystic test for a patient.
    
    Selects 195 questions (7 per dimension for most, 8 for Assiah)
    avoiding questions the patient has seen in recent tests.
    
    Args:
        patient_id: User ID of the patient
        
    Returns:
        List of 195 question dictionaries in randomized order
    """
    
    # Get patient's previous test history
    previous_tests = MCMI4MysticTestInstance.objects.filter(
        patient_id=patient_id
    ).order_by('-applied_at')[:3]  # Last 3 tests
    
    # Collect questions used in recent tests
    used_question_ids = set()
    for test in previous_tests:
        if test.questions_used:
            used_question_ids.update(test.questions_used)
    
    # Get all dimension configs
    dimensions = DimensionConfig.objects.all().order_by('world', 'dimension_id')
    
    selected_questions = []
    
    for dimension in dimensions:
        # Get all active questions for this dimension
        available_questions = list(
            MCMI4MysticQuestionBank.objects.filter(
                dimension_id=dimension.dimension_id,
                is_active=True
            )
        )
        
        if not available_questions:
            print(f"⚠️  Warning: No questions available for {dimension.dimension_id}")
            continue
        
        # Prioritize questions NOT used recently
        unused_questions = [
            q for q in available_questions 
            if q.question_id not in used_question_ids
        ]
        
        # If we have enough unused questions, use only those
        if len(unused_questions) >= dimension.items_required:
            pool = unused_questions
        else:
            # Otherwise, use all available and supplement with used ones
            pool = available_questions
        
        # Randomly select required number of questions
        random.shuffle(pool)
        selected = pool[:dimension.items_required]
        
        # Convert to dict and add
        for question in selected:
            selected_questions.append({
                'question_id': question.question_id,
                'world': question.world,
                'dimension_id': question.dimension_id,
                'sefirah': question.sefirah,
                'text': question.text_es,
                'reverse_scored': question.reverse_scored,
                'weight': question.weight,
            })
    
    # Shuffle the entire test for randomization
    random.shuffle(selected_questions)
    
    print(f"Generated test with {len(selected_questions)} questions for patient {patient_id}")
    print(f"  Avoided {len(used_question_ids)} previously seen questions")
    
    return selected_questions


def calculate_dimension_score(responses: Dict[str, int], 
                              dimension_id: str,
                              questions: List) -> Dict:
    """
    Calculate score for a single dimension.
    
    Args:
        responses: Dict of {question_id: response_value}
        dimension_id: The dimension to calculate
        questions: List of question objects for this dimension
        
    Returns:
        Dict with raw_score, max_score, percentage, etc.
    """
    dimension_questions = [q for q in questions if q.get('dimension_id') == dimension_id]
    
    if not dimension_questions:
        return {
            'raw_score': 0,
            'max_score': 0,
            'percentage': 0,
            'items_answered': 0,
            'items_total': 0,
        }
    
    raw_score = 0
    items_answered = 0
    max_possible = 0
    
    for q in dimension_questions:
        question_id = q.get('question_id')
        weight = q.get('weight', 1.0)
        max_possible += 3 * weight  # Max response is 3
        
        if question_id in responses:
            response = responses[question_id]
            
            # Apply reverse scoring if needed
            if q.get('reverse_scored', False):
                response = 3 - response
            
            raw_score += response * weight
            items_answered += 1
    
    percentage = (raw_score / max_possible * 100) if max_possible > 0 else 0
    
    return {
        'raw_score': round(raw_score, 2),
        'max_score': round(max_possible, 2),
        'percentage': round(percentage, 2),
        'items_answered': items_answered,
        'items_total': len(dimension_questions),
    }


def calculate_world_score(responses: Dict[str, int],
                          world: str,
                          questions: List) -> Dict:
    """
    Calculate aggregate score for an entire world.
    
    Args:
        responses: Dict of {question_id: response_value}
        world: 'atzilut', 'briah', 'yetzirah', or 'assiah'
        questions: All questions in the test
        
    Returns:
        Dict with world-level scores and dimension breakdown
    """
    # Get all dimensions for this world
    world_dimensions = DimensionConfig.objects.filter(world=world)
    
    dimension_scores = {}
    total_raw = 0
    total_max = 0
    
    for dim_config in world_dimensions:
        dim_score = calculate_dimension_score(
            responses, 
            dim_config.dimension_id,
            questions
        )
        dimension_scores[dim_config.dimension_id] = dim_score
        total_raw += dim_score['raw_score']
        total_max += dim_score['max_score']
    
    world_percentage = (total_raw / total_max * 100) if total_max > 0 else 0
    
    # Determine coherence level based on variance
    percentages = [d['percentage'] for d in dimension_scores.values()]
    variance = max(percentages) - min(percentages) if percentages else 0
    
    if variance < 15:
        coherence = "integrated"
    elif variance < 35:
        coherence = "mixed"
    else:
        coherence = "fragmented"
    
    return {
        'total_raw_score': round(total_raw, 2),
        'max_possible': round(total_max, 2),
        'percentage': round(world_percentage, 2),
        'coherence_level': coherence,
        'dimensions': dimension_scores,
    }


def calculate_sephirotic_balance(responses: Dict[str, int],
                                questions: List) -> Dict[str, float]:
    """
    Calculate balance across all 10 Sephirot.
    
    Args:
        responses: Dict of {question_id: response_value}
        questions: All questions in the test
        
    Returns:
        Dict of {sefirah: percentage_score}
    """
    sephirot_scores = {}
    
    sephirot = ['keter', 'chochmah', 'binah', 'chesed', 'gevurah', 
                'tiferet', 'netzach', 'hod', 'yesod', 'malkhut']
    
    for sefirah in sephirot:
        sefirah_questions = [q for q in questions if q.get('sefirah') == sefirah]
        
        if not sefirah_questions:
            sephirot_scores[sefirah] = 0
            continue
        
        raw_score = 0
        max_score = 0
        
        for q in sefirah_questions:
            question_id = q.get('question_id')
            weight = q.get('weight', 1.0)
            max_score += 3 * weight
            
            if question_id in responses:
                response = responses[question_id]
                if q.get('reverse_scored', False):
                    response = 3 - response
                raw_score += response * weight
        
        percentage = (raw_score / max_score * 100) if max_score > 0 else 0
        sephirot_scores[sefirah] = round(percentage, 2)
    
    return sephirot_scores


def compute_mcmi4_mystic_full(responses: Dict[str, int],
                              questions_used: List[Dict]) -> Dict:
    """
    Complete scoring for MCMI-4-Mystic 195-item test.
    
    Args:
        responses: Dict of {question_id: response_value (0-3)}
        questions_used: List of question dicts used in this test
        
    Returns:
        Complete structured_data dict with all scores and interpretations
    """
    
    # Calculate scores for each world
    world_scores = {}
    for world in ['atzilut', 'briah', 'yetzirah', 'assiah']:
        world_scores[world] = calculate_world_score(responses, world, questions_used)
    
    # Identify dominant and weakest worlds
    world_percentages = {w: s['percentage'] for w, s in world_scores.items()}
    dominant_world = max(world_percentages.items(), key=lambda x: x[1])[0]
    weakest_world = min(world_percentages.items(), key=lambda x: x[1])[0]
    
    # Calculate integration index (how balanced are the worlds?)
    percentages = list(world_percentages.values())
    integration_index = 100 - (max(percentages) - min(percentages))
    integration_index = max(0, min(100, integration_index))
    
    # Identify tikkun priorities (lowest 3 dimensions across all worlds)
    all_dimensions = []
    for world, world_data in world_scores.items():
        for dim_id, dim_score in world_data['dimensions'].items():
            all_dimensions.append({
                'dimension_id': dim_id,
                'percentage': dim_score['percentage'],
                'world': world,
            })
    
    all_dimensions.sort(key=lambda x: x['percentage'])
    tikkun_priorities = [d['dimension_id'] for d in all_dimensions[:3]]
    
    # Calculate sephirotic balance
    sephirotic_balance = calculate_sephirotic_balance(responses, questions_used)
    
    # Determine transition suggestion
    transition_suggestion = determine_transition_mcmi4(
        dominant_world, 
        weakest_world,
        integration_index
    )
    
    # Generate summary
    summary_text = generate_mcmi4_summary(
        world_scores,
        dominant_world,
        weakest_world,
        integration_index
    )
    
    structured_data = {
        'world_scores': world_scores,
        'overall_profile': {
            'dominant_world': dominant_world,
            'weakest_world': weakest_world,
            'integration_index': round(integration_index, 2),
            'tikkun_priorities': tikkun_priorities,
        },
        'sephirotic_balance': sephirotic_balance,
        'transition_suggestion': transition_suggestion,
    }
    
    return {
        'processed': True,
        'structured_data': structured_data,
        'raw_answers': responses,
        'summary_text': summary_text,
        'timestamp': str(datetime.now()),
    }


def determine_transition_mcmi4(dominant: str, weakest: str, integration: float) -> str:
    """Determine which world to work on next based on profile."""
    
    # If integration is very low, work on weakest world
    if integration < 50:
        return weakest
    
    # If dominant is Atzilut/Briah but weak Assiah, ground it
    if dominant in ['atzilut', 'briah'] and weakest == 'assiah':
        return 'assiah'
    
    # If dominant is Assiah but weak in upper worlds, elevate
    if dominant == 'assiah' and weakest in ['atzilut', 'briah']:
        return weakest
    
    # Default: work on weakest
    return weakest


def generate_mcmi4_summary(world_scores, dominant, weakest, integration):
    """Generate interpretive summary text."""
    
    integration_label = "alta" if integration >= 70 else "moderada" if integration >= 50 else "baja"
    
    world_names = {
        'atzilut': 'Atzilut (Espiritual)',
        'briah': 'Briah (Mental)',
        'yetzirah': 'Yetzirah (Emocional)',
        'assiah': 'Assiah (Físico)',
    }
    
    summary = f"""Perfil multiaxial cósmico del alma:

Mundo Dominante: {world_names[dominant]} ({world_scores[dominant]['percentage']:.1f}%)
Mundo a Fortalecer: {world_names[weakest]} ({world_scores[weakest]['percentage']:.1f}%)
Integración entre Mundos: {integration_label} ({integration:.1f}%)

Tu configuración actual muestra mayor desarrollo en el mundo {world_names[dominant].lower()}, 
mientras que el mundo {world_names[weakest].lower()} requiere atención y cultivo. 
El nivel de integración sugiere {'un flujo armónico' if integration >= 70 else 'oportunidades de síntesis'} 
entre los diferentes niveles de tu ser."""
    
    return summary
