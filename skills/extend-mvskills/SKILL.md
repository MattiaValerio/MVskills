---
name: extend-mvskills
description: Add or revise a technology specialization in mvskills and integrate it with setup, implementation and review.
---

Read README.md, docs/upstream.md and skills covering the responsibility. Identify the gap. Preserve Matt's workflows; technical rules belong in custom skills.
Invoke writing-for-agents through the host mechanism, or read its installed
entrypoint, before editing instructions. During an upstream import, read the actual
old/new skill diff and audit every custom entrypoint and applicable reference or
template for callers affected by that change. Record each custom skill's adaptation
or reason no change is needed; an unchanged upstream file does not prove its custom
callers remain compatible.

Agree on technology, profile and representative tasks. Split architecture, implementation and operations only when they have distinct callers. Docker runtime and provider deployment are separate responsibilities; record unresolved hosting, secrets and database decisions.

Create skills/<name>/SKILL.md with precise description, profile applicability, dependencies, official documentation and observable completion criteria. Link detailed references on relevant branches. Use pnpm and installed tool versions. Preserve existing choices; migrations have separate scope.

Register routing in setup-mvskills and dependencies in skills/dependencies.json. Pass the same profile to implementers and Standards reviewers. Invoke using host mechanisms or read entrypoints. Without workers/worktrees perform stages sequentially, keeping review axes separate.
Profile rules supplement the repo's standards sources. Keep orchestration owned by
implement/implement-spec: custom feature workflows reuse fetched tickets, agreed
seams and diagnosis evidence, and return deferred integration work for verification.
TDD owns seam agreement and red/green ordering; refactoring belongs to review.
State conditional dependencies at their branch so partial installations can report
the missing skill or use an explicit manual substitute instead of silently skipping it.

Run pnpm check, pnpm check:typing, installation smoke checks and discovery. Exercise a task in an isolated project and another with a different existing stack. Verify routing, checks and preservation of conventions. Record structural checks separately from agent execution in docs/validation.md. Document modified imported skills in docs/upstream.md. Reuse strict-typescript, api-contracts and deployment/frontend rules where applicable rather than duplicating them.
