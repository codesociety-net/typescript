# Mutex / Lock

> Guarantee that only one thread at a time can access a shared resource by requiring threads to acquire an exclusive lock before proceeding.

**Category:** Concurrency  
**Difficulty:** beginner  
**Site:** [codesociety.net/patterns/concurrency/mutex/](https://codesociety.net/patterns/concurrency/mutex/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When multiple threads read and write shared state concurrently without coordination, race conditions corrupt data in ways that are non-deterministic and nearly impossible to reproduce. Even a simple counter increment is not atomic at the machine-instruction level, making unsynchronised shared mutation dangerous.

## Solution

Protect every access to shared state with a mutual-exclusion lock. A thread must acquire the mutex before entering the critical section; all other threads block at the acquire call until the lock is released. This serialises access to the shared resource while allowing threads to run concurrently everywhere else.
