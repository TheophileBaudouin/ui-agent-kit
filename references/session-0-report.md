# End-of-session 0 report — ui-agent-kit meta-project

> Date: August 6, 2026 · Phase 0 (meta-project) · To be validated by Théo before any follow-up.

## 1. What was created (final tree)

```text
workspace/
├── AGENTS.md                          (replaces the generic bootstrap — under 150 lines)
├── README.md                          (human view, for Théo)
├── .gitignore                         (ignores .pi/memory/ — agent working memory)
├── .pi/settings.json                  (declares root skills/ to Pi — see point 5)
│
├── skills/                            (7 skills, all discovered via .pi/settings.json)
│   ├── ux-memory/                     (in-house guard: read before / write after)
│   ├── ui-review/                     (in-house guard: reviews, never codes)
│   ├── shadcn/                        (official shadcn skill — cloned from shadcn-ui/ui)
│   ├── frontend-design/               (Anthropic — aesthetic direction)
│   ├── web-design-guidelines/         (Vercel — review guard, 100+ rules)
│   ├── macos-design-guidelines/       (ehmo — Apple HIG macOS, THE desktop reference)
│   └── web-platform-guidelines/       (ehmo, renamed — WCAG 2.2, collision avoided)
│
├── governance/
│   ├── constitution.md                (version 1.0.0, 5 principles, naming, semver versioning)
│   ├── phases.md                      (Phase 0 → 6, exit criteria, Phase 1 entry)
│   ├── parallel-work.md               (pi-subagents default, worktree+tmux fallback, guards)
│   └── authoring-guides/              (9 authoring guides, one per living file)
│       ├── ux-user-personas.md  ux-user-flows.md  ux-navigation.md
│       ├── ux-screens.md  ux-shortcuts.md  ux-design-decisions.md
│       ├── ui-rules-file.md  pattern-file.md  components-index-entry.md
│
├── ux/                                (6 empty templates — filled in Phase 3+)
│   ├── user-personas.md  user-flows.md  navigation.md
│   ├── screens.md  shortcuts.md  design-decisions.md
│
├── ui-rules/                          (10 empty templates — filled in Phase 4)
│   └── 01-spacing … 10-dialogs.md
├── patterns/                          (8 empty templates — filled in Phase 4)
│   └── settings-page … table.md
├── references/
│   ├── research-log.md                (verified research journal, §A→G)
│   ├── design-systems.md              (design systems table + verdicts)
│   └── session-0-report.md            (this file)
└── ui-sdk/                            (empty skeleton — nothing built, per the mission)
    ├── README.md  components-index.md  components/  blocks/  layouts/
    ├── templates/  examples/  docs/
```

`SYSTEM.md`: **not created** — no system-prompt adjustment is needed (option provided by the
mission, correctly left out).

All project files are written in **English** (ecosystem standard, per Théo's rule added after
review of Phase 0).

## 2. Kept skills, source and installation method

| Skill | Source | License | Installation method (exact) |
| --- | --- | --- | --- |
| ux-memory | written in session 0 | — | direct writing |
| ui-review | written in session 0 | — | direct writing |
| shadcn (official) | github.com/shadcn-ui/ui → `skills/shadcn/` | MIT (repo) | sparse clone of the repo, copy of the folder. Alternative: `pnpm dlx skills add shadcn/ui` |
| frontend-design | github.com/anthropics/skills → `skills/frontend-design/` | Apache-2.0 | manual copy from clone. Alternative: `npx skills add anthropics/skills -s frontend-design -a pi` |
| web-design-guidelines | github.com/vercel-labs/agent-skills | not declared per skill | manual copy from clone. Alternative: `npx skills add vercel-labs/agent-skills -s web-design-guidelines -a pi` |
| macos-design-guidelines | github.com/ehmo/platform-design-skills → `skills/macos/` | MIT | manual copy (SKILL.md + rules/) |
| web-platform-guidelines | github.com/ehmo/platform-design-skills → `skills/web/` | MIT | manual copy + **frontmatter rename** (name collision with vercel-labs avoided) |

Each reference skill folder contains a `SOURCE.md` (provenance, license, method, verification
date). Details and stars in `references/research-log.md` §E.
Rejected skills and why: ebuntario/apple-hig (2★), plugin87/ux-ui-agent-skills
(reliability unverifiable), ehmo mobile platforms (desktop project — available if needed).

## 3. Design systems without a reliable found skill

- **Fluent (Microsoft)** — no reliable agent skill found. Instead: pointer to the official
  docs `fluent2.microsoft.design` in `references/design-systems.md`. The `microsoft/skills`
  repo targets Azure SDK/AI Foundry, not Fluent.
- **Carbon (IBM)** — same: pointer to `carbondesignsystem.com`.
- **Primer (GitHub)** — same: pointer to `primer.style`.
- **What to do instead**: for Windows conventions (secondary Wails target), consult the
  Fluent docs directly during Phase 4 writing; re-check skills.sh if a reliable skill appears
  (instruction noted in design-systems.md).

## 4. Choices made with Théo (answers received, not defaults)

- **Name**: ui-agent-kit (Théo's choice).
- **Location**: separate repository from go-dev-kit (Théo's choice) — this folder is the root.
- **Paid blocks**: 100% free / open source (Théo's choice) — documented in phases.md
  (Phase 2) and research-log.md.
- No default "to confirm" choices were needed: Théo answered all three questions.

## 5. Uncertain or unverifiable points

1. **Pi skill discovery**: a root `skills/` folder is not auto-discovered (correction to the
   mission's assumption). Bridge in place: `.pi/settings.json` → `{ "skills": ["../skills"] }`
   (identical pattern to the official `../.claude/skills` example). **To verify at session 1
   startup**: list the skills loaded by Pi (`pi` → `/skill:` in the startup header, or
   `/settings`).
2. **Vercel skills license**: not declared per skill → verify before commercial use.
3. **Block registries list**: very volatile ecosystem — re-read
   (`ui.shadcn.com/r/registries.json`) at Phase 2, every license verified at install.
4. **shadcn CLI version**: commands verified on Aug 6, 2026 (v4, `base|radix|aria` bases) —
   re-verify the exact flags at Phase 1 (the CLI moves fast).
5. **Gloaguen et al. 2026 study** (138 repos, long context = failure): cited by the mission
   as the justification for "dense signal"; not independently re-verified — accepted as a
   mission constraint.

## 6. Phase 1 planned — and explicit confirmation

**Nothing of Phase 1 has been started.** No `shadcn init`, no `shadcn add`, no content in
`ui-sdk/components|blocks|layouts|templates|examples`. `ui-sdk/` is an empty skeleton.

**Phase 1 (on Théo's validation)**: create `ui-workspace/` (React + Vite + TS + Tailwind +
shadcn project, `base` base), `npx shadcn@latest add --all`, verify the build, document the
list of installed components **without modifying anything**. Phase 1 entry detailed in
`governance/phases.md`.

---

**Status**: Phase 0 complete, awaiting Théo's validation. No follow-up without this
validation (constitution, principle 4).
