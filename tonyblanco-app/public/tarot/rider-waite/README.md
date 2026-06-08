# Rider-Waite-Smith card scans

Public-domain-style scans used for Rider–Waite tiradas in Studios33.

**Source:** [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json) (MIT License)  
**Refresh:** `python3 scripts/fetch_rider_waite_images.py`

- Major arcana: `m00.jpg` … `m21.jpg`
- Minor arcana: `c*`, `s*`, `w*`, `p*` (full 78-card deck for future spreads)

Metadata: `backend/packages/symbolic/tarot/rider-waite/tarot-images.json`  
Minors JSON: `python3 scripts/build_rider_waite_minors.py`

**Alternate art reference (PNG):** [Sacred Texts Tarot cross-reference](https://www.sacred-texts.com/tarot/xr/index.htm) — side-by-side scans per card; useful if we regenerate PNGs locally.