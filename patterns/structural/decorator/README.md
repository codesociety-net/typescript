# Decorator

> Attaches additional responsibilities to an object dynamically by wrapping it in decorator objects that share the same interface.

**Category:** Structural  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/structural/decorator/](https://codesociety.net/patterns/structural/decorator/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Extending behavior through subclassing leads to a class explosion when many optional, combinable features exist. Each combination requires a new subclass, and adding a feature retroactively forces changes to an ever-growing inheritance hierarchy that becomes brittle and hard to maintain.

## Solution

Define a component interface that both the base object and all decorators implement. Each decorator holds a reference to a component and delegates calls to it before or after applying its own behavior. Decorators can be stacked in any order at runtime, composing features without subclassing.
