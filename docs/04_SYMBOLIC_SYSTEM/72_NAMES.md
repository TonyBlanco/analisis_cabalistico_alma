# 72 Names (Shemot) - PoC Mapping

This document defines a minimal representation for the 72 Names and a scoring sketch for Phase 1.

Representation:
- name_index: {
    'letters': 'שדי',
    'translit': 'Shaddai',
    'attributes': ['protection','healing'],
    'associated_planet': 'moon',
    'notes': 'Prototype mapping'
  }

PoC scoring rules (first draft):
- For each natal chart, compute matches between planet placements and names' associated planets.
- Basic score = number of matches adjusted by planet strength (house, aspects).
- Names with numeric/letter correspondences that match birth-name letters get bonus points.

Provenance:
source_name: '72 Names - PoC curated'
version: '0.1-poc'
curator: 'team'
