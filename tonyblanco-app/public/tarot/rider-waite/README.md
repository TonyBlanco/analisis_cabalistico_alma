# Rider-Waite-Smith card scans

Public-domain-style scans used for Rider–Waite tiradas in Studios33.

## Face cards (78)

**Source:** [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json) (MIT License)  
**Refresh:** `python3 scripts/fetch_rider_waite_images.py`

- Major arcana: `m00.jpg` … `m21.jpg`
- Minor arcana: `c*`, `s*`, `w*`, `p*` (full 78-card deck)

Optional higher-quality cleanup (300×527, black border):  
`python3 scripts/fetch_luciellaes_rider_waite.py --replace-faces`

## Card back + border (luciellaes CC0)

**Source:** [luciellaes Rider-Waite CC0](https://luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0)  
**Refresh:** `python3 scripts/fetch_luciellaes_rider_waite.py`

- `card-back.jpg` ← itch `CardBacks.jpg`
- `card-border.png` ← itch `cardBorder.png`

Filename mapping (luciellaes ↔ project):  
`backend/packages/symbolic/tarot/rider-waite/luciellaes_manifest.json`

## Metadata

- `backend/packages/symbolic/tarot/rider-waite/tarot-images.json`
- Minors JSON: `python3 scripts/build_rider_waite_minors.py`

**Text reference:** [Sacred Texts Pictorial Key](https://www.sacred-texts.com/tarot/pkt/index.htm)