# State

> Allows an object to alter its behavior when its internal state changes, appearing as if the object has changed its class.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/state/](https://codesociety.net/patterns/behavioral/state/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Objects that behave differently depending on their current state often accumulate large conditional blocks that check state flags on every method call. As new states are added, these conditionals grow, scatter related logic across the class, and make transitions hard to reason about.

## Solution

Represent each state as a separate class implementing a common State interface. The Context holds a reference to the current state object and delegates behavior to it. State transitions happen by replacing the current state object, concentrating each state's logic in one place and making new states trivially addable.
