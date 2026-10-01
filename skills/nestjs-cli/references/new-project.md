# Scaffolding a new NestJS app in the Turborepo

## 1. Generate

From the monorepo root:

```bash
pnpm dlx @nestjs/cli@latest new <app-name> \
  --directory apps/<app-name> \
  --package-manager pnpm \
  --skip-git \
  --dry-run
```

Read the output, then rerun without `--dry-run`. Notes:

- `--skip-git`: the monorepo already is a git repo.
- Check command --help before using version-specific flags.
- Inspect generated module format, dependencies and scripts; configure Vitest/Biome
  explicitly when selected rather than assuming generator defaults.
- For an empty monorepo establish a private root package, pnpm-workspace.yaml
  (apps/* and packages/*) and Turborepo tasks first. Preserve existing workspace
  configuration. For standalone apps use the chosen app directory.

## 2. Align with the monorepo conventions

1. **Package name**: in `apps/<app-name>/package.json` set `"name": "@<scope>/<app-name>"`
   (match the other workspaces) and `"private": true`.
2. **Biome instead of oxlint**: remove the oxlint config file and its devDependency and
   scripts; the app inherits the root `biome.json` (add a local one only for overrides).
   Replace the `lint`/`format` scripts with `biome check .` / `biome check --write .`.
3. **Prettier**: remove `.prettierrc` and Prettier devDependencies if present.
4. **TypeScript**: make `tsconfig.json` extend the shared base config of the repo if one
   exists; keep `experimentalDecorators` and `emitDecoratorMetadata` enabled.
5. **Remove the sample**: delete `app.controller.ts`, `app.service.ts` and their spec,
   and remove them from `app.module.ts`.
6. **Scripts** — make sure these exist so Turborepo pipelines can call them:

```json
{
  "dev": "nest start --watch --env-file .env",
  "build": "nest build",
  "start": "node dist/main.js",
  "typecheck": "tsc --noEmit",
  "lint": "biome check .",
  "test": "vitest run",
  "test:e2e": "vitest run --config vitest.e2e.config.ts",
  "check:arch": "depcruise src --config .dependency-cruiser.cjs"
}
```

7. **turbo.json**: if the root pipeline doesn't already cover `typecheck`, `lint`, `test`,
   `check:arch`, add them.

## 3. Lay down the architecture

Follow "Bootstrapping a new project" in the `nestjs-architecture` skill (shared kernel,
http helpers, database module, dependency-cruiser config, app module), then create the
first context with `pnpm exec nest g mo modules/<context> --no-spec`.

## 4. Verify

```bash
pnpm --filter @<scope>/<app-name> typecheck
pnpm --filter @<scope>/<app-name> lint
pnpm --filter @<scope>/<app-name> check:arch
pnpm --filter @<scope>/<app-name> test
```

All four must pass on the empty skeleton before any feature work starts.
