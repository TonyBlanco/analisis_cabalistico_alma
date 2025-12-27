from dataclasses import dataclass
from pathlib import Path
import os
from typing import List, Optional

try:
    import swisseph as swe  # type: ignore
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False


DEFAULT_EPHEMERIS_DIR = Path(__file__).resolve().parent.parent / "ephemeris"
ENV_EPHE_PATH = "SWISSEPH_PATH"


@dataclass
class ValidationResult:
    ok: bool
    path: Optional[Path]
    errors: List[str]


def resolve_ephemeris_path() -> Path:
    """
    Resolve ephemeris path from env or fallback to repo path.

    Returns:
        Path to ephemeris directory (may or may not exist yet).
    """
    env_path = os.getenv(ENV_EPHE_PATH)
    if env_path:
        return Path(env_path).expanduser().resolve()
    return DEFAULT_EPHEMERIS_DIR


def validate_ephemeris_path(path: Path) -> ValidationResult:
    """
    Validate ephemeris directory and minimal file presence.

    Checks:
    - Directory exists
    - Readable
    - Contains at least one .se1 or .se2 file
    """
    errors: List[str] = []
    ephe_path = path

    if not ephe_path.exists():
        errors.append(f"Ephemeris path does not exist: {ephe_path}")
    elif not ephe_path.is_dir():
        errors.append(f"Ephemeris path is not a directory: {ephe_path}")
    else:
        if not os.access(ephe_path, os.R_OK):
            errors.append(f"Ephemeris path not readable: {ephe_path}")
        # Minimal presence check: at least one Swiss Ephemeris data file
        se_files = list(ephe_path.glob("*.se1")) + list(ephe_path.glob("*.se2"))
        if len(se_files) == 0:
            errors.append(f"No Swiss Ephemeris data files (*.se1/*.se2) found in {ephe_path}")

    return ValidationResult(ok=len(errors) == 0, path=ephe_path, errors=errors)


def configure_ephemeris_path() -> ValidationResult:
    """
    Resolve and validate ephemeris path; if valid and swisseph is available,
    configure swe to use the path. Returns ValidationResult.
    """
    ephe_path = resolve_ephemeris_path()
    validation = validate_ephemeris_path(ephe_path)

    if validation.ok and SWISSEPH_AVAILABLE:
        try:
            swe.set_ephe_path(str(ephe_path))
        except Exception as exc:  # pragma: no cover - defensive
            validation.errors.append(f"Failed to set Swiss Ephemeris path: {exc}")
            validation.ok = False

    return validation
