Kabbalah mapping files (PoC)

Location:
- docs/04_SYMBOLIC_SYSTEM/mappings/

Naming & versioning:
- Files should follow `{prefix}_v{version}.yml` or `.yaml` pattern when possible.
- Each file must have metadata fields: `version`, `source`, `created_at`, `curator`, and `license`.

Supported mappings (Phase 1):
- `72_names_v1.yml` — list of 72 Names entries (id, key, letters, associated_planet, associated_sephira, strength, description).
- `sefer_yetzirah_v1.yml` — letter mappings used to map Sefer Yetzirah letters to attributes.
- `sephirot_v1.yml` — sephirot definitions and attributes.

Implementation notes:
- The backend loader (`api.symbolic.kabbalah_mappings`) prefers files in the `mappings/` folder and will fall back to legacy markdown files if present.
- In test or minimal environments where PyYAML may not be installed, a conservative fallback parser extracts essential fields (ids, letters, version metadata) so the PoC can operate deterministically.
- Add provenance information (source, curator, license) to ensure governance and auditability for any future curations.
- A CI validation workflow (`.github/workflows/validate-mappings.yml`) runs `backend/scripts/validate_mappings.py` on PRs to ensure required mapping files exist and include metadata (version/source/curator/license).
