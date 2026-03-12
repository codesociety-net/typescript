# Observer

> Defines a one-to-many dependency so that when one object changes state, all its dependents are notified and updated automatically.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/observer/](https://codesociety.net/patterns/behavioral/observer/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When one object's state change requires updating an unknown number of other objects, directly coupling the subject to its dependents creates a brittle web of dependencies. Adding or removing dependents requires modifying the subject, and the subject must know too much about its observers to notify them.

## Solution

Define a Subject that maintains a list of Observer interfaces and calls their update method when its state changes. Observers register and deregister themselves at runtime. The subject knows nothing about concrete observers—only that they implement the Observer interface—keeping both sides loosely coupled.
