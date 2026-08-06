# ui-dev-kit

Premium **desktop UI kit** for Théo's Wails apps (Go + React).
This repository holds the **governance** (rules, phases, skills) **and the built SDK**
(harvested components and blocks in `ui-sdk/`).

## What this repo contains

| Folder | Role |
| --- | --- |
| `governance/` | The rules of the game: constitution (non-negotiable), phases (roadmap, 0–5 done), parallel work, 9 authoring guides |
| `skills/` | AI skills: in-house guards (`ux-memory`, `ui-review`, `meta-audit`) + reference design skills (shadcn, Anthropic, Vercel, Apple HIG) |
| `ux/` | Design memory: personas, flows, screens — empty templates, filled with real product decisions when they exist |
| `ui-rules/` | Interface rules (spacing, colors, typography…) — 10 files, filled and sourced (Phase 4) |
| `patterns/` | How to organize recurring screens (settings, table, search…) — 8 files, filled (Phase 4) |
| `references/` | Verified research (log), design systems, Wails constraints, session/phase reports, audit |
| `ui-sdk/` | The SDK: 40 license-verified components/blocks, per-piece README, index, consumption guide |
| `ui-workspace/` | Temporary buildable reference (frozen base, 61 shadcn components) — **gitignored, regenerable** |

## Where the project stands

**Phases 0–5 done and validated by Théo (2026-08-06).** The kit is operational: frozen base
installed, blocks harvested, SDK organized, rules populated, review guard active. See
`governance/phases.md` for the roadmap and `references/` for the reports.

## For you (not for agents)

- You don't code: you validate. Agents read `AGENTS.md` and the governance at startup.
- Any question asked to you is a simple product decision (name, target, order) — not an
  internal technical question.
- Decisions already made: name **ui-dev-kit**, **separate** repository from go-dev-kit,
  100% **free/open-source** block sources.

## Getting started

1. Read `references/session-0-report.md` (what was decided) and `references/audit-2026-08-06.md`
   (current health).
2. To use the kit in a Wails app: read `ui-sdk/docs/CONSUMPTION.md`.
3. Optional next step: Phase 6 (recurring constitution audit) — Théo's call.
