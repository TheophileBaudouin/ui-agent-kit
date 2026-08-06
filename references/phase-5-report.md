# Phase 5 report — ui-review operational on the SDK

> Date: August 6, 2026 · Exit criterion met: **a successful test review on an example screen**.

## What was done

1. Built an example screen — **Preferences** (desktop, Wails-ready) — in `ui-workspace/`,
   composing the frozen base (Sidebar, Button, tokens) with the harvested kit
   (`settings-preferences/notifications/security` from hextaui, `command-menu-02` from
   blocks-so), following `ui-rules/` and the settings-page pattern.
2. Ran the `ui-review` skill checklist (11 points) against it — literally, per
   `skills/ui-review/SKILL.md`.
3. Fixed every non-compliance found (in both `ui-workspace/` and the canonical `ui-sdk/`
   copies), re-verified: **build green, frozen base 61/61 intact**.
4. Published the example to `ui-sdk/examples/preferences-screen/`.

## The review (ui-review skill, output format)

```text
## Findings

- ✅ Compliant — 01-spacing: 8px gaps (gap-2), 20px group rhythm (space-y-5), 20px margins (p-5).
- ✅ Compliant — 02-colors: semantic tokens only, no hex; dark mode via tokens.
- ❌ Non-compliant — 03-typography: harvested block command-menu-02 used text-[15px]
  (arbitrary size, off-scale) → FIXED to text-sm (ui-rules/03, rule 1).
- ✅ Compliant — 04-animations: no custom animation; base handles prefers-reduced-motion.
- ✅ Compliant — 05-accessibility: aria-current on active nav, panel receives focus on
  category switch (tabIndex=-1), trigger has visible label, base handles focus ring.
- ✅ Compliant — 06-layout: sidebar + content shell per ui-rules/06; cross-screen navigation
  documented as HashRouter-only (ui-rules/09).
- ❌ Non-compliant — 07-icons: command-menu-02 imported @tabler/icons-react (mixed icon
  library, ui-rules/07 rule 1) → FIXED to lucide-react equivalents (18 icons renamed;
  also removes the @tabler dependency for consumers).
- ✅ Compliant — 08-keyboard: Cmd+1/2/3 category switching (registered once), Cmd+K handled
  by the command block, Esc handled by the base Dialog.
- ✅ Compliant — 09-desktop: toolbar with search trigger, sidebar, resizable shell.
- ❌ Non-compliant — 10-dialogs: command-menu-02 auto-opened on mount (useState(true)) —
  intrusive, violates "don't interrupt unnecessarily" (ui-rules/10, rule 4) → FIXED to
  useState(false) in both copies.
- ⚠️ To verify — 11-product-context: ux/ is still empty (Phase 0 skeleton); the example is
  not a real product screen, so personas/flows don't apply yet — expected at this stage.
- ⚠️ To verify — shortcut discoverability: Cmd+1/2/3 has no visible Kbd hint; real apps must
  document shortcuts in ux/shortcuts.md (removed the meaningless data-shortcut attribute).

## Summary
8 compliant, 3 non-compliant (all fixed), 2 to verify (expected/deferred).
```

## Fixes applied (all in harvested/example code — frozen base untouched)

| Fix | File (both copies) | Rule |
| --- | --- | --- |
| `text-[15px]` → `text-sm` | `command-menu-02.tsx` | ui-rules/03 |
| `@tabler/icons-react` → `lucide-react` (18 icons renamed) | `command-menu-02.tsx` | ui-rules/07 |
| `useState(true)` → `useState(false)` (no auto-open on mount) | `command-menu-02.tsx` | ui-rules/10 |
| Removed `data-shortcut` (no visible hint) | `preferences-screen.tsx` (example) | ui-rules/08 |

Every fix was applied to `ui-workspace/` (buildable) **and** `ui-sdk/` (canonical copy),
keeping the two in sync. `ui-workspace` build re-verified green; frozen base hash-checked
61/61 unchanged.

## Also addressed

- **LSP false positives on ui-sdk/** (expected: source library without node_modules/tsconfig
  — imports resolve in the consumer). Documented in `ui-sdk/docs/CONSUMPTION.md` and excluded
  from diagnostics via `.pi-lens.json` (`ignore: ["ui-sdk/**"]`). Verification channel =
  the `ui-workspace/` mirror.
- **Example published**: `ui-sdk/examples/preferences-screen/preferences-screen.tsx`
  (populates the reserved `examples/` folder).

## Exit criteria

- [x] A successful test review on an example screen (3 real non-compliances found and fixed).
- [x] The ui-review skill is operational: it found real issues and they were resolved.

---

**Status**: Phase 5 complete, validated by Théo on 2026-08-06. Remaining optional phase: **Phase 6**
(continuous constitution-compliance audit skill) — only if Théo wants it.
