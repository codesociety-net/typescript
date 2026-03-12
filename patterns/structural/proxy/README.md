# Proxy

> Provides a surrogate or placeholder for another object to control access, add lazy initialization, caching, logging, or access control.

**Category:** Structural  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/structural/proxy/](https://codesociety.net/patterns/structural/proxy/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Sometimes direct access to an object is undesirable or impossible—the object may be expensive to create, live on a remote server, require access control enforcement, or need usage logging. Embedding these concerns directly into the object violates the Single Responsibility Principle.

## Solution

Create a Proxy class implementing the same interface as the real subject. The proxy holds a reference to the real object and intercepts calls before forwarding them, performing pre- or post-processing such as lazy initialization, authentication checks, caching, or logging. The client cannot distinguish the proxy from the real subject.
