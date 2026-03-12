# Adapter

> Converts the interface of a class into another interface that clients expect, allowing incompatible interfaces to work together.

**Category:** Structural  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/structural/adapter/](https://codesociety.net/patterns/structural/adapter/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Third-party libraries, legacy systems, and external APIs rarely match the interface your application expects. Rewriting the external code is often impossible, and scattering conversion logic throughout the codebase creates fragile, duplicated coupling to specific implementations.

## Solution

Create an Adapter class that wraps the incompatible object and exposes the interface the client expects. The client talks to the adapter, which translates each call into the corresponding method on the adaptee. The adaptee never changes, and the client never knows an adapter exists.
