# ReAct Agent

> Interleaves chain-of-thought Reasoning with Action execution, enabling LLMs to dynamically plan, act, and observe in a loop.

**Category:** Agentic AI  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/agentic/react-agent/](https://codesociety.net/patterns/agentic/react-agent/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Standard LLM prompting produces static responses without the ability to gather new information or take actions mid-generation. The model cannot verify its own claims, access external data, or adapt its approach based on intermediate results.

## Solution

Structure the agent into a Thought → Action → Observation loop. The LLM first reasons about what to do (Thought), then executes a tool or API call (Action), observes the result (Observation), and uses that to inform its next reasoning step. This continues until the task is complete.
