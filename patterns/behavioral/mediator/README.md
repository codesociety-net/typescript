# Mediator

> Defines an object that encapsulates how a set of objects interact, promoting loose coupling by keeping objects from referring to each other explicitly.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/mediator/](https://codesociety.net/patterns/behavioral/mediator/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When many objects communicate directly with each other, the system becomes a tangled web of dependencies where every object must know about every other. This makes adding, removing, or changing any single participant cascade into changes across the entire network of objects.

## Solution

Introduce a mediator object that centralizes all inter-object communication. Each participant (colleague) holds a reference only to the mediator and sends all messages through it. The mediator knows all colleagues and orchestrates their interactions, reducing direct dependencies from O(n²) to O(n).
