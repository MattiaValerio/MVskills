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

Pending acceptance on Codex and Claude Code: empty folder → planned profile → NestJS scaffold → checks → feature → Standards/Spec review. Also verify preservation of an existing app with different persistence conventions. Frontend/deployment remain future extensions.

Without a Skill tool read installed SKILL.md. Without workers/worktrees perform stages sequentially and keep review axes separate. External/browser tasks require host capabilities; report unavailable capabilities accurately.
