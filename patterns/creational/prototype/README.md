# Prototype

> Creates new objects by cloning an existing instance, avoiding the cost of building from scratch.

**Category:** Creational  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/creational/prototype/](https://codesociety.net/patterns/creational/prototype/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Creating objects from scratch can be expensive when initialization involves database queries, network calls, or complex computation. Additionally, client code may need copies of objects whose concrete class it doesn’t know, making direct instantiation via `new` impossible.

## Solution

Declare a clone method on a prototype interface. Each concrete class implements clone to produce a copy of itself, including all internal state. Clients create new objects by asking an existing instance to clone itself, bypassing constructors and decoupling the client from concrete classes.
