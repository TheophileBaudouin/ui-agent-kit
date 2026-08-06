# Phase 4 report — rule population (ui-rules/ + patterns/)

> Date: August 6, 2026 · Exit criterion met: **every `ui-rules/` and `patterns/` file cites
> its sources** (verified programmatically).

## What was done

Populated the 10 `ui-rules/` files and the 8 `patterns/` files with real, actionable
content — every rule grounded in a verified source (constitution, principle 3: no rule
without a source). Nothing invented from memory: rules were extracted from the skills
installed in Phase 0 (which themselves distill Apple HIG 2025, WCAG 2.2, MDN, and Vercel's
guidelines) and from the frozen base's own conventions.

## Rule files (10)

| File | Rules | Primary sources cited |
| --- | --- | --- |
| 01-spacing | 4 | Apple HIG §9.6 (20pt margins, 8pt related / 20pt groups), Tailwind 4px scale |
| 02-colors | 5 | Apple HIG §9.3–9.5, §11.4; WCAG 1.4.1; shadcn tokens |
| 03-typography | 5 | Apple HIG §9.1; WCAG 1.4.4; Vercel (tabular-nums); shadcn typeset |
| 04-animations | 5 | WCAG 2.3.3 / 2.3.1; Apple HIG §11.3; shadcn tw-animate-css; Anthropic frontend-design |
| 05-accessibility | 6 | WCAG 2.1.1, 2.4.7/2.4.11, 4.1.2, 1.4.1, 1.4.3; Apple HIG §11; Vercel |
| 06-layout | 5 | Apple HIG §2–4; responsive; shadcn Sidebar/Empty |
| 07-icons | 5 | shadcn skill rules/icons.md (data-icon); lucide; Apple HIG §3.5 |
| 08-keyboard | 5 | Apple HIG §5.1–5.7 (Cmd conventions table); WCAG 2.1.1 |
| 09-desktop | 5 | Apple HIG §1–4, §8 (menu bar, windows, toolbars, sidebars, system integration) |
| 10-dialogs | 5 | Apple HIG §7, §10; WCAG 2.1.1; shadcn Dialog/AlertDialog |

Each file: 4–6 actionable rules, a Source section with the exact skill/design-system
reference, and a correct/incorrect example. 1–2 pages each.

## Pattern files (8)

settings-page, dashboard, wizard, login, file-explorer, preferences, search, table — each
with the full template (when to use / how to organize / common mistakes / best practices /
recommended components-blocks), cross-linking `ui-rules/` files and pointing to the **real
harvested pieces** in `ui-sdk/` (e.g. settings-page → `components/hextaui/settings-*`,
search → `blocks/blocks-so/command-menu-01/02`, file-explorer → `components/retab/dropzone`).

Deferred pieces are flagged honestly: `table-05` (excluded in Phase 2 — different Table API)
is noted with a re-integration condition; the retab document-viewer cluster is referenced
via `references/phase-2-report.md` before any re-integration.

## Method

1. Extracted the actual rule content from the installed skills (macos-design-guidelines
   §1–§11, web-platform-guidelines §1/§4/§6/§7, shadcn rules/icons.md) — targeted section
   reads, no invention.
2. Wrote each file with the exact template from `governance/authoring-guides/ui-rules-file.md`
   and `pattern-file.md`.
3. Verified programmatically: every ui-rules file has a `## Source` section citing a real
   source; every pattern has the 5 required sections and cites at least one source or
   ui-rules reference. All 18 files pass. Markdown lint clean.

## Compliance

- Every rule traces to a verified source (skill + underlying design system).
- `ux/` files were NOT populated: they wait for real product decisions (mission rule).
- ui-sdk/ untouched by this phase (only referenced by patterns).

## Exit criteria

- [x] Every `ui-rules/` and `patterns/` file cites its sources.
- [x] No rule written without a source.

---

**Status**: Phase 4 complete, validated by Théo on 2026-08-06. Next: Phase 5 (ui-review skill
operational on an example screen) — the first real end-to-end check of the whole kit.
