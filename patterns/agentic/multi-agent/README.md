# Multi-Agent Orchestration

> Coordinate a network of specialised AI agents under an orchestrator, where each agent owns a distinct capability or domain and agents communicate through structured messages.

**Category:** Agentic AI  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/agentic/multi-agent/](https://codesociety.net/patterns/agentic/multi-agent/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Complex tasks span multiple domains — research, coding, data analysis, communication — and a single general-purpose agent must context-switch between all of them, diluting focus and overflowing context windows. Monolithic agents also lack isolation: a failure in one capability can corrupt the entire task context.

## Solution

Decompose the system into specialised sub-agents (e.g., a ResearchAgent, a CodeAgent, a CritiqueAgent) each with a focused prompt, tool set, and memory scope. An Orchestrator agent receives the top-level goal, delegates sub-tasks to the appropriate specialist via structured messages, aggregates their outputs, and synthesises the final result.
