# App-local root imports

Use `@/` for internal imports rooted at each app's src directory:

```ts
import type { InfrastructureError } from '@/shared/kernel/errors';
```

Prefer extensionless root imports for authored app code, including siblings. @ is
not the monorepo root: apps/api and apps/web each resolve it to their own src.
Other workspace packages are imported through declared package exports/names
such as @scope/api-client. Aliases do not bypass architecture boundaries.

## Compiler and tools

Declare paths in each app's tsconfig, not in the shared base, because relative
targets are resolved from the config declaring them. Example:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*", "./src/*.ts", "./src/*.tsx"] }
  }
}
```

The .ts/.tsx fallback targets allow extensionless aliases with NodeNext ESM.
Use explicit index paths rather than assuming directory resolution in Node ESM.
TypeScript paths only typecheck aliases; they do not rewrite emitted JavaScript.
Configure and test each resolver:

- Vite and Vitest: resolve.alias maps @ to an absolute app src path, e.g.
  fileURLToPath(new URL('./src', import.meta.url)) in the app config. Vitest must
  inherit this config or declare the same alias, including its integration config.
- Nest default compiler: verify its actual builder resolves aliases. For plain tsc
  output add tsc-alias after compilation with resolveFullPaths and .js extension
  resolution so native Node can execute emitted ESM. A proven bundler resolver is
  an alternative; never assume Nest CLI behavior is identical for all builders.
- Nest watch/dev: ensure pnpm dev starts alias-resolved output on every rebuild.
  For a tsc pipeline coordinate compiler watch, alias rewriting and runtime restart
  with a build-completion barrier; a parallel watcher can race unrewritten output.
  Prefer a supported Nest builder resolving aliases when available, validating
  decorator metadata, watch rebuilds and workspace externals.
- Scripts: tsx must use the correct app tsconfig explicitly when started at root;
  scripts outside src can use relative script imports or their own configured root.
- dependency-cruiser: load the app tsconfig and verify it analyzes aliased imports
  and still catches forbidden dependencies.

Test one runtime value import (a type-only import is erased), a sibling alias, and
an alias used by a script. Run dev, tests, production build then native Node/container
startup. Rebuild after changing the imported value to check watcher correctness.
Do not call the alias configured based solely on IDE/typecheck success.

Existing projects preserve their established alias until migration is selected.
Generated declarations and JavaScript may contain rewritten relative .js paths;
authored TypeScript uses @/. Tool configuration outside app src is a separate scope.

Sources: [TypeScript paths](https://www.typescriptlang.org/tsconfig/paths.html),
[Vite resolve.alias](https://vite.dev/config/shared-options.html#resolve-alias),
[tsc-alias](https://github.com/justkey007/tsc-alias).
