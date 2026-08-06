# Phase 1 report — frozen base (ui-workspace/)

> Date: August 6, 2026 · Exit criteria met: installed component list documented, **no
> modification made to any component**, green build. Nothing was copied into `ui-sdk/`.

## Decisions taken (technical, documented here)

| Decision | Choice | Why |
| --- | --- | --- |
| Base library | `radix` (`-b radix`, style `radix-nova`) | The frozen base explicitly includes **Radix UI** (mission). Not shadcn's new default `base` (base-ui) — the `base` choice would contradict the frozen-base definition. |
| Preset | `nova` (`-p nova`) | Nova = "Lucide / Geist" — matches the frozen base's Lucide icons and a neutral premium look. |
| Template | `vite` (`-t vite`) | Mirrors the future Wails frontend (React + Vite + TS). |
| Icon library | `lucide` (default of the preset) | Frozen base includes Lucide React. |
| Package manager | bun (auto-selected by the CLI, `bun.lock`) | Node 23 + npm/pnpm/bun available; bun was chosen by the CLI. Build/scripts are tool-agnostic. |
| Location | `ui-workspace/` at repo root, **gitignored** | Temporary workspace per `governance/phases.md` (Phase 1 runs outside git or on a dedicated branch). The repo is not a git repository yet; `ui-workspace/` is excluded from any future versioning. |

## Environment

- shadcn CLI **4.16.2** (verified at use: `init --help`, `add --help` — re-verification per gotcha).
- Node v23.11.0, npm 10.9.2, pnpm 10.7.1, bun 1.3.11.

## Key dependency versions (package.json)

| Package | Version |
| --- | --- |
| react / react-dom | ^19.2.6 |
| tailwindcss / @tailwindcss/vite | ^4 |
| radix-ui (unified) | ^1.6.7 |
| lucide-react | ^1.29.0 |
| shadcn | ^4.16.2 |
| class-variance-authority | ^0.7.1 |
| tailwind-merge | ^3.6.0 |
| tw-animate-css | ^1.4.0 |
| vite | ^8 |
| typescript | ~6 |

## Installed components (61, from `src/components/ui/`)

accordion, alert, alert-dialog, aspect-ratio, attachment, avatar, badge, breadcrumb, bubble,
button, button-group, calendar, card, carousel, chart, checkbox, collapsible, combobox,
command, context-menu, dialog, direction, drawer, dropdown-menu, empty, field, hover-card,
input, input-group, input-otp, item, kbd, label, marker, menubar, message, message-scroller,
native-select, navigation-menu, pagination, popover, progress, questionnaire, radio-group,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner,
switch, table, tabs, textarea, toggle, toggle-group, tooltip

Notes:

- `sonner` is the toast implementation (shadcn v4 replaced the legacy `toast` with sonner).
- `date-picker` / `data-table` from the docs pages are not separate registry items: date
  picking is covered by `calendar` + `combobox`; tables by `table` + `chart`.
- Supporting libs pulled in: `cmdk` (command), `embla-carousel-react` (carousel),
  `input-otp`, `react-day-picker` (calendar), `react-resizable-panels` (resizable),
  `recharts` (chart), `sonner`, `vaul` (drawer), `next-themes` (theme provider),
  `@base-ui/react` (used internally by some radix-base components), `@shadcn/react`
  (message-scroller, questionnaire).

## Frozen-base verification

- Components import primitives from **`radix-ui`** (unified package) — Radix base confirmed.
- Icons from **`lucide-react`** — confirmed.
- Styling: Tailwind **v4** (`@tailwindcss/vite`, `@import "tailwindcss"` in `src/index.css`,
  `shadcn/tailwind.css` import) — confirmed.
- **Zero modification**: all files are exactly as installed by the CLI (`npx shadcn@latest add --all -y`).
  The only pre-existing file touched by `init` was the standard scaffold (`button.tsx`,
  `utils.ts`, `index.css`, `theme-provider.tsx`).

## Build verification

```text
npm run build
✓ 123 modules transformed
dist/index.html         0.45 kB │ gzip:  0.29 kB
dist/assets/index.css 178.67 kB │ gzip: 25.96 kB
dist/assets/index.js  227.02 kB │ gzip: 71.79 kB
✓ built in 619ms
```

Green build, no errors, no TypeScript errors (`tsc -b` runs as part of `npm run build`).

## What Phase 1 did NOT do

- No component modified, "improved" or re-styled (frozen base, constitution principle 1).
- No block/registry harvested (Phase 2, on validation).
- Nothing copied into `ui-sdk/` (Phase 3 reorganization).
- No paid source used (100% free/open source per Théo's choice).

## Exit criteria

- [x] Installed component list documented (above).
- [x] No modification made to the installed base.
- [x] Green build.

---

**Status**: Phase 1 complete, validated by Théo on 2026-08-06 to proceed to Phase 2 (block harvest).
