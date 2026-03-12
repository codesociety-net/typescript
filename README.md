# CodeSociety — TypeScript Design Patterns

[![CI](https://github.com/codesociety-net/typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/codesociety-net/typescript/actions/workflows/ci.yml)

Design pattern implementations in TypeScript — verified, tested, benchmarked.

## Quick Start

```bash
git clone https://github.com/codesociety-net/typescript.git
cd typescript
npm install
npm test          # Run all tests
npm run typecheck  # Type checking
npm run benchmark  # Run benchmarks
```

## Patterns

| Pattern | Category | Difficulty | Conceptual | Production | Site |
|---------|----------|------------|:----------:|:----------:|:----:|
| [Evaluator-Optimizer Agent](patterns/agentic/evaluator-optimizer/) | Agentic AI | intermediate | [✓](patterns/agentic/evaluator-optimizer/conceptual.ts) | [✓](patterns/agentic/evaluator-optimizer/production.ts) | [Learn](https://codesociety.net/patterns/agentic/evaluator-optimizer/) |
| [ReAct Agent](patterns/agentic/react-agent/) | Agentic AI | advanced | [✓](patterns/agentic/react-agent/conceptual.ts) | [✓](patterns/agentic/react-agent/production.ts) | [Learn](https://codesociety.net/patterns/agentic/react-agent/) |
| [Tool Use Agent](patterns/agentic/tool-use/) | Agentic AI | intermediate | [✓](patterns/agentic/tool-use/conceptual.ts) | [✓](patterns/agentic/tool-use/production.ts) | [Learn](https://codesociety.net/patterns/agentic/tool-use/) |
| [Plan-and-Execute](patterns/agentic/plan-and-execute/) | Agentic AI | advanced | [✓](patterns/agentic/plan-and-execute/conceptual.ts) | [✓](patterns/agentic/plan-and-execute/production.ts) | [Learn](https://codesociety.net/patterns/agentic/plan-and-execute/) |
| [Multi-Agent Orchestration](patterns/agentic/multi-agent/) | Agentic AI | advanced | [✓](patterns/agentic/multi-agent/conceptual.ts) | [✓](patterns/agentic/multi-agent/production.ts) | [Learn](https://codesociety.net/patterns/agentic/multi-agent/) |
| [Singleton](patterns/creational/singleton/) | Creational | beginner | [✓](patterns/creational/singleton/conceptual.ts) | [✓](patterns/creational/singleton/production.ts) | [Learn](https://codesociety.net/patterns/creational/singleton/) |
| [Factory Method](patterns/creational/factory-method/) | Creational | intermediate | [✓](patterns/creational/factory-method/conceptual.ts) | [✓](patterns/creational/factory-method/production.ts) | [Learn](https://codesociety.net/patterns/creational/factory-method/) |
| [Abstract Factory](patterns/creational/abstract-factory/) | Creational | intermediate | [✓](patterns/creational/abstract-factory/conceptual.ts) | [✓](patterns/creational/abstract-factory/production.ts) | [Learn](https://codesociety.net/patterns/creational/abstract-factory/) |
| [Builder](patterns/creational/builder/) | Creational | beginner | [✓](patterns/creational/builder/conceptual.ts) | [✓](patterns/creational/builder/production.ts) | [Learn](https://codesociety.net/patterns/creational/builder/) |
| [Prototype](patterns/creational/prototype/) | Creational | intermediate | [✓](patterns/creational/prototype/conceptual.ts) | [✓](patterns/creational/prototype/production.ts) | [Learn](https://codesociety.net/patterns/creational/prototype/) |
| [Chain of Responsibility](patterns/behavioral/chain-of-responsibility/) | Behavioral | intermediate | [✓](patterns/behavioral/chain-of-responsibility/conceptual.ts) | [✓](patterns/behavioral/chain-of-responsibility/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/chain-of-responsibility/) |
| [Observer](patterns/behavioral/observer/) | Behavioral | intermediate | [✓](patterns/behavioral/observer/conceptual.ts) | [✓](patterns/behavioral/observer/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/observer/) |
| [Strategy](patterns/behavioral/strategy/) | Behavioral | beginner | [✓](patterns/behavioral/strategy/conceptual.ts) | [✓](patterns/behavioral/strategy/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/strategy/) |
| [Command](patterns/behavioral/command/) | Behavioral | intermediate | [✓](patterns/behavioral/command/conceptual.ts) | [✓](patterns/behavioral/command/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/command/) |
| [State](patterns/behavioral/state/) | Behavioral | intermediate | [✓](patterns/behavioral/state/conceptual.ts) | [✓](patterns/behavioral/state/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/state/) |
| [Template Method](patterns/behavioral/template-method/) | Behavioral | beginner | [✓](patterns/behavioral/template-method/conceptual.ts) | [✓](patterns/behavioral/template-method/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/template-method/) |
| [Iterator](patterns/behavioral/iterator/) | Behavioral | beginner | [✓](patterns/behavioral/iterator/conceptual.ts) | [✓](patterns/behavioral/iterator/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/iterator/) |
| [Mediator](patterns/behavioral/mediator/) | Behavioral | intermediate | [✓](patterns/behavioral/mediator/conceptual.ts) | [✓](patterns/behavioral/mediator/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/mediator/) |
| [Memento](patterns/behavioral/memento/) | Behavioral | intermediate | [✓](patterns/behavioral/memento/conceptual.ts) | [✓](patterns/behavioral/memento/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/memento/) |
| [Visitor](patterns/behavioral/visitor/) | Behavioral | advanced | [✓](patterns/behavioral/visitor/conceptual.ts) | [✓](patterns/behavioral/visitor/production.ts) | [Learn](https://codesociety.net/patterns/behavioral/visitor/) |
| [Adapter](patterns/structural/adapter/) | Structural | beginner | [✓](patterns/structural/adapter/conceptual.ts) | [✓](patterns/structural/adapter/production.ts) | [Learn](https://codesociety.net/patterns/structural/adapter/) |
| [Decorator](patterns/structural/decorator/) | Structural | intermediate | [✓](patterns/structural/decorator/conceptual.ts) | [✓](patterns/structural/decorator/production.ts) | [Learn](https://codesociety.net/patterns/structural/decorator/) |
| [Facade](patterns/structural/facade/) | Structural | beginner | [✓](patterns/structural/facade/conceptual.ts) | [✓](patterns/structural/facade/production.ts) | [Learn](https://codesociety.net/patterns/structural/facade/) |
| [Proxy](patterns/structural/proxy/) | Structural | intermediate | [✓](patterns/structural/proxy/conceptual.ts) | [✓](patterns/structural/proxy/production.ts) | [Learn](https://codesociety.net/patterns/structural/proxy/) |
| [Composite](patterns/structural/composite/) | Structural | intermediate | [✓](patterns/structural/composite/conceptual.ts) | [✓](patterns/structural/composite/production.ts) | [Learn](https://codesociety.net/patterns/structural/composite/) |
| [Bridge](patterns/structural/bridge/) | Structural | advanced | [✓](patterns/structural/bridge/conceptual.ts) | [✓](patterns/structural/bridge/production.ts) | [Learn](https://codesociety.net/patterns/structural/bridge/) |
| [Flyweight](patterns/structural/flyweight/) | Structural | advanced | [✓](patterns/structural/flyweight/conceptual.ts) | [✓](patterns/structural/flyweight/production.ts) | [Learn](https://codesociety.net/patterns/structural/flyweight/) |
| [Producer-Consumer](patterns/concurrency/producer-consumer/) | Concurrency | intermediate | [✓](patterns/concurrency/producer-consumer/conceptual.ts) | [✓](patterns/concurrency/producer-consumer/production.ts) | [Learn](https://codesociety.net/patterns/concurrency/producer-consumer/) |
| [Thread Pool](patterns/concurrency/thread-pool/) | Concurrency | intermediate | [✓](patterns/concurrency/thread-pool/conceptual.ts) | [✓](patterns/concurrency/thread-pool/production.ts) | [Learn](https://codesociety.net/patterns/concurrency/thread-pool/) |
| [Mutex / Lock](patterns/concurrency/mutex/) | Concurrency | beginner | [✓](patterns/concurrency/mutex/conceptual.ts) | [✓](patterns/concurrency/mutex/production.ts) | [Learn](https://codesociety.net/patterns/concurrency/mutex/) |
| [Semaphore](patterns/concurrency/semaphore/) | Concurrency | intermediate | [✓](patterns/concurrency/semaphore/conceptual.ts) | [✓](patterns/concurrency/semaphore/production.ts) | [Learn](https://codesociety.net/patterns/concurrency/semaphore/) |

## Structure

```
patterns/
├── creational/     # 5 patterns
├── structural/     # 7 patterns
├── behavioral/     # 10 patterns
├── concurrency/    # 4 patterns
└── agentic/        # 5 patterns
```

Each pattern folder contains:
- `conceptual.ts` — Minimal implementation showing the pattern's core idea
- `production.ts` — Real-world implementation with error handling and best practices
- `conceptual.test.ts` / `production.test.ts` — Vitest tests
- `README.md` — Pattern description and links

## License

MIT
