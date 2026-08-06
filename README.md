# ui-agent-kit

Premium **desktop UI kit** for Théo's Wails apps (Go + React).
This repository is the **meta-project** (governance, research, audit) **and** the **SDK**
itself in `sdk/` — the consumable kit that is copied into Wails frontends.

## What this repo contains

| Folder | Role |
| --- | --- |
| `sdk/` | **The SDK** (own AGENTS.md + configs): components/blocks (`ui-sdk/`), interface rules (`ui-rules/`), screen patterns (`patterns/`), design memory (`ux/`), dev skills (`skills/`), docs (Wails constraints, design systems, authoring guides) |
| `governance/` | The meta-project's rules: constitution (non-negotiable), phases (roadmap, 0–5 done), parallel work |
| `references/` | Research log, phase reports 0–5, Wails constraints source notes, audit report |
| `skills/` | Meta-level skill: `meta-audit` (recurring project audit) |
| `ui-workspace/` | Temporary buildable mirror (frozen base, 61 shadcn components) — **gitignored**, used to verify SDK pieces |

## Where the project stands

**Phases 0–5 done and validated by Théo (2026-08-06).** Governance populated, SDK
operational and published to GitHub. See `governance/phases.md` and `references/`.

## Getting started

1. **Using the kit in a Wails app**: go into `sdk/`, read `sdk/AGENTS.md` and
   `sdk/ui-sdk/docs/CONSUMPTION.md`.
2. **Working on the meta-project**: read `AGENTS.md` and `governance/constitution.md`.
3. Optional next step: Phase 6 (recurring constitution audit via `skills/meta-audit/`).
