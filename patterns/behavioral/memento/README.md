# Memento

> Captures and externalizes an object's internal state without violating encapsulation, allowing the object to be restored to that state later.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/memento/](https://codesociety.net/patterns/behavioral/memento/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Implementing undo functionality or saving checkpoints requires storing an object's internal state externally. Exposing the object's fields to a caretaker violates encapsulation and couples the caretaker to the originator's internal implementation, making future refactoring fragile.

## Solution

Have the Originator produce a Memento object containing a private snapshot of its state. The Caretaker stores mementos without inspecting their contents—it treats them as opaque tokens. To restore, the caretaker passes a memento back to the originator, which reads its own state from it, preserving encapsulation completely.
