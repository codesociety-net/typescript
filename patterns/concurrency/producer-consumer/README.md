# Producer-Consumer

> Decouple data production from data consumption using a shared buffer, allowing each side to operate at its own pace.

**Category:** Concurrency  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/concurrency/producer-consumer/](https://codesociety.net/patterns/concurrency/producer-consumer/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When a producer generates data faster than a consumer can process it (or vice versa), one side blocks the other, creating tight coupling and poor throughput. Directly coupling producer and consumer threads forces them to operate at the slower party's speed, wasting CPU cycles and introducing fragile synchronization logic.

## Solution

Introduce a bounded queue between producers and consumers. Producers enqueue items whenever space is available; consumers dequeue and process items independently. The buffer absorbs speed mismatches, and blocking semantics on full/empty conditions provide natural back-pressure without busy-waiting.
