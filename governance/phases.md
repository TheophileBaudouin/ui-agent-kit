# Phases — ui-agent-kit roadmap

> Phases 0–5 are **executed and validated by Théo (2026-08-06)**. Phase 7 (single-command
> installer) was executed at Théo's request (2026-08-06). Phase 6 is optional and pending
> Théo's decision. Each phase's exit criterion was met before moving on.

## Phase table

| Phase | Name | Content | Exit criterion | Status |
| --- | --- | --- | --- | --- |
| 0 | Meta-project | Governance, skills, templates, verified research | End-of-session report validated by Théo | ✅ done (2026-08-06) |
| 1 | Frozen base | Temporary React/Vite/Tailwind/shadcn project (`ui-workspace/`), all shadcn components installed, build verified | Installed component list documented, **no modification**, green build | ✅ done — 61 components, report `references/phase-1-report.md` |
| 2 | Block harvest | Block registries researched (100% free/open source — Théo's choice), installed, sorted by license | Every kept block license-verified and documented | ✅ done — 5 registries kept, report `references/phase-2-report.md` |
| 3 | Reorganization | Migration to `ui-sdk/components/`, `blocks/` with README + preview per piece | `sdk/ui-sdk/components-index.md` up to date | ✅ done — 40 pieces, report `references/phase-3-report.md` |
| 4 | Rule population | Real writing of `sdk/ui-rules/` and `sdk/patterns/` from verified sources | Every file cites its sources | ✅ done — report `references/phase-4-report.md` |
| 5 | ui-review skill | Review guard operational on the real SDK | One successful test review on an example screen | ✅ done — report `references/phase-5-report.md` |
| 6 | Continuous audit (optional) | Recurring audit skill re-checking constitution compliance | To define with Théo if wanted | ⏳ pending — skill `skills/meta-audit/` ready, first run: `references/audit-2026-08-06.md` |
| 7 | Single-command installer | Zero-dependency Node CLI (`npx ui-agent-kit`): install/update/doctor, generated manifest, import self-check, e2e tests, docs | All e2e tests green; install verified on a Wails `frontend/` layout | ✅ done — 11 tests, report `references/phase-7-report.md` |

## What is allowed now (post-Phase 5)

- Evolve the governance (`governance/`, `AGENTS.md`, `references/`) — keeping the state
  descriptions accurate (constitution principle: files reflect reality).
- Evolve the guard skills (`skills/ux-memory/`, `skills/ui-review/`, `skills/meta-audit/`).
- Add **new named components** to the SDK (`Premium*`, `Desktop*`…) per constitution §Naming,
  with sourced justification in `sdk/ui-rules/` or `sdk/patterns/` and an index entry.
- Consume the kit in real Wails apps (see `ui-sdk/docs/CONSUMPTION.md`).
- Fill `sdk/ux/` templates when **real** product decisions exist (no invention).

**Forbidden**:

- Modifying the frozen base (constitution, principle 1) or the harvested pieces without a
  documented reason.
- Re-running `shadcn init`/`add` outside `ui-workspace/` without planning.
- Inventing definitive content in `sdk/ux/`.

## History

- **2026-08-06**: phases 0–5 executed and validated by Théo; audit performed
  (`references/audit-2026-08-06.md`), state files updated to reflect reality, repository
  pushed to GitHub.
- **2026-08-07**: Phase 7 (single-command installer) executed at Théo's request
  (`references/phase-7-report.md`), pushed to GitHub; second audit
  (`references/audit-2026-08-07.md`).
