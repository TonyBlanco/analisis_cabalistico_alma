"""
Compute function for BioEmotional Intake questionnaire.

Processes responses and generates axis scores with dictionary tag correlations.
"""
import json
import os
from typing import Any

# Load schema for reference
SCHEMA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'resources',
    'bioemotional_intake_schema.json'
)

def load_schema():
    """Load the questionnaire schema."""
    try:
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def compute_bioemotional_intake(input_data: dict) -> dict:
    """
    Compute BioEmotional Intake results.
    
    Args:
        input_data: Dict with 'responses' key containing q1-q22 answers (0-4)
    
    Returns:
        Dict with axis_scores, total_score, interpretation, and tag_correlations
    """
    schema = load_schema()
    if not schema:
        return {
            'error': 'Schema not found',
            'raw_responses': input_data.get('responses', {})
        }
    
    responses = input_data.get('responses', {})
    questions = schema.get('questions', [])
    scoring = schema.get('scoring', {})
    
    # Initialize axis scores
    axes = {
        'sintomas_fisicos': {'score': 0, 'count': 0, 'questions': []},
        'estado_emocional': {'score': 0, 'count': 0, 'questions': []},
        'contexto_relacional': {'score': 0, 'count': 0, 'questions': []},
        'patrones_transgeneracionales': {'score': 0, 'count': 0, 'questions': []},
        'somatizacion': {'score': 0, 'count': 0, 'questions': []},
    }
    
    # Collect all triggered tags
    triggered_tags = []
    high_score_questions = []
    body_regions_affected = []
    
    # Process each question
    for q in questions:
        q_id = q['id']
        axis = q['axis']
        response_value = responses.get(q_id)
        
        if response_value is not None:
            try:
                value = int(response_value)
            except (ValueError, TypeError):
                value = 0
            
            axes[axis]['score'] += value
            axes[axis]['count'] += 1
            axes[axis]['questions'].append({
                'id': q_id,
                'value': value,
                'text': q['text'][:50] + '...' if len(q['text']) > 50 else q['text']
            })
            
            # Track high scores (3 or 4) for tag correlation
            if value >= 3:
                triggered_tags.extend(q.get('dictionary_tags', []))
                high_score_questions.append({
                    'id': q_id,
                    'text': q['text'],
                    'value': value,
                    'axis': axis,
                    'tags': q.get('dictionary_tags', [])
                })
                
                # Track body regions
                if q.get('body_region'):
                    body_regions_affected.append(q['body_region'])
    
    # Calculate axis interpretations
    axis_results = {}
    interpretation_rules = scoring.get('interpretation', {}).get('per_axis', {})
    
    for axis_id, axis_data in axes.items():
        score = axis_data['score']
        
        # Determine interpretation level
        level = 'low'
        for level_name, level_config in interpretation_rules.items():
            range_min, range_max = level_config['range']
            if range_min <= score <= range_max:
                level = level_name
                break
        
        axis_results[axis_id] = {
            'score': score,
            'max_possible': axis_data['count'] * 4,
            'percentage': round((score / (axis_data['count'] * 4)) * 100, 1) if axis_data['count'] > 0 else 0,
            'level': level,
            'label': interpretation_rules.get(level, {}).get('label', 'Sin datos'),
            'question_count': axis_data['count']
        }
    
    # Calculate total score
    total_score = sum(a['score'] for a in axes.values())
    total_max = sum(a['count'] * 4 for a in axes.values())
    
    # Determine total interpretation
    total_rules = scoring.get('interpretation', {}).get('total', {})
    total_level = 'low'
    for level_name, level_config in total_rules.items():
        range_min, range_max = level_config['range']
        if range_min <= total_score <= range_max:
            total_level = level_name
            break
    
    # Deduplicate and count tags
    tag_frequency = {}
    for tag in triggered_tags:
        tag_frequency[tag] = tag_frequency.get(tag, 0) + 1
    
    # Sort tags by frequency
    sorted_tags = sorted(tag_frequency.items(), key=lambda x: x[1], reverse=True)
    
    # Priority axes (those with 'high' level)
    priority_axes = [
        axis_id for axis_id, data in axis_results.items() 
        if data['level'] == 'high'
    ]
    
    return {
        'test_code': 'bioemotional_intake',
        'version': '1.0.0',
        'axis_scores': axis_results,
        'total': {
            'score': total_score,
            'max_possible': total_max,
            'percentage': round((total_score / total_max) * 100, 1) if total_max > 0 else 0,
            'level': total_level,
            'label': total_rules.get(total_level, {}).get('label', 'Sin interpretación')
        },
        'tag_correlations': {
            'all_triggered': sorted_tags[:20],  # Top 20 tags
            'high_frequency': [t for t, c in sorted_tags if c >= 2],
        },
        'priority_areas': {
            'axes': priority_axes,
            'body_regions': list(set(body_regions_affected)),
            'high_score_items': high_score_questions[:10]  # Top 10 for review
        },
        'recommendations': {
            'explore_dictionary': sorted_tags[:5] if sorted_tags else [],
            'body_focus': list(set(body_regions_affected))[:3],
            'suggested_follow_up': _generate_follow_up_suggestions(axis_results, sorted_tags)
        },
        'raw_responses': responses
    }


def _generate_follow_up_suggestions(axis_results: dict, sorted_tags: list) -> list:
    """Generate follow-up session suggestions based on results."""
    suggestions = []
    
    # Check priority axes
    for axis_id, data in axis_results.items():
        if data['level'] == 'high':
            if axis_id == 'sintomas_fisicos':
                suggestions.append('Explorar síntomas físicos en el mapa corporal 3D')
            elif axis_id == 'estado_emocional':
                suggestions.append('Profundizar en estados emocionales con el diccionario bio-emocional')
            elif axis_id == 'patrones_transgeneracionales':
                suggestions.append('Revisar árbol transgeneracional y lealtades invisibles')
            elif axis_id == 'contexto_relacional':
                suggestions.append('Explorar dinámicas relacionales actuales')
            elif axis_id == 'somatizacion':
                suggestions.append('Trabajar conexión cuerpo-emoción consciente')
    
    # Add tag-based suggestions
    if sorted_tags:
        top_tags = [t[0] for t in sorted_tags[:3]]
        suggestions.append(f'Consultar diccionario: {", ".join(top_tags)}')
    
    return suggestions[:5]  # Max 5 suggestions
