# Builder

> Separates the construction of a complex object from its representation, allowing the same construction process to produce different results.

**Category:** Creational  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/creational/builder/](https://codesociety.net/patterns/creational/builder/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Complex objects with many optional parameters lead to telescoping constructors or massive configuration objects. The construction order may matter, intermediate states can be invalid, and the client is forced to understand every detail of the object’s internals.

## Solution

Extract the construction logic into a separate Builder class that exposes fluent, step-by-step methods. An optional Director can orchestrate common build sequences. The client calls only the steps it needs, and the builder assembles a valid, immutable product at the end.
