# Abstract Factory

> Provides an interface for creating families of related objects without specifying their concrete classes.

**Category:** Creational  
**Difficulty:** intermediate  
**Site:** [codesociety.net/patterns/creational/abstract-factory/](https://codesociety.net/patterns/creational/abstract-factory/)

## Implementations

- [`conceptual.ts`](./conceptual.ts)
- [`production.ts`](./production.ts)

## Problem

Applications often need to create groups of related objects that must be used together (e.g., UI components for a specific OS theme). Creating these objects independently risks mixing incompatible products and scatters creation logic throughout the codebase.

## Solution

Define an abstract factory interface with a creation method for each product in the family. Concrete factories implement this interface to produce products that belong together. Client code receives a factory and calls its methods, never knowing which concrete classes are instantiated.
