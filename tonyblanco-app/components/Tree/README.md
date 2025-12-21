# Tree of Life SVG

This module provides a neutral, reusable Tree of Life visual stub.
It renders only geometry (nodes + paths) with optional highlights.

## Scope
- Pure visual renderer
- No interpretation or symbolism
- No patient context or data dependencies

## Usage
TreeOfLifeSVG accepts highlighted nodes/paths plus optional focus states.
It is designed to be mounted by symbolic workspaces when needed.

## SVG Integration Point
The current renderer is a placeholder SVG layout.
A production-grade Tree of Life SVG should replace the stub drawing logic
inside TreeOfLifeSVG while keeping the same public props and types.

## Intended Consumers
- Symbolic Overlay Viewer
- Cross System Workspace
- Tarot Workspace
- AI Symbolic Workspace
