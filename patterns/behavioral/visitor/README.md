# Visitor

> Lets you add new operations to an object structure without modifying the objects themselves, by separating the algorithm from the object structure it operates on.

**Category:** Behavioral  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/behavioral/visitor/](https://codesociety.net/patterns/behavioral/visitor/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When you need to perform many distinct, unrelated operations on a stable object hierarchy, adding each operation directly to every class pollutes those classes with logic that isn't their core responsibility. The hierarchy must be recompiled for every new operation, violating the Open/Closed Principle.

## Solution

Declare a Visitor interface with a visit method for each concrete element type in the hierarchy. Each element implements an accept method that calls the appropriate visit method on the visitor, passing itself. New operations are implemented as new Visitor classes without touching the element hierarchy at all.
