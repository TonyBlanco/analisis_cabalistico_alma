# Sefer Yetzirah Mappings (PoC)

This file contains starter mappings from Hebrew letters to symbolic attributes used in our PoC rule engine.

Format (PoC):
- letter: {
    'he': 'א',
    'name_en': 'Aleph',
    'planet': 'air/none',
    'paths': ['1-2','2-3'],
    'associated_sefira': 'Keter',
    'notes': 'Prototype mapping - subject to review'
  }

Example entries:
- א (Aleph): associated with Keter, creative principle, often mapped to Air/Spirit in our PoC.
- ב (Bet): associated with Binah / house of receptivity.

PoC data (minimal subset):

aleph:
  he: 'א'
  name_en: 'Aleph'
  planet: null
  paths: ['1-2']
  sefira: 'keter'
  notes: 'Primordial letter. Interpret as creative breath.'

bet:
  he: 'ב'
  name_en: 'Bet'
  planet: 'venus'
  paths: ['2-3']
  sefira: 'binah'
  notes: 'House/structure. Links to receptivity.'

# Provenance
source_name: 'Sefer Yetzirah (PoC curations)'
source_reference: 'PoC curated mappings (2025)'
version: '0.1-poc'
curator: 'team'
