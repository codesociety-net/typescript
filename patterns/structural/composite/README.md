# Composite

> Composes objects into tree structures to represent part-whole hierarchies, letting clients treat individual objects and compositions uniformly.

**Category:** Structural  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/structural/composite/](https://codesociety.net/patterns/structural/composite/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Applications that model hierarchical data—file systems, UI component trees, organizational charts—force client code to distinguish between leaf objects and container objects. This conditional logic is duplicated wherever the tree is traversed, making it hard to extend with new node types.

## Solution

Define a common Component interface implemented by both Leaf and Composite classes. Leaves represent end nodes and implement operations directly. Composites hold a collection of children (which can be leaves or other composites) and implement operations by delegating to their children recursively. Clients use the Component interface throughout.
