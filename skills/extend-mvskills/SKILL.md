---
name: extend-mvskills
description: Add or revise a technology specialization in mvskills and integrate it with setup, implementation and review.
---

Read README.md, docs/upstream.md and skills covering the responsibility. Identify the gap. Preserve Matt's workflows; technical rules belong in custom skills.

Agree on technology, profile and representative tasks. Split architecture, implementation and operations only when they have distinct callers. Docker runtime and provider deployment are separate responsibilities; record unresolved hosting, secrets and database decisions.

Create skills/<name>/SKILL.md with precise description, profile applicability, dependencies, official documentation and observable completion criteria. Link detailed references on relevant branches. Use pnpm and installed tool versions. Preserve existing choices; migrations have separate scope.

Register routing in setup-mvskills and dependencies in skills/dependencies.json. Pass the same profile to implementers and Standards reviewers. Invoke using host mechanisms or read entrypoints. Without workers/worktrees perform stages sequentially, keeping review axes separate.

Run pnpm check and installer discovery. Exercise a task in an isolated project and another with a different existing stack. Verify routing, checks and preservation of conventions. Record structural checks separately from agent execution in docs/validation.md. Document modified imported skills in docs/upstream.md.
