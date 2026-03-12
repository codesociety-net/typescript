# Plan-and-Execute

> Separate high-level planning from step-by-step execution: one LLM call produces a structured plan, then individual executor calls carry out each step, with replanning triggered by unexpected results.

**Category:** Agentic AI  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/agentic/plan-and-execute/](https://codesociety.net/patterns/agentic/plan-and-execute/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Asking a single LLM call to simultaneously reason about goals, decompose sub-tasks, and execute actions conflates distinct cognitive responsibilities, leading to lost context, premature commitment to bad paths, and difficulty recovering from errors mid-task.

## Solution

Split the agent loop into two roles: a Planner LLM that receives the goal and produces an ordered list of discrete steps, and an Executor that processes each step individually (often with tool use). After each step, results are fed back to the Planner, which either confirms continuation or revises the remaining plan.
