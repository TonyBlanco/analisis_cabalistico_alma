#!/usr/bin/env python3
"""
Context Loader — Auto-load selective memory based on task type.

Usage:
    python context_loader.py --dry-run "your task description"
    python context_loader.py "your task" --json
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple

class ContextLoader:
    """Auto-loads memory files based on task classification."""

    def __init__(self):
        self.memory_root = Path(__file__).parent.parent.parent / ".ai-memory"
        self.prompt = ""
        self.classified_model = None
        self.loaded_files = []

    def classify_task(self, prompt: str) -> Tuple[str, float]:
        """Classify task into: HAIKU, SONNET, OPUS"""
        prompt_lower = prompt.lower()

        haiku_keywords = {
            "organize", "markdown", "template", "summarize",
            "index", "document", "archive", "move", "readme",
            "generate adr", "create guide"
        }

        sonnet_keywords = {
            "implement", "fix", "debug", "test", "refactor",
            "integrate", "optimize", "add", "endpoint",
            "api", "database", "service", "component"
        }

        opus_keywords = {
            "architecture", "design", "security audit", "root cause",
            "federation", "scaling", "microservice", "compliance",
            "system-wide", "irreversible"
        }

        haiku_score = sum(1 for kw in haiku_keywords if kw in prompt_lower)
        sonnet_score = sum(1 for kw in sonnet_keywords if kw in prompt_lower)
        opus_score = sum(1 for kw in opus_keywords if kw in prompt_lower)

        scores = {"HAIKU": haiku_score, "SONNET": sonnet_score, "OPUS": opus_score}
        model = max(scores, key=scores.get)
        max_score = scores[model]
        total_score = sum(scores.values())
        confidence = max_score / (total_score + 1) if total_score > 0 else 0.5

        return model, confidence

    def load_memory_files(self, model: str) -> List[str]:
        """Load memory files appropriate for the model."""
        files_to_load = []

        if model == "HAIKU":
            files_to_load = [
                ".ai-memory/INDEX.md",
                ".ai-memory/active/session_context.md"
            ]
        elif model == "SONNET":
            files_to_load = [
                ".ai-memory/INDEX.md",
                ".ai-memory/core/model_policy.md",
                ".ai-memory/active/session_context.md"
            ]
        elif model == "OPUS":
            files_to_load = [
                ".ai-memory/INDEX.md",
                ".ai-memory/core/model_policy.md",
                ".ai-memory/core/architecture.md",
                ".ai-memory/active/session_context.md"
            ]

        existing_files = []
        for file_path in files_to_load:
            full_path = self.memory_root.parent / file_path
            if full_path.exists():
                existing_files.append(file_path)

        return existing_files

    def load(self, prompt: str) -> Dict:
        """Classify task and recommend memory load."""
        self.prompt = prompt
        model, confidence = self.classify_task(prompt)
        self.classified_model = model

        base_files = self.load_memory_files(model)
        total_size = sum((self.memory_root.parent / f).stat().st_size
                        for f in base_files if (self.memory_root.parent / f).exists())

        return {
            "model": model,
            "confidence": f"{confidence:.1%}",
            "files_loaded": base_files,
            "context_size_estimate": f"{total_size / 1024:.0f} KB" if total_size > 0 else "0 KB",
            "mode": "DRY RUN (read-only)"
        }


def main():
    """Entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Context Loader - Auto-load memory by task type")
    parser.add_argument("prompt", nargs="?", help="Task prompt to classify")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode (read-only)")
    parser.add_argument("--json", action="store_true", help="Output JSON only")

    args = parser.parse_args()

    prompt = args.prompt or sys.stdin.read() if not sys.stdin.isatty() else None

    if not prompt:
        print("Error: No prompt provided", file=sys.stderr)
        sys.exit(1)

    loader = ContextLoader()
    result = loader.load(prompt)

    if not args.json:
        print("\n" + "="*70)
        print("CONTEXT LOADER")
        print("="*70)
        print(f"\nModel: {result['model']}")
        print(f"Confidence: {result['confidence']}")
        print(f"\nFiles to load: {len(result['files_loaded'])}")
        for f in result['files_loaded']:
            print(f"  • {f}")
        print(f"\nEstimated size: {result['context_size_estimate']}")
        print("\n" + "="*70 + "\n")

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
