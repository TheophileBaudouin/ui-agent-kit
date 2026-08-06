# ui-sdk — components, blocks, layouts

> Source library of the ui-dev-kit. Populated from Phase 1 (frozen base reference in
> ui-workspace/) and Phase 2/3 (block harvest + organization). Nothing here replaces the
> frozen base: every piece builds on top of it.

## Content

| Folder | Content | Source (Phase) |
| --- | --- | --- |
| components/ | 33 added components (charts, settings/auth/billing, upload, sections) | Harvested Phase 2, organized Phase 3 |
| blocks/ | 7 page blocks (command menu, login, onboarding, stats…) | Harvested Phase 2, organized Phase 3 |
| layouts/ | Desktop layout templates — **reserved** | Phase 3+ |
| templates/ | Complete pages — **reserved** | Phase 3+ |
| examples/ | Usage examples — **reserved** | Phase 5 |
| docs/ | Consumption guide, authoring conventions | Phase 3 |
| components-index.md | Index of every piece | Phase 3 |

## How to use

Copy the pieces you need into your app. Read `docs/CONSUMPTION.md` first — the copy rules
(whole folder, keep path, install per-piece npm deps) are the contract.

## Licensing

All pieces are MIT or Apache-2.0 (per-piece provenance in each README and in
components-index.md). The frozen base (shadcn/ui) is MIT.

## Status

Phase 3 complete: harvest organized, README + preview per piece, index up to date.
Next: Phase 4 (real rules in ui-rules/ and patterns/, from verified sources).
