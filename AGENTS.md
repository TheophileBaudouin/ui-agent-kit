# AGENTS.md — ui-agent-kit (meta-project)

## This project

Meta-project of the **premium desktop UI kit** for Théo's Wails apps
(Go + Wails, frontend React + TypeScript + Vite + Tailwind + shadcn/ui + Radix + Lucide).
This repository holds the **governance** (rules, phases, skills, templates), the **SDK**
itself in `sdk/` (components, blocks, interface rules, patterns, design memory, dev skills)
and the **installer CLI** in `cli/` (zero-dep Node, published on npm as `ui-agent-kit`).
The frozen-base reference (`ui-workspace/`, gitignored, 61 shadcn components) is the
temporary buildable mirror used to verify SDK pieces.
Current state: **phases 0–5 executed and validated by Théo (2026-08-06)** — governance
populated, SDK operational and published; **Phase 7 (single-command installer) executed at
Théo's request (2026-08-06), pushed and published on npm**; **Phase 8 (agent chat UI —
assistant-ui base + agent components) executed at Théo's request (2026-08-08), pushed**.
Phase 6 (optional audit) pending.

## Before doing anything

1. Read `governance/constitution.md` (non-negotiable principles).
2. Read `governance/phases.md` to know what is allowed.
3. Work inside `sdk/` for anything touching the SDK: it has its own `AGENTS.md`,
   `.pi/settings.json` and skills — read them first.
4. Any design rule you write must cite a verified source (`sdk/docs/design-systems.md`).

## Absolute rules

- The frozen base (shadcn/ui, Radix UI, Tailwind CSS, Lucide React) is **never** modified
  except for a proven bug fix — documented in `sdk/ux/design-decisions.md`.
- We never "improve" an existing component: we create a new one next to it, explicitly named
  (`PremiumButton`, `DesktopButton`…), with its sourced justification.
- Any added design rule cites its source (official design system or verified skill).
- We build nothing until the current phase is validated by Théo (`governance/phases.md`).
- **All project files and documentation are written in English** — the ecosystem standard
  (chat language and file language are independent).
- **The SDK is static-only, Wails-bound**: frontend builds to a static bundle
  (`frontend/dist/`, `//go:embed`, no SSR, no `next/*`); hash routing (`HashRouter`);
  platform features via `@wailsio/runtime` + Go bindings — see `sdk/docs/wails-constraints.md`.
- **Physical meta/SDK separation** (constitution, principle 6): the SDK lives exclusively in
  `sdk/` and is autonomous. Content that answers "how to build/maintain a Wails frontend"
  goes in `sdk/`; content that answers "how we govern this project" goes in `governance/` or
  `references/`. Never create SDK files at the repo root, never reference the meta-project
  from inside `sdk/`. When in doubt, ask before creating.
- **State files reflect reality**: after any executed phase, update `AGENTS.md` and
  `governance/phases.md` and trace Théo's validation in a versioned file.

## Where to find what

| Need | Where |
| --- | --- |
| Non-negotiable principles, naming, versioning | `governance/constitution.md` |
| Roadmap, what is allowed now | `governance/phases.md` |
| **The SDK itself** (components, rules, patterns, skills, docs) | `sdk/` (own AGENTS.md + configs) |
| Interface rules, screen patterns, design memory | `sdk/ui-rules/`, `sdk/patterns/`, `sdk/ux/` |
| Components / blocks / consumption guide | `sdk/ui-sdk/` (index + `sdk/ui-sdk/docs/CONSUMPTION.md`) |
| Wails constraints, design-systems sourcing | `sdk/docs/` |
| Dev skills (ux-memory, ui-review, references) | `sdk/skills/` |
| Parallel work (subagents, worktrees, tmux) | `governance/parallel-work.md` |
| Research log, phase reports, audit | `references/` |
| Recurring project audit | `skills/meta-audit/` + `references/audit-2026-08-06.md` |

## Useful commands (verified — see references/research-log.md)

```bash
# Install the SDK in a consumer Wails/Vite project (see root README)
npx ui-agent-kit          # install: mirror sdk/ → ui-kit/, copy code → src/, base + deps + configs
npx ui-agent-kit update   # refresh when a newer version is published
npx ui-agent-kit doctor   # check prerequisites (read-only)

# Installer maintenance (cli/)
npm run manifest   # regenerate cli/manifest.json from the SDK's actual imports
npm test           # end-to-end suite (temp fixtures, no network)
npm publish        # prepublishOnly = manifest + tests, then publish

# Verify SDK pieces: copy to ui-workspace (the buildable mirror) and build
cd ui-workspace && npm run build

# Install all shadcn components in a consumer app (the frozen base)
npx shadcn@latest add --all

# Install a skill for Pi (target pi → .pi/skills/ or ~/.pi/agent/skills/)
npx skills add <owner>/<repo> -a pi
```

The meta-project's own skill lives in `skills/` (root: `meta-audit`), declared to Pi via
`.pi/settings.json` → `{ "skills": ["../skills", "../sdk/skills"] }` (a root `skills/` folder
is not auto-discovered by Pi — see `references/research-log.md` §A). The SDK's skills are
declared by `sdk/.pi/settings.json` inside the SDK.

## Reminder

This file stays **short**: any additional durable information goes into a file under
`governance/`, `references/` or `sdk/docs/`, never here. Do not duplicate information
present elsewhere — link to it.
