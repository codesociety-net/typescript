# Chain of Responsibility

> Passes a request along a chain of handlers, where each handler decides to process it or pass it to the next handler in the chain.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/chain-of-responsibility/](https://codesociety.net/patterns/behavioral/chain-of-responsibility/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When a request could be handled by multiple objects, hardcoding the handler creates tight coupling. Adding new handlers requires modifying existing code, violating the Open/Closed Principle. The sender shouldn’t need to know which object will ultimately handle the request.

## Solution

Create a chain of handler objects, each with a reference to the next handler. When a request arrives, the first handler either processes it or forwards it. This decouples senders from receivers and allows dynamic chain composition at runtime.
