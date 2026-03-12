# Thread Pool

> Maintain a fixed set of reusable worker threads that pick up tasks from a queue, avoiding the overhead of spawning a new thread per task.

**Category:** Concurrency  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/concurrency/thread-pool/](https://codesociety.net/patterns/concurrency/thread-pool/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Creating and destroying a thread for every incoming request is expensive — thread creation involves OS-level syscalls, stack allocation, and context-switch overhead. Under high load, unbounded thread creation exhausts system resources and degrades performance or causes crashes.

## Solution

Pre-allocate a fixed pool of worker threads at startup. Incoming tasks are placed in a work queue; idle threads pull tasks from the queue and execute them. When all threads are busy, tasks wait in the queue, providing natural load levelling and a hard cap on concurrency.
