# Singleton

> Ensures a class has only one instance and provides a global point of access to it.

**Category:** Creational  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/creational/singleton/](https://codesociety.net/patterns/creational/singleton/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Some resources—database connections, configuration managers, logging services—should exist as a single shared instance. Creating multiple instances wastes memory, causes inconsistent state, and can lead to race conditions in concurrent environments.

## Solution

Make the constructor private and provide a static method that always returns the same instance. On first call, the instance is created; on subsequent calls, the existing instance is returned. Thread-safe variants use double-checked locking or language-level guarantees.
