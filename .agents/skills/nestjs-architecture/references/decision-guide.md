# Where does this go? — decision guide

Work through the questions in order; stop at the first "yes".

**Is it a business rule or invariant (true regardless of HTTP, DB, framework)?**
→ `domain/`. Example: "an order can't be cancelled after shipping".

**Is it a contract for something outside the process (DB, API, queue, clock, storage)?**
→ a port in `ports/` (shared in the context) or slice-local if only one slice uses it;
the implementation in `infrastructure/`.

**Is it orchestration of one user/system action?**
→ a use case in `features/<action>/`.

**Is it about the HTTP shape (route, status, headers, input schema, response schema)?**
→ the slice's controller and DTO.

**Is it needed by several contexts and pure (types, helpers, base errors)?**
→ `shared/kernel/`. Keep it tiny — `shared/` is where architectures go to rot. If it
contains business meaning, it belongs to a context.

**Is it cross-cutting technical behaviour (auth guard, logging interceptor, global pipe)?**
→ `shared/http/` or `shared/infrastructure/`, generated with the CLI, registered in
`app.module.ts` or `main.ts`.

## Recurring dilemmas

**Two slices need the same validation/calculation.** Move it to `domain/` if it's a
business rule; otherwise accept small duplication. Never import across slices.

**Context A needs data from context B.** B exposes a facade port in `B/public/`
(`abstract class CustomerDirectory { findById(...) }`), implemented inside B and exported
by `BModule`. A imports `BModule` and injects the facade. A never queries B's tables.

**Something should happen after an action in another context** (send email after
order placed). Prefer events: the use case publishes a domain event through an
`EventPublisher` port; the reacting context has a slice (`features/on-order-placed/`)
with an event handler instead of a controller. Use `@nestjs/event-emitter` in-process or
BullMQ for durability.

**Background job / scheduled task.** It's a slice like any other; the entry point is a
BullMQ processor or `@Cron()` handler instead of a controller. The use case stays
identical — that's the payoff of the architecture.

**A "manage everything" admin CRUD.** Still one slice per action, but if it's really
just table editing with no rules, a single slice with a query port and no domain model
is acceptable. Say so explicitly in the slice rather than inventing fake domain logic.

**GraphQL / WebSocket / microservice transport.** Only the entry point changes (resolver,
gateway, `@MessagePattern` handler in the slice). Use case, domain, ports unchanged.

**Too many contexts or too few?** Start with fewer, larger contexts. Split when two
groups of slices stop sharing domain types.
