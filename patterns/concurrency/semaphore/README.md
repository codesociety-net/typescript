# Semaphore

> Control access to a finite pool of resources by maintaining a counter that threads atomically increment (release) and decrement (acquire), blocking when the count reaches zero.

**Category:** Concurrency  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/concurrency/semaphore/](https://codesociety.net/patterns/concurrency/semaphore/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

A mutex permits exactly one thread into a critical section, but many resources exist in limited quantities greater than one — a database connection pool of ten, a rate limit of five concurrent API calls, or three available GPU slots. Using one mutex per resource instance is unwieldy and doesn't naturally express the pool abstraction.

## Solution

Initialise a semaphore with a count equal to the number of available resource units. Each acquire decrements the count; if it would go below zero, the calling thread blocks. Each release increments the count, waking a blocked thread if any are waiting. This elegantly generalises the mutex (a semaphore initialised to 1) to arbitrary resource counts.
