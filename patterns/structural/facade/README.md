# Facade

> Provides a simplified, unified interface to a complex subsystem, hiding its internal complexity from clients.

**Category:** Structural  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/structural/facade/](https://codesociety.net/patterns/structural/facade/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Complex subsystems with many interdependent classes force clients to understand low-level internals, initialization order, and inter-object wiring. This tight coupling makes clients fragile when the subsystem evolves and raises the barrier to using the subsystem correctly.

## Solution

Create a Facade class that exposes a small, cohesive API for the most common use cases. The facade internally orchestrates the subsystem’s classes in the correct sequence. Clients use the facade; advanced users can still bypass it to access the subsystem directly when needed.
