# Validation

Structural and installer smoke checks establish discovery/installation, not successful agent execution.

2026-10-01: pnpm check passed for 30 skill entrypoints. Installer discovery found
30 skills. Local copied installation to Codex and Claude Code succeeded in
.tmp/install-smoke; installed implementation entrypoints contain custom integration
blocks and NestJS CLI contains the official documentation pointers.

`pnpm check:install` verifies automatic creation of the destination skills-lock.json,
selected skill entries, local source metadata and hashes, preservation of existing
entries during another installation, and exact customized implementation copies for
Codex and Claude Code. GitHub-source installation awaits publication; the local test
does not claim to verify remote source metadata.

After consolidating setup there are 29 discoverable skills. Installation smoke checks
also verify the embedded Matt setup and GitHub template ship with setup-mvskills,
without installing a separate setup-matt-pocock-skills entrypoint.

Full-stack extension: 33 discoverable skills. pnpm check covers script/helper
typechecking, the explicit-any lint rule, skill frontmatter, bundled Markdown links
and dependency availability. pnpm check:typing runs red/green fixtures against the
actual compiler and linter: implicit any fails TS7006, explicit any fails noExplicitAny,
and unknown passes. pnpm check:install verifies exact installed full-stack skill
entrypoints and embedded setup resources for Codex and Claude Code.

Pending behavioral acceptance on both agents: setup in an empty folder with no
tracker and with a private tracking repo; backend-only/frontend-only profiles;
full-stack scaffold with usable env; real DB migration/codegen; offline OpenAPI
generation and negative drift check; pnpm dev app-only boot; browser→API→DB smoke;
production images and Compose routing; feature and Standards/Spec review. Also
verify preservation of an existing app with different persistence conventions and
rerunning setup without overwriting env or profile choices. These checks are
requirements in the skills, not claims that apps were generated during this change.

Alias validation: pnpm check:aliases compiles isolated strict NodeNext fixtures in
ESM and CommonJS with extensionless @/ value/type imports. Native Node fails before
tsc-alias rewriting and runs successfully afterwards. This verifies the plain tsc
production pipeline; full Nest dev/watch, Vite/Vitest and container alias acceptance
remain requirements to exercise in generated projects. Templates and annotated
NestJS examples now use app-local @/ imports.

Without a Skill tool read installed SKILL.md. Without workers/worktrees perform stages sequentially and keep review axes separate. External/browser tasks require host capabilities; report unavailable capabilities accurately.
