# Factory Method

> Defines an interface for creating an object but lets subclasses decide which class to instantiate. Defers instantiation to subclasses.

**Category:** Creational  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/creational/factory-method/](https://codesociety.net/patterns/creational/factory-method/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

When code depends on concrete classes to create objects, adding a new type forces changes everywhere instantiation occurs. This scatters creation logic, violates the Open/Closed Principle, and tightly couples client code to specific implementations.

## Solution

Declare a factory method in a base class that returns a product interface. Each subclass overrides the factory method to produce a different concrete product. Client code works only with the product interface, so new types can be introduced by adding a new subclass without modifying existing code.
