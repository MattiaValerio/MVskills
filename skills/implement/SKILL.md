---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

## mvskills integration

Read docs/agents/stack.md when present and load routed skills for affected apps. For the default NestJS profile, load nestjs-architecture for implementation and Standards review, nestjs-feature for feature work, and nestjs-cli for generators. Pass profile paths and skill entrypoints to workers. Matt's workflow owns orchestration; technical skills specialize execution. TDD, when selected, owns seam agreement and red/green ordering; refactoring belongs to the review stage.

Use the host's skill invocation mechanism; if no Skill tool exists read installed SKILL.md. Without subagents/worktrees execute the same stages sequentially, retaining separate Standards and Spec findings.

For the full-stack mvskills profile load strict-typescript for every authored scope,
react-architecture, react-feature and design-system for frontend, api-contracts for public endpoints/client changes, and
docker-coolify for container/deployment changes. Carry these profile rules into review.
Pass fetched ticket contents/title, agreed test seams with their coverage limits and
any diagnosis evidence to the technical workflow. It implements within that scope;
this coordinator owns the final review. Profiles supplement the repository standards
discovered by code-review.


Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it through the configured tracker and
state its title before starting. If the reference is ambiguous, ask. When tracking is
explicitly disabled, use the supplied local spec or brief without external issue
operations; a bare reference still needs enough local context to resolve it.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
