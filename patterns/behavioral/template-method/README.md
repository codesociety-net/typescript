# Template Method

> Defines the skeleton of an algorithm in a base class, deferring certain steps to subclasses without changing the algorithm's overall structure.

**Category:** Behavioral  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/behavioral/template-method/](https://codesociety.net/patterns/behavioral/template-method/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When multiple classes share the same algorithm structure but differ only in specific steps, duplicating the skeleton across subclasses leads to code repetition and divergence. Any change to the overall flow must be replicated in every copy, making maintenance error-prone.

## Solution

Declare the algorithm's skeleton as a final method in the base class, calling abstract 'hook' methods at variation points. Subclasses override only the hook methods to supply their specific implementations. The base class controls the invariant structure while subclasses control the variant details.
