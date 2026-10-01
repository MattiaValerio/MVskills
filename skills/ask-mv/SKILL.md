---
name: ask-mv
description: Choose skills and compose a task-specific workflow when the user asks which skill to use, asks how to approach a task, or the agent is uncertain which available skills fit. Use for routing uncertainty; proceed directly when the applicable skill is already clear.
---

# Ask MV

Turn the task into the smallest useful path through available skills. Support both an explicit request for guidance and automatic routing during an already authorized task.

## Understand the starting point

Use the conversation and existing project instructions first. Identify the desired outcome, current artifacts (idea, spec, tickets, code, failing behavior or diff), unresolved decisions, and what counts as completion. Read relevant project configuration such as docs/agents/stack.md and docs/agents/issue-tracker.md when present.

Ask a focused question only when the answer changes the route: for example, whether the user wants a plan or execution, or whether an uncertain requirement needs stakeholder input. Otherwise state the assumption and build the route.

## Select the route

Consult the host's available skill names and descriptions. The map below describes this bundle's capabilities, not a guarantee that every skill is installed. Read selected entrypoints through the host's supported mechanism before relying on their procedures. Respect explicit-only invocation policies: present those skills as user-invoked steps unless the host permits loading them as references within authorized work.

| Starting situation | Useful route and branching condition |
| --- | --- |
| New project or adopting this bundle | setup-mvskills, then the route for the actual feature. Existing configuration can make setup unnecessary. |
| Idea with unresolved decisions | grill-with-docs for retained project decisions; grill-me for a focused interview. Use research for source-dependent questions, prototype for runnable or visual questions, or to-questionnaire for absent stakeholders. |
| Large effort whose decisions cannot yet be enumerated | wayfinder, then to-spec once the route is clear. |
| Settled requirements | to-spec when a durable specification helps; to-tickets when work needs separate units and dependencies. A bounded task can proceed directly to implementation. |
| Spec or ready tickets | implement for bounded work; implement-spec for a coordinated multi-ticket specification when its execution model is supported and authorized. |
| Broken behavior or performance regression | diagnosing-bugs, then the applicable implementation skills once evidence identifies the fix. |
| Incoming backlog or external requests | triage, then the route appropriate to each prepared item. |
| Architectural friction | improve-codebase-architecture to find candidates; codebase-design to design a chosen boundary. Implement the selected change at the appropriate scope. |
| Existing changes to assess | code-review against an explicit baseline and requirements. |
| Delivery or continuation | pr when writing a PR body; handoff when context must move to another session or agent; retro when session evidence warrants environment improvements. |
| Learning or extending agent instructions | teach for learning; writing-for-agents for agent-facing documents; extend-mvskills for a new technology specialization. |

Attach technical skills to the relevant phase rather than adding a separate planning stage for each:

- NestJS: nestjs-architecture for backend changes/review, nestjs-feature for use cases, nestjs-cli for scaffolding and CLI operations.
- React: react-vite for setup, react-architecture for structure/review, react-feature for user flows, design-system for visual work including prototypes.
- Shared profile: strict-typescript for authored TypeScript; api-contracts for public API/client changes; docker-coolify for infrastructure and deployment artifacts.
- Cross-cutting: domain-modeling for terminology and ADRs; tdd when test-first development is selected; wizard for steps only the human can perform.

Follow the project's selected stack. For other technologies, use matching available skills or ordinary implementation with existing conventions. Load dependencies declared by the selected skill, including any dependency map accessible in the bundle. This guide has no mandatory dependency on every skill it can recommend.

If a useful skill is unavailable, name the missing capability and either provide a concrete manual substitute or explain which step remains blocked. Installing skills, creating trackers, publishing artifacts and delegating work remain subject to the user's scope and host permissions. A route does not grant authorization for them.

## Present a usable workflow

Lead with the recommended route and why it fits the current starting point. Give a short ordered list; for each phase name the skill (or manual action), its task-specific purpose, and the observable output or exit condition. Include branches only for actual unresolved conditions. Distinguish the coordinating skill from technical skills it loads, so nested procedures are executed once.

Finish with the immediate next action and any material assumption or missing capability. Match the user's language and use invocation syntax supported by their host. For a simple task, recommending one skill or direct action is a complete workflow.

When the user requests guidance, deliver the workflow. When routing an already authorized execution task, explain the route briefly and continue with the first permitted step; ask only for decisions or authorization genuinely required by that step. Revisit the remaining route when new evidence changes it, retaining completed work and settled choices.
