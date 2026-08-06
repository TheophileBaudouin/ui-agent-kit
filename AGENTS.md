# AGENTS.md — ui-dev-kit

## This project

Meta-project of the **premium desktop UI kit** for Théo's Wails apps
(Go + Wails, frontend React + TypeScript + Vite + Tailwind + shadcn/ui + Radix + Lucide).
This repository holds the **governance** (rules, phases, skills, templates) and the **built
SDK**: the frozen-base reference (`ui-workspace/`, gitignored, 61 shadcn components) and the
harvested kit (`ui-sdk/`, 40 pieces, license-verified).
Current state: **phases 0–5 executed and validated by Théo (2026-08-06)** — governance
populated, SDK operational, `ui-review` guard active. Phase 6 (optional audit) pending.

## Before doing anything

1. Read `governance/constitution.md` (non-negotiable principles).
2. Read `governance/phases.md` to know which phase we are in and what is allowed.
3. If you touch an interface, first read the relevant files in `ux/`, then update them after
   (see `skills/ux-memory/SKILL.md`).
4. Any design rule you write must cite a verified source (`references/research-log.md`).

## Absolute rules

- The frozen base (shadcn/ui, Radix UI, Tailwind CSS, Lucide React) is **never** modified
  except for a proven bug fix — documented in `ux/design-decisions.md`.
- We never "improve" an existing component: we create a new one next to it, explicitly named
  (`PremiumButton`, `DesktopButton`…), with its sourced justification.
- Any added design rule cites its source (official design system or verified skill).
- We build nothing until the current phase is validated by Théo (`governance/phases.md`).
- Never ask a coding agent to "improve / make more premium / redesign" anything: that is
  unspecified design work. Any visual evolution goes through a newly named component backed
  by a documented rule.
- **All project files and documentation are written in English** — the ecosystem standard
  (chat language and file language are independent).
- **Static-only, Wails-bound**: the SDK builds static frontends for Wails apps
  (`frontend/dist/`, `//go:embed`, no SSR, no `next/*`). App navigation uses hash routing
  (`HashRouter`), Vite `base: "./"`, and platform features go through `@wailsio/runtime` +
  Go bindings — see `references/wails-constraints.md` and `ui-rules/09-desktop.md`.

## Where to find what

| Need | Where |
| --- | --- |
| Non-negotiable principles, naming, versioning | `governance/constitution.md` |
| Roadmap, what is allowed now | `governance/phases.md` |
| Interface rules (spacing, colors, typography…) | `ui-rules/` (filled, Phase 4) |
| How to organize a screen | `patterns/` (filled, Phase 4) |
| Product memory (personas, flows, screens) | `ux/` (empty — waits for real product decisions, see `skills/ux-memory/`) |
| Components / blocks / layouts | `ui-sdk/` (40 pieces, harvest Phase 2/3) |
| How to consume the kit in a Wails app | `ui-sdk/docs/CONSUMPTION.md` |
| Parallel work (subagents, worktrees, tmux) | `governance/parallel-work.md` |
| Verified research, design systems, reports | `references/` |
| Recurring project audit | `skills/meta-audit/` + `references/audit-2026-08-06.md` |

## Useful commands (verified in session 0 — see references/research-log.md)

```bash
# Install all shadcn components at once (Phase 1, inside ui-workspace/)
npx shadcn@latest add --all

# Install the official shadcn skill (inside a project with components.json)
pnpm dlx skills add shadcn/ui

# Install a skill for Pi (target pi → .pi/skills/ or ~/.pi/agent/skills/)
npx skills add <owner>/<repo> -a pi

# Install a skill into this repo's skills/ (manual method documented)
# → clone the source repo, copy the SKILL.md folder + assets, wire via .pi/settings.json

# Search / get docs for a shadcn component
npx shadcn@latest search <query>
npx shadcn@latest docs <component>
```

The skills of this repo live in `skills/` (root) and are declared to Pi via
`.pi/settings.json` → `{ "skills": ["../skills"] }` (a root `skills/` folder is not
auto-discovered by Pi — see `references/research-log.md` §A).

## Reminder

This file stays **short**: any additional durable information goes into a file under
`governance/` or a guide under `governance/authoring-guides/`, never here. Do not duplicate
information present elsewhere — link to it.
