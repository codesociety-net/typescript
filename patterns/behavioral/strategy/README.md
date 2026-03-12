# Strategy

> Defines a family of algorithms, encapsulates each one, and makes them interchangeable so the algorithm can vary independently from the clients that use it.

**Category:** Behavioral  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/behavioral/strategy/](https://codesociety.net/patterns/behavioral/strategy/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When a class must support multiple variations of an algorithm, embedding all variants via conditionals bloats the class and violates the Open/Closed Principle. Adding a new algorithm requires modifying the class, and the algorithm cannot be reused across different contexts.

## Solution

Extract each algorithm into its own class implementing a common Strategy interface. The Context holds a reference to a Strategy and delegates the work to it. At runtime—or via configuration—the concrete strategy can be swapped without touching the context or any other strategy.
