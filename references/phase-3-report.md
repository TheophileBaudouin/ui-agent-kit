# Phase 3 report — reorganization into ui-sdk/

> Date: August 6, 2026 · Exit criterion met: `ui-sdk/components-index.md` up to date.

## What was done

The Phase 2 harvest (40 pieces) was reorganized from the temporary `ui-workspace/` into the
final SDK tree `ui-sdk/`, preserving relative paths so every internal import keeps working
when a consumer copies the folders into their app.

## Final structure

```text
ui-sdk/
├── README.md                  (updated: content map, licensing, status)
├── components-index.md        (filled: 40 rows, legend)
├── components/
│   ├── evilcharts/            (11 files: charts/ + ui/ helpers — ECharts + Recharts)
│   ├── hextaui/               (10 files: settings-*, auth-*, billing-*)
│   ├── retab/                 (4 files: dropzone, dropzone-core, file-size-format, hook)
│   └── shadcncraft/           (8 files: pro-marketing/, pro-ecommerce/)
├── blocks/
│   └── blocks-so/             (7 blocks: command-menu-01/02, file-upload-05, form-layout-01,
│                                login-03, onboarding-03, stats-12)
├── docs/
│   └── CONSUMPTION.md         (copy-paste contract: whole-folder copy, keep path, per-piece deps)
└── layouts/ templates/ examples/   (reserved, still empty)
```

33 component READMEs + 7 block READMEs written (one per piece: registry, license, source,
category, frozen-base deps, npm deps, usage snippet = the code preview).

## Key decisions

1. **Layout by origin, not by category** — evilcharts and shadcncraft have internal
   cross-imports (`@/components/evilcharts/ui/…`, `@/components/shadcncraft/pro-marketing/…`);
   origin folders preserve those imports. Category view is provided by the index.
2. **Import fixes applied on copy** (retab only): `dropzone.tsx` now imports
   `./dropzone-core` and `./use-keyed-mount-effect` (relative) instead of `@/components/ui/…`
   and `@/hooks/…`, since those files moved with it. All other pieces import only the
   consumer's frozen base (`@/components/ui/*`), `@/lib/utils`, or npm deps.
3. **Preview convention**: the per-piece README usage snippet is the code preview; rendered
   verification happens in Phase 5 (ui-review on an example screen). Full live previews
   (Storybook-style) are out of scope and noted for a later phase if wanted.
4. **Copy-paste model**: ui-sdk is a source library, not an npm package (same model as the
   frozen base). The contract is in `docs/CONSUMPTION.md`.

## Compliance

- **Frozen base**: still 61/61 files intact in ui-workspace (unchanged by Phase 3; nothing
  was copied from the base into ui-sdk).
- **Licenses**: preserved per piece in READMEs + index (MIT × 4 registries, Apache-2.0 × 1).
- **ui-workspace** kept intact as the buildable reference + frozen base (gitignored).

## Exit criteria

- [x] `ui-sdk/components-index.md` up to date (40 rows).
- [x] README + preview per component/block.
- [x] Migration to the final tree done; layouts/templates/examples reserved.

---

**Status**: Phase 3 complete, validated by Théo on 2026-08-06. Next: Phase 4 (populate `ui-rules/`
and `patterns/` with verified sources) or Phase 5 (ui-review operational) — Théo's call.
