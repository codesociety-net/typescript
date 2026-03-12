# Tool Use Agent

> Augment an LLM with callable external tools — APIs, code interpreters, databases — so it can take actions and retrieve real-time information beyond its training data.

**Category:** Agentic AI  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/agentic/tool-use/](https://codesociety.net/patterns/agentic/tool-use/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

A standalone language model is limited to knowledge frozen at training time and cannot perform side effects such as searching the web, executing code, or writing to a database. This makes it unreliable for tasks requiring up-to-date information, precise computation, or integration with live systems.

## Solution

Define a catalogue of typed tool schemas (name, description, parameter types) and provide them to the model at inference time. When the model determines a tool is needed, it emits a structured tool-call; the host runtime executes the tool and returns results to the model, which incorporates them into its next reasoning step.
