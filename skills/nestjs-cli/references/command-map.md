# NestJS CLI — detailed command map

Syntax: `pnpm exec nest generate <schematic> <path/name> [options]` (`g` for short).
The `<path/name>` is relative to `sourceRoot` (normally `src/`). The last segment is the
element name; the CLI kebab-cases file names and PascalCases class names.

## Schematics and aliases

| Schematic | Alias | Used in this architecture for |
|---|---|---|
| `module` | `mo` | one per bounded context |
| `controller` | `co` | HTTP entry point of a slice |
| `gateway` | `ga` | WebSocket entry point of a slice |
| `resolver` | `r` | GraphQL entry point of a slice |
| `guard` | `gu` | auth/authorisation, in `shared/http/guards/` (or context-level if context-specific) |
| `interceptor` | `itc` | cross-cutting HTTP behaviour |
| `filter` | `f` | exception filters (rare: errors normally go through `unwrapOrThrowHttp`) |
| `pipe` | `pi` | custom transformation (validation is already global via `ZodValidationPipe`) |
| `middleware` | `mi` | request-level concerns (correlation id, raw body) |
| `decorator` | `d` | custom param/metadata decorators |
| `class` | `cl` | not used — naming doesn't fit `*.use-case.ts`; use templates |
| `interface` | `itf` | not used — ports are abstract classes |
| `provider` | `pr` | not used — templates are clearer |
| `service` | `s` | **forbidden** (see SKILL.md) |
| `resource` | `res` | **forbidden** |
| `app` / `library` | — / `lib` | **forbidden** in Turborepo projects |

## Useful options

| Option | Meaning | Policy |
|---|---|---|
| `--dry-run`, `-d` | print planned changes only | always first |
| `--no-spec` | no spec file | always |
| `--flat` | no wrapper folder | shared single-file artefacts |
| `--skip-import` | don't register in nearest module | parallel worktrees |
| `--project`, `-p` | target project in a Nest monorepo | only if `nest-cli.json` has `monorepo: true` |
| `--format` | Prettier formatting | never (use Biome) |
| `--collection`, `-c` | use another schematics collection | for a custom slice schematic, if one exists in the project |

## How module registration works

`generate` walks up from the target folder and registers the element in the **first**
`*.module.ts` it finds. For slices that is `<context>.module.ts` — correct. Watch out for:

- Generating a controller before the context module exists → it gets registered in
  `AppModule`. Always create the context module first.
- A stray module file deeper in the tree (e.g. someone created `features/x/x.module.ts`) →
  the CLI registers there. Slices must not have their own modules; delete it.
- The dry run shows `UPDATE src/…/<something>.module.ts` — check it's the right module
  before running for real.

## Post-generation fixups

### Slice controller

Generated:

```ts
@Controller('place-order')
export class PlaceOrderController {}
```

Change to:

```ts
@Controller('orders')                 // resource route, shared by the context's slices
export class PlaceOrderController {
  constructor(private readonly placeOrder: PlaceOrderUseCase) {}

  @Post()                             // verb + sub-path for this use case
  async handle(@Body() body: PlaceOrderDto): Promise<PlaceOrderResponseDto> {
    return unwrapOrThrowHttp(await this.placeOrder.execute(body), orderHttpErrors);
  }
}
```

Then register the use case in the module providers (the CLI only registered the controller).

### Gateway / resolver

Same idea: one handler that calls the use case and maps the Result. The CLI adds the
gateway/resolver to `providers`; add the use case next to it.

### Guards, interceptors, filters

The CLI does not register them anywhere. Apply them explicitly: `@UseGuards()` on the
slice controller, or globally via `APP_GUARD` / `APP_INTERCEPTOR` / `APP_FILTER` providers
in `app.module.ts`. Global registration through providers is preferred over
`app.useGlobal*()` in `main.ts` because it supports DI.

### Decorators

When using `Reflector.createDecorator<T>()`, read metadata in guards with
`this.reflector.get(MyDecorator, context.getHandler())` — no string keys.

## After every generation

```bash
pnpm biome check --write <the files listed as CREATE/UPDATE>
```

## Troubleshooting

- **"Prompt" appears / command hangs** → a required argument is missing; cancel and pass it.
- **Wrong file name suffix** → you used the wrong schematic; delete the file and regenerate
  (also remove its registration from the module).
- **`Cannot find module '@nestjs/schematics'`** → `pnpm add -D @nestjs/schematics`.
- **Alias errors after generation** → normalize generated app imports to @/src-root
  paths without source extensions and verify the selected builder, watch runtime and
  tests resolve them. TypeScript paths alone do not make native Node understand @/.
