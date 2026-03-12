# Command

> Encapsulates a request as an object, allowing you to parameterize clients, queue or log requests, and support undoable operations.

**Category:** Behavioral  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/behavioral/command/](https://codesociety.net/patterns/behavioral/command/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When you need to issue requests to objects without knowing anything about the operation being requested or the receiver, direct method calls couple the invoker to the receiver. This makes it impossible to queue requests, log them for auditing, or reverse them for undo functionality.

## Solution

Wrap each request in a Command object that bundles the receiver, the action, and any parameters. An Invoker holds and executes commands through a uniform execute interface without knowing what each command does. Commands can be stored in a history stack, serialized to a queue, or replayed.
