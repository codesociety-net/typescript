# Iterator

> Provides a way to sequentially access elements of a collection without exposing its underlying representation.

**Category:** Behavioral  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/behavioral/iterator/](https://codesociety.net/patterns/behavioral/iterator/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Different collection types—arrays, linked lists, trees, graphs—each have their own traversal logic. Client code that directly traverses a collection becomes tightly coupled to its internal structure, making it impossible to swap collection types or support multiple simultaneous traversals without breaking clients.

## Solution

Extract the traversal logic into an Iterator object that implements a common interface with methods like hasNext and next. The collection provides a factory method that creates the appropriate iterator for its structure. Client code traverses any collection uniformly through the iterator interface, ignorant of the underlying data structure.
