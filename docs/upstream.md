# Upstream maintenance

Source: https://github.com/mattpocock/skills. The 25 imported skills were installed before packaging. Original paths/hashes are in upstream/installed-skills-lock.json. Their historical commit is unknown. HEAD observed 2026-10-01: d81f3a183412e71a5b1e84ca21bc1a35eea03a60; this does not assert installed copies match that commit.

Original copies remain in .agents/skills/. Distribution lives in skills/. Integration edits: implement, implement-spec, code-review and setup-matt-pocock-skills load profiles or custom setup; fallback blocks address unavailable invocation/parallelism.

Import updates from a separate checkout at an explicit commit. Compare previous upstream snapshot and new commit, apply reviewed changes preserving integration blocks, review dependencies/licenses, run checks, then record commit and modified names here. First import must reconcile the original installed snapshot because its commit is unknown. Preserve custom skills during imports.

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
