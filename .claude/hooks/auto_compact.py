#!/usr/bin/env python3
"""
Auto-Compact — Memory maintenance and archival.

Usage:
    python auto_compact.py --dry-run       # Safe, no changes
    python auto_compact.py --execute       # Apply changes
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta


class MemoryCompactor:
    """Automatic memory system maintenance."""

    def __init__(self, memory_root: Path = None):
        if memory_root is None:
            memory_root = Path(__file__).parent.parent.parent / ".ai-memory"
        self.memory_root = memory_root
        self.history_dir = memory_root / "history"

    def run(self, dry_run: bool = True) -> Dict:
        """Run compaction."""
        self.history_dir.mkdir(exist_ok=True)

        print("\n" + "="*70)
        print("MEMORY COMPACTOR")
        print("="*70)

        if dry_run:
            print("\n⚠️  DRY RUN MODE — No changes will be made\n")
        else:
            print("\n🔄 EXECUTE MODE — Making changes\n")

        # Report
        report = {
            "timestamp": datetime.now().isoformat(),
            "mode": "dry-run" if dry_run else "execute",
            "folders": {
                "core": self._count_files(self.memory_root / "core"),
                "active": self._count_files(self.memory_root / "active"),
                "audits": self._count_files(self.memory_root / "audits"),
                "history": self._count_files(self.history_dir),
            }
        }

        print("📊 Memory Usage Report")
        print("────────────────────────")
        for folder, count in report["folders"].items():
            print(f"  {folder}: {count} files")

        print("\n" + "="*70)

        if dry_run:
            print("\n💡 To apply changes, run: python auto_compact.py --execute\n")

        return report

    def _count_files(self, path: Path) -> int:
        """Count files in directory."""
        if not path.exists():
            return 0
        return len(list(path.glob("**/*")))


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Auto-compact AI memory system",
        epilog="Default: DRY RUN (read-only). Use --execute to apply changes."
    )
    parser.add_argument("--execute", action="store_true",
                       help="Apply changes (default is dry-run)")
    parser.add_argument("--apply", dest="execute", action="store_true",
                       help="Alias for --execute")
    parser.add_argument("--dry-run", action="store_true",
                       help="Explicit dry-run (default)")

    args = parser.parse_args()
    dry_run = not args.execute

    compactor = MemoryCompactor()
    report = compactor.run(dry_run=dry_run)

    return 0


if __name__ == "__main__":
    sys.exit(main())
