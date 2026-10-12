# Upstream maintenance

Source: https://github.com/mattpocock/skills. The 25 imported skills were installed before packaging. Original paths/hashes are in [upstream/installed-skills-lock.json](upstream/installed-skills-lock.json).

On 2026-10-12 every file in those 25 original skill directories was compared with
upstream commit `d81f3a183412e71a5b1e84ca21bc1a35eea03a60` (observed 2026-10-01).
All contents and file inventories match after normalizing CRLF/LF. This establishes
the original snapshot's source baseline; it does not identify the installation date.

Original copies remain in .agents/skills/. Distribution lives in skills/. Integration edits: implement, implement-spec, code-review and setup-matt-pocock-skills load profiles or custom setup; fallback blocks address unavailable invocation/parallelism.

Import updates from a separate checkout at an explicit commit. Compare the latest
imported upstream commit below with the new commit, apply reviewed changes preserving
integration blocks, review dependencies/licenses, run checks, then record the commit
and modified names here. Preserve custom skills during imports. The original
`.agents/skills/` snapshot and its installation lockfiles remain historical evidence;
they are not the baseline for subsequent imports.

Root skills-lock.json describes the installed workspace, not the published bundle; discovery reads skills/.

Setup consolidation: the imported setup is now bundled under
skills/setup-mvskills/references/matt-setup/setup.md with its seed templates.
It is no longer a separately discoverable skill. Adaptations select an explicit
GitHub tracking repository by default; original setup remains in .agents/skills/.
wayfinder, code-review, implement-spec, triage, to-spec and to-tickets now point to
setup-mvskills when tracker configuration is missing. Wayfinder's implicit local
tracker fallback was replaced with the GitHub-first setup.

Full-stack routing adds strict-typescript, react-vite, api-contracts and docker-coolify
to custom profile dispatch in implement, implement-spec and code-review. The
bundled setup now offers no tracking and private repositories explicitly. Tracker
consumers must respect disabled tracking rather than silently publishing. Upstream
originals remain preserved; these local integration edits require review on import.

## Import 2026-10-12

Latest imported upstream commit:
[`49dd158d1076134a641b33efb035946536778336`](https://github.com/mattpocock/skills/commit/49dd158d1076134a641b33efb035946536778336),
dated 2026-10-09. Latest published upstream tag at the time of inspection:
[`v1.3.1`](https://github.com/mattpocock/skills/releases/tag/v1.3.1), dated 2026-10-04.
This import includes subsequent main-branch fixes, not only that release.

Three-way reconciliation used the verified original snapshot, current distribution
and pinned upstream checkout. Updates applied to these imported workflows:

| Distribution skill | Imported change |
| --- | --- |
| code-review | Discover all standards files, use the configured tracker doc and foreground parallel reviewers. |
| diagnosing-bugs | Verify a forced mutation actually landed before trusting a red test. |
| grilling | Phrase questions so yes accepts the recommendation. |
| handoff | Specify OS temporary-directory resolution. |
| implement | Fetch a supplied ticket and state its title; explicitly load TDD and review. |
| setup-mvskills (bundled Matt setup) | Create missing triage labels; correct GitHub/GitLab reads, PR listing and sub-issue operations. |
| tdd | Explain what each proposed test seam catches and misses. |
| teach | Anchor workspace paths and vary correct quiz answer positions. |
| to-tickets | Attach tickets to their source issue; omit duplicate textual blockers when native edges exist. |
| wayfinder | Keep decision labels separate from triage, wire real references, preserve research branches without PRs and resolve by ticket type. |
| wizard | Fix terminal/readline behavior, EOF, browser-opener warnings, quoted env persistence, symlink/file modes and parsing stages before execution. |

The other 14 original skill directories have no upstream content changes. MVskills
profile dispatch, disabled tracking, setup consolidation and existing prototype rules
are retained. New label commands target the configured tracking repository; PR
listing targets the recorded code repository. The code-review tracker conflict was
resolved using setup-mvskills while retaining disabled-tracker handling.

The custom ask-mv router incorporates the two ask-matt corrections: read entrypoints
before claiming or skipping procedures, and route post-fix prevention work to retro,
with architectural exploration for a missing regression-test seam.

No newly promoted skills were added upstream between the verified baseline and this
commit. The newly added chief-of-staff is experimental and is not imported. Existing
upstream skills outside our selected bundle remain outside it. The MIT license is
unchanged, and these updates introduce no package dependencies. See
[validation](validation.md) for checks and behavioral limitations.

## Custom integration audit after 1.3.1 (2026-10-12)

The first import verified upstream files and retained existing integration blocks;
it did not establish that every custom caller followed the updated workflows.
This follow-up audits all 13 custom skills against the same pinned upstream commit,
including their references/templates and the implement, implement-spec, code-review
and wayfinder integration paths.

| Custom skill | Adaptation or verified boundary |
| --- | --- |
| api-contracts | Explicit dependency loading; negative-fixture mutation evidence; HTTP seam coverage limits and conditional TDD fallback. |
| ask-mv | Carry fetched ticket context, agreed seams and diagnosis evidence into custom execution; retain single coordinator-owned review. |
| design-system | Explicit strict-typescript loading; distinguish lexical token checks from visual/contrast evidence and verify forced violations. |
| docker-coolify | Reach the updated wizard for human-only steps; handle missing installations; export shell-captured values through a tested consumer-specific TypeScript adapter for dotenv/Compose. |
| extend-mvskills | Require an audit of every custom caller on future imports, explain unchanged cases, and register dependency/ownership decisions. |
| nestjs-architecture | Load dependencies explicitly; carry repo standards to review; document what each test seam catches and misses and avoid fake-storage assertions. |
| nestjs-cli | Explicitly load architecture before generators; existing CLI/version rules and deferred module registration remain applicable. |
| nestjs-feature | Fetch direct ticket references, reuse coordinator evidence, reach diagnosis/TDD/review conditionally, and select test templates only at agreed seams. |
| react-architecture | Explicit dependency loading; testing reference distinguishes screen, mutation, component and pure-function coverage limits. |
| react-feature | Fetch direct ticket references, reuse agreed seams/diagnosis, report conditional dependency gaps, and return evidence to the coordinator. |
| react-vite | Load architecture/design instructions before scaffolding; align selected TDD with agreed seams while retaining the real API smoke check. |
| setup-mvskills | Reconcile approved missing-label creation with no-tracker/triage-absent/access-pending cases; carry standards pointers, env round-trip rules and negative-check evidence. |
| strict-typescript | Verify the intended mutation and diagnostic in negative fixtures; explicitly permit the human-operated Bash wizard while keeping exporters in TypeScript. |

The prior custom red/green/refactor wording contradicted Matt's existing TDD rule:
refactoring belongs to review. Coordinators, feature workflows and README now agree.
Workers pass deferred wiring/shared changes to the integration stage; dependents are
released only after those changes are applied and validated. Profile standards
supplement the project's standards sources rather than replacing their discovery.

The newly imported wayfinder label/type/push rules are adapted to the local tracker:
Type and Status fields govern classification, claiming, frontier and resolution;
research artifacts can stay local without a remote and never require a PR. GitLab
ticket parentage has a textual fallback separate from blocking relationships.

Grilling's recommendation convention is applied to setup choices. Handoff temporary
paths and teach quiz/workspace rules have no custom implementations to reconcile;
ask-mv reaches their imported entrypoints. No experimental skills are added.
The mandatory dependency map adds nestjs-cli's architecture dependency and
extend-mvskills' writing-for-agents dependency. Conditional workflows remain named
at their branches with explicit missing-skill handling.
