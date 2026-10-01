# mvskills

Matt Pocock's engineering workflows plus custom technology profiles. Initial backend: NestJS, vertical slices, Kysely, neverthrow, nestjs-zod, Vitest, Biome and pnpm. Frontend and Docker come next.

## Install

After publishing this repository on GitHub:

```sh
pnpm dlx skills@latest add mattiavalerio/mvskills
```

Select skills and agent targets. Use `--all` for all skills and installer-supported agents. For a local checkout replace the source with its absolute path. Avoid installing Matt's bundle alongside this one: names overlap. Selective installation does not automatically resolve [dependencies](skills/dependencies.json).

Run `setup-mvskills` in your target project using your agent's invocation syntax. Empty folders get planned profiles; rerun after scaffolding to verify apps. Matt's setup configures issue tracking/domain documents; custom setup configures technology routing. Request scaffolding or feature implementation afterwards.

## Maintain

`skills/` is distributable source. `.agents/skills/` retains the original installed workspace copy; edit skills/. Use extend-mvskills to add specializations. See [upstream](docs/upstream.md) and [validation](docs/validation.md).

```sh
pnpm install
pnpm check
pnpm skills:list
```

Installer compatibility differs from verified agent behavior. No native plugin or npm publication is required. Upstream content is MIT licensed by Matt Pocock; see LICENSE. This is an independent customized distribution.
