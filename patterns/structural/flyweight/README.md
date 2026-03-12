# Flyweight

> Minimizes memory usage by sharing fine-grained objects that represent repeated data, storing intrinsic state once and passing extrinsic state at call time.

**Category:** Structural  
**Difficulty:** advanced  
**Site:** [codesociety.net/patterns/structural/flyweight/](https://codesociety.net/patterns/structural/flyweight/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Applications that create large numbers of similar objects—characters in a text editor, particles in a game, map tiles—consume excessive memory because each instance stores data that is identical across many objects. At scale this can exhaust available memory and degrade performance.

## Solution

Split object state into intrinsic (shared, immutable) and extrinsic (unique per use, passed as context). Store a single shared Flyweight instance per unique intrinsic state in a factory/cache. Clients pass the extrinsic state as method arguments at runtime. The dramatic reduction in live instances slashes memory consumption.
