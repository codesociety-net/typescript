# Evaluator-Optimizer Agent

> An iterative refinement loop where an 'Evaluator' provides granular feedback on an 'Optimizer’s' output until quality thresholds are met.

**Category:** Agentic AI  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/agentic/evaluator-optimizer/](https://codesociety.net/patterns/agentic/evaluator-optimizer/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

LLMs often struggle with complex tasks requiring high precision in a single pass. A single prompt may produce output that is partially correct but contains subtle errors in logic, formatting, or completeness that are difficult to catch without structured review.

## Solution

Decouple the roles. One agent (Optimizer) focuses on creative generation, while a second agent (Evaluator) applies structured rubrics to critique the output. The loop continues—refine, evaluate, refine—until the Evaluator’s criteria are fully satisfied or a maximum iteration count is reached.
