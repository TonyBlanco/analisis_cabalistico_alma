# Tree of Life SVG

This module provides a neutral, reusable Tree of Life visual wrapper.
It delegates to the canonical `SefirotInteractive` SVG and applies
highlight and focus styles via props.

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
The base SVG lives in `BodySoulVisualization/SefirotInteractive.tsx`.
TreeOfLifeSVG preserves the public props and types while mapping
highlight, focus, repetition, and opacity styles onto the canonical layout.

## Intended Consumers
- Symbolic Overlay Viewer
- Cross System Workspace
- Tarot Workspace
- AI Symbolic Workspace
