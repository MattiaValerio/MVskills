---
name: ui-ux-research
description: Research and adapt UI/UX references for new screens, multi-step flows, substantial redesigns or an explicitly requested style change. Use optional Mobbin MCP tools when available, preserve the project's visual identity and produce decisions for the screen brief. Local visual fixes use existing conventions without external research.
---

# UI/UX research

Applies across frontend stacks, in Claude Code and Codex. This skill owns reference
research and adaptation; the caller owns implementation, tests and review. Read the
project's instructions, docs/agents/stack.md when present, design documentation,
theme and nearby screens first. Preserve its framework and styling conventions.

## 1. Decide what needs research

For a new screen, flow or substantial redesign, identify the user goal, platform,
steps, information hierarchy and unresolved interaction decisions. Reuse relevant
research already supplied by the coordinator or recorded in the project. A local
styling correction normally needs only existing components and patterns.

The project's established visual identity stays constant unless the user explicitly
requests a different style. New features and layout redesigns alone do not authorize
changing palette, fonts, radius or component styling. Adopt useful UX patterns inside
the existing design system. Extend semantic tokens or variants consistently when a
new role is needed; preserve the established values and visual language.

For a new project without an agreed identity, or an explicitly requested style
change, present coherent visual directions with a recommendation and wait for the
user's choice before implementing that style. Reuse a choice already settled in the
conversation. UI variations belong to prototype when installed; otherwise present
concrete reference-based directions without requiring that skill.

## 2. Discover the available capabilities

Use the current host's tool catalog and, if provided, deferred-tool search to discover
Mobbin tools. Read their descriptions and input schemas before calling them. Names
may be prefixed or aliased differently in Claude Code and Codex: identify the server
and capability rather than hardcoding a fully qualified tool name. A configured
server in one client does not establish availability in the other or in a worker.
MCP resource listing alone does not establish which tools are callable.

Look for screen search, ordered flow search or website section search as needed.
The documented names are search_screens, search_flows and search_sections, but the
live schemas are authoritative. Use the available subset. If only screens are
available, mark any reconstructed flow as inference. A gallery is optional; use
returned images and metadata with the host's available image-inspection capability.
If images cannot be inspected, state that limitation rather than claiming a visual
assessment. Palette, font and token extraction are not assumed server capabilities.

Mobbin is optional development tooling, never an application runtime dependency.
Configuration and OAuth remain in the client environment. For requested setup or
troubleshooting read [Mobbin connection](references/mobbin.md). Ordinary research
does not install servers, edit client configuration or initiate authentication.

## 3. Search within a small budget

Prefer flow search for multi-step journeys, screen search for individual screens and
section search for website sections. Query by user task, platform and constraints;
visual similarity alone does not establish a useful reference. Start with one
targeted search and allow one refinement if needed. This is the budget for the task,
shared across tools and fallback web research; reuse results instead of restarting
in each calling skill or worker. Stop sooner when the evidence is sufficient.

Use standard search. Deep Search or another credit-consuming mode requires an
explicit user request; do not escalate after poor standard results. Inspect the live
mode schema to select standard. If the available tool only offers a paid mode,
continue with the fallback unless that mode was requested.

For each useful reference, inspect the actual screen or steps and any available
preview with the host's image capability. Identify what supports
the user goal, what does not transfer and how to adapt it. Match domain constraints,
navigation, content density and mobile/desktop behavior. Interpret colours and themes
only within the style decision from step 1; translate selected visual cues into the
project's tokens rather than copying values into feature components.

### Unavailability and fallback

If tools are absent after supported discovery, access is denied, OAuth is missing,
the plan is insufficient, the request times out or results are irrelevant, record the
observed reason briefly and continue. Do not turn an optional reference into a blocker.
Deep-only credit failure does not mean standard/flow/section search is unavailable.
For a rate limit, respect Retry-After; retry at most once within the remaining search
budget if waiting is practical, otherwise fall back without another request.

Use the project's screens/design system and user-provided references first. If a
concrete UX question remains and web tools are available, use the remaining search
budget for public references. If no budget remains, proceed from local evidence.
Distinguish observed patterns from proposed solutions; never claim Mobbin was used
when it was unavailable. Carry unresolved product decisions to the user only when
they materially affect the flow; absence of Mobbin alone needs no confirmation.

## 4. Return decisions for the brief

Add a short research note to the existing screen brief, prototype question or local
feature specification, rather than creating a separate report by default:

- User goal, platform and the UX question researched.
- Sources actually inspected: app/site, screen or flow, link/identifier when supplied,
  and retrieval date; otherwise record local evidence or the fallback reason.
- Pattern selected, why it fits, adaptations and relevant tradeoffs. Separate observed
  steps from inferred behavior and note any limits on image inspection.
- Proposed flow and pending, empty, error and success states where relevant (mark
  non-applicable states rather than inventing them); responsive behavior,
  keyboard/focus, labels and contrast considerations.
- Existing visual identity retained, or the user's selected direction and its scope.

Choose references autonomously inside an established design. Persist shared visual
decisions in the existing design-system documentation (or the Design system section
of docs/agents/stack.md), including any authorized style change. Keep reference
identifiers and rationale: temporary image URLs alone are not durable evidence.
In parallel work, pass this note and the chosen style to workers; workers use only
their available tools and return shared token/component changes to the integrator.

Research is complete when the caller has a usable flow and justified adaptations,
the style constraint is explicit, and evidence/limitations are recorded. Implement
and verify through the project's normal workflow. Screenshots and token checks do
not establish UX quality: verify the complete journey, hierarchy, consistency,
accessibility, responsive behavior and all relevant states in the rendered UI.
