# Bridge

> Decouples an abstraction from its implementation so that the two can vary independently.

**Category:** Structural  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/structural/bridge/](https://codesociety.net/patterns/structural/bridge/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When a class has multiple independent dimensions of variation—such as shape and color, or UI control and rendering platform—subclassing each combination produces a Cartesian explosion of classes. Adding a new dimension multiplies the existing subclass count rather than adding to it linearly.

## Solution

Separate the abstraction and implementation into two distinct hierarchies connected by composition rather than inheritance. The abstraction holds a reference to an implementor and delegates implementation-specific work to it. Both sides can be extended independently, and new combinations require no new classes—only new leaves in each hierarchy.
