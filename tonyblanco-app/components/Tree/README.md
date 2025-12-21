# Tree of Life SVG

This module provides a neutral, reusable Tree of Life visual stub.
It renders only geometry (nodes + paths) with optional highlights.

## Scope
- Pure visual renderer
- No interpretation or symbolism
- No analysis is performed
- No patient context or data dependencies

## Usage
TreeOfLifeSVG supports highlighted sefirot/paths, focused sefirah mode,
and optional dimming of unrelated elements. Highlights apply accent color,
path thickness, and a soft glow for sefirot.
It is designed to be mounted by symbolic workspaces when needed.

## SVG Integration Point
The current renderer is a placeholder SVG layout.
A production-grade Tree of Life SVG should replace the stub drawing logic
inside TreeOfLifeSVG while keeping the same public props and types.
SVG element IDs must match the canonical TreeSefirahId and TreePathId values.

## Intended Consumers
- Symbolic Overlay Viewer
- Cross System Workspace
- Tarot Workspace
- AI Symbolic Workspace
