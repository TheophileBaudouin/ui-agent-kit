# Constitution — ui-agent-kit

Version: 1.0.0
Last modified: 2026-08-06

> This constitution is inspired by the "constitution first" discipline of
> github/spec-kit (verified in session 0 — see `references/research-log.md` §F), adapted to
> plain Markdown natively readable by Pi. It is binding for **every** session working in this
> repository, including future sessions that build the SDK.

## Non-negotiable principles

1. **Frozen base, untouchable.** shadcn/ui, Radix UI, Tailwind CSS and Lucide React are a
   source of truth that is never modified, except for a proven bug fix — documented in
   `sdk/ux/design-decisions.md` with its justification. We never "improve" an existing component:
   we create a new component next to it (see §Naming).

2. **Integrator, not designer.** Never ask a coding agent to "improve / make more premium /
   redesign" anything: that is unspecified design work. Any visual evolution goes through a
   **newly named component**, backed by a documented rule in `sdk/ui-rules/` or `sdk/patterns/`.
   The meta-project provides the rules; agents apply them, they don't invent.

3. **No rule without a source.** Every rule in `sdk/ui-rules/` and every pattern in `sdk/patterns/`
   cites its source: an official design system (Apple HIG, Material, WCAG…) or a verified
   reference skill (see `sdk/docs/design-systems.md` and `references/research-log.md`).
   An unsourced rule is not written — it is marked "to verify" in the session report.

4. **No construction without validated governance.** Nothing is built until the current
   phase (see `governance/phases.md`) is validated. Phase 1 (frozen base install) starts only
   with Théo's explicit validation, and happens in a temporary workspace (`ui-workspace/`),
   never directly in `sdk/ui-sdk/`.

5. **One authoring guide per memory system.** Every living memory system of the project
   (`ux/` today, any other tomorrow) has its twin file in `sdk/docs/authoring-guides/`
   explaining: what it is for, its exact format, when to read it, when/how to update it and
   how to analyze the project to update it correctly. This principle is permanent.

## Naming of added components

We never touch `Button`. We add `PremiumButton` or `DesktopButton` next to it, with its own
justification in `sdk/ui-rules/` or `sdk/patterns/`.

- An added component carries a name describing its contribution (explicit prefix or suffix:
  `Premium*`, `Desktop*`, `*Bar`, `*Panel`…), never a name from the frozen base.
- Its entry goes into `sdk/ui-sdk/components-index.md` with category, short description, status.
- It depends on the frozen base only through declared interfaces (props, slots), never by
  modifying it.

## Versioning policy of this file

Semver MAJOR.MINOR.PATCH:

- **MAJOR**: removal or meaning change of an existing principle.
- **MINOR**: addition of a principle.
- **PATCH**: rewording without meaning change.

Every version change adds a line to the history at the bottom of this file with the date and
the justification.

## Compliance check

Before any Phase (or any significant work), an agent must verify that the planned work
respects each principle above. Any deviation must be explicitly noted in the end-of-session
report, with its justification. Phase 6 (optional) will define a recurring compliance audit.

## History

- **1.0.0** (2026-08-06): initial ratification in session 0 (meta-project).
