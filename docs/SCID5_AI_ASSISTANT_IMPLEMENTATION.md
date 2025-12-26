# SCID-5 AI Assistant Implementation

## Overview
The SCID-5 AI Assistant is an ethical AI layer that provides therapeutic guidance for the SCID-5 Holistic Exploration tool. It operates as an assistant layer, not a central logic component, ensuring all output is editable and validated by the therapist.

## Architecture

### Backend Components
- **SCID5AIAssistantView**: Django REST API view handling AI assistance requests
- **SCID5AIAssistant**: Core AI service class managing Gemini AI integration
- **URL Pattern**: `/api/analysis-records/scid5-ai-assistant/`

### Frontend Components
- **SCID5ClinicalModule**: Enhanced with AI assistant functionality
- **AI Assistance Panel**: Displays suggestions, correlations, and ethical reminders
- **Depth Level Selector**: Configurable exploration depth (1-3)

## Ethical Framework

### Absolute Prohibitions
- ❌ No diagnosis (medical or psychological)
- ❌ No DSM, CIE, or clinical pathology terminology
- ❌ No words: "enfermedad", "trastorno", "síndrome", "certeza", "pronóstico"
- ❌ No treatment prescriptions
- ❌ No biological causality assertions
- ❌ No future event predictions
- ❌ No therapist judgment substitution
- ❌ No response induction ("¿es cierto que…?")

### Mandatory Language
- ✅ "posible lectura simbólica"
- ✅ "hipótesis orientativa"
- ✅ "resonancia observada"
- ✅ "pregunta exploratoria"
- ✅ "área de atención consciente"
- ✅ "proceso en curso"
- ✅ "esto requiere contexto y validación humana"

## Depth Levels

### Level 1 - Basic
- 2-3 soft questions
- 1 orienting hypothesis maximum
- No complex correlations

### Level 2 - Deep
- 4-6 questions (including body, relationship, purpose)
- Simple correlation with MSHE and one extra module

### Level 3 - Advanced
- 6-10 questions
- Multi-module correlation
- Identifies central tension + integrative question
- Proposes editable synthesis draft

## Output Structure

```json
{
  "section": "string",
  "depth_level": 1,
  "suggested_questions": [
    {
      "q": "string",
      "intent": "string"
    }
  ],
  "symbolic_correlations": [
    {
      "source": "MSHE|tarot|astrology|kabbalah|transgenerational|biodecoding",
      "note": "string"
    }
  ],
  "draft_section_synthesis": "string",
  "ethical_guardrails": ["string"],
  "therapist_actions": [
    {
      "action": "string",
      "why": "string"
    }
  ]
}
```

## Contextual Data Integration

The AI assistant integrates with existing patient data:

### MSHE (Holistic Synthesis)
- Priority axes and evolution patterns
- Persistent patterns

### Cabala/Numerology
- Destiny, Soul, Personality, Expression numbers

### Tarot
- Archetypes and evolutionary narratives

### Astrology
- Rhythms and cycles (non-predictive)

### Transgenerational
- Repetition patterns

### Biodecoding
- Metaphorical body correlations (no causality)

## Implementation Details

### Backend Processing Flow
1. Validate therapist-patient ownership
2. Extract current SCID-5 data from request
3. Gather contextual patient data from analysis records
4. Construct ethical AI prompt
5. Generate Gemini AI response
6. Parse and validate JSON output
7. Return structured assistance

### Frontend Integration
1. Depth level selector in header
2. AI assistant button on each section
3. Expandable assistance panel
4. Color-coded information display
5. Editable suggestions with ethical disclaimers

## Safety Features

### Input Validation
- Patient ownership verification
- Depth level bounds checking
- JSON structure validation

### Output Sanitization
- JSON parsing with error handling
- Fallback responses when AI unavailable
- Ethical content filtering

### Error Handling
- Graceful degradation when AI service unavailable
- Clear error messages for therapists
- Logging of AI service issues

## Usage Guidelines

### For Therapists
1. AI suggestions are tools, not substitutes for clinical judgment
2. All AI output must be reviewed and adapted
3. Maintain therapeutic alliance and ethical boundaries
4. Use AI assistance to enhance exploration, not direct it

### For Developers
1. Never expose AI suggestions as clinical conclusions
2. Always include ethical disclaimers
3. Maintain clear separation between AI assistance and clinical logic
4. Log AI usage for quality monitoring

## Future Enhancements

### Potential Features
- Custom prompt templates per therapist
- AI assistance history tracking
- Integration with additional symbolic modules
- Multi-language support
- Therapist feedback collection

### Monitoring
- AI response quality assessment
- Ethical compliance verification
- Usage pattern analysis
- Performance optimization</content>
<parameter name="filePath">d:\analisis_cabalistico_alma\docs\SCID5_AI_ASSISTANT_IMPLEMENTATION.md