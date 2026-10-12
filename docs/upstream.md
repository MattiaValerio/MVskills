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
