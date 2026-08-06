# ui-agent-kit

![npm version](https://img.shields.io/npm/v/ui-agent-kit)
![node](https://img.shields.io/badge/node-%3E%3D18.17-brightgreen)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![license](https://img.shields.io/npm/l/ui-agent-kit)

**Premium desktop UI kit for Wails apps** (Go + React) — components, interface rules,
screen patterns and AI design skills, installed, configured and kept up to date with a
single command:

```bash
npx ui-agent-kit
```

Built on top of the shadcn/ui frozen base (Radix UI + Tailwind CSS + Lucide React), the kit
is a **copy-paste source library you own**: it ships source files, not a runtime
dependency. No subscription, no build step, no lock-in — your app keeps its own copies.

## Table of contents

- [Why this kit](#why-this-kit)
- [Features](#features)
- [How it works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [What gets installed](#what-gets-installed)
- [What's in the kit](#whats-in-the-kit)
- [Updating and removing](#updating-and-removing)
- [Troubleshooting](#troubleshooting)
- [Repository layout](#repository-layout)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why this kit

Wails desktop apps need a **premium, consistent, accessible UI** without reinventing every
screen. `ui-agent-kit` packages what a senior frontend would keep in their head:

- **40 license-verified components & blocks** harvested from the best open-source
  registries, each with provenance and a per-piece README;
- **10 interface rules + 8 screen patterns** distilled from Apple HIG, WCAG 2.2 and Vercel
  design guidelines — every rule cites its source;
- **AI design skills** (`ux-memory`, `ui-review`, shadcn, design-system references) that
  guide and review your frontend as you build it;
- a **hard Wails contract**: static-only build, hash routing, `@wailsio/runtime` — so
  every piece works in a desktop webview, not just a browser tab.

The result: a Wails app that looks and behaves like a native desktop product, built from
vetted building blocks instead of guesswork.

## Features

- **One-command install** — copies the SDK, installs the frozen base and dependencies,
  wires your configs, and verifies every `@/` import before finishing.
- **Idempotent & safe** — re-running `install`/`update` never deletes a consumer file.
- **Auto-detection** — package manager (npm / pnpm / bun / yarn) from the lockfile, Wails
  `frontend/` layout, missing frozen base, missing configs.
- **Updatable without breaking** — a version manifest (`ui-kit/.ui-agent-kit.json`) lets
  `update` refresh the SDK in place; your own code and the frozen base stay untouched.
- **Cross-platform** — Windows, macOS, Linux. Zero-dependency Node CLI (builtins only):
  nothing to install beyond Node itself.
- **Evolvable by design** — the installer's manifest is generated from the SDK's actual
  imports: adding a piece to the SDK automatically propagates its dependencies.

## How it works

`npx ui-agent-kit` runs 5 steps, each idempotent:

1. **Copy** — the entire `sdk/` folder is mirrored to `ui-kit/` in your project (reference
   copy, hidden configs included), and the code pieces are copied into `src/` so the
   `@/` imports resolve.
2. **Verify** — every `@/` import in the copied code is resolved; a broken copy fails with
   an explicit error instead of a silent misbuild.
3. **Frozen base** — when missing, installs shadcn/ui (radix-nova style, ~60 components)
   via `npx shadcn@latest add --all`; a `components.json` template is written only if you
   have none (never overwritten).
4. **Dependencies** — installs the SDK's declared deps (echarts, motion, recharts,
   react-medium-image-zoom, @tabler/icons-react) with your package manager.
5. **Configuration** — merges your `.pi/settings.json` (SDK skills), creates
   `vite.config.ts` / `tsconfig.json` only when missing, and **warns but never edits**
   existing configs (e.g. missing `base: "./"` or the `@/` alias).

## Prerequisites

| Requirement | How to check |
| --- | --- |
| **Node.js ≥ 18.17** (ships with npm/npx) | `node --version` |
| A **target project**: a Wails v2/v3 app with a Vite + React + TypeScript frontend — or any Vite + React project | `package.json` with `vite` + `react` |

That's all. The installer detects everything else (package manager, `frontend/` layout,
missing base) and acts with sensible defaults. No Node? Install it from
[nodejs.org](https://nodejs.org) (or `nvm` / `fnm`).

## Quick start

Run inside your frontend project — a Wails app's `frontend/` folder, or any Vite project:

```bash
npx ui-agent-kit          # install or refresh the SDK
npx ui-agent-kit update   # refresh when a newer version is published
npx ui-agent-kit doctor   # check prerequisites (read-only)
```

First run:

```text
▸ Copying the SDK
  ✔ 237 SDK files in place (code → src/, reference → ui-kit/)
  ✔ all @/ imports resolve
▸ Wiring configuration
  ✔ wired SDK skills into .pi/settings.json
▸ Done
  ✔ ui-agent-kit 0.1.0 installed in /path/to/frontend
```

### Flags

| Flag | Effect |
| --- | --- |
| `--skip-base` | Don't install the shadcn frozen base (already present, or manual) |
| `--skip-deps` | Don't install SDK npm dependencies |
| `--target <dir>` | Project directory (default: current directory) |
| `--force` | `update` refreshes even when the installed version matches |
| `-y, --yes` | Non-interactive (default — all steps run automatically) |
| `-v, --version` / `-h, --help` | Print version / usage |

## What gets installed

The **entire `sdk/` folder is mirrored to `ui-kit/`** (reference copy — nothing left out,
hidden configs included), and the code pieces are copied into `src/` so imports work:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # your frozen base (installed by shadcn, not by the kit)
│   │   ├── evilcharts/    # kit pieces, per origin (usable copy)
│   │   ├── hextaui/
│   │   ├── retab/
│   │   ├── shadcncraft/
│   │   ├── command-menu-02.tsx   # blocks-so (flat)
│   │   └── example/       # the Preferences example screen
│   └── lib/utils.ts       # @/lib/utils, provided by the frozen base
├── ui-kit/                # full SDK mirror: ui-sdk/, ui-rules/, patterns/, ux/,
│                          #   skills/, docs/, .pi/, configs — read & keep this
├── .pi/settings.json      # SDK skills wired in (merged, never clobbered)
└── components.json        # frozen-base config (only written when missing)
```

`ui-kit/` is the reference you read; `src/` is the code you build and own. The installer
only adds/overwrites its own files — it never edits or deletes consumer files.

## What's in the kit

| Area | Location in `ui-kit/` | Contents |
| --- | --- | --- |
| Components & blocks | `ui-sdk/components/`, `ui-sdk/blocks/` | 40 license-verified pieces by origin (evilcharts charts, hextaui settings/auth/billing, retab upload, shadcncraft marketing, blocks-so page blocks) + `components-index.md` |
| Interface rules | `ui-rules/` | 10 rules: spacing, colors, typography, animations, accessibility, layout, icons, keyboard, desktop, dialogs — each citing its source |
| Screen patterns | `patterns/` | 8 recurring screens: settings-page, dashboard, wizard, login, file-explorer, preferences, search, table |
| Design memory | `ux/` | Personas, user flows, navigation, screens, shortcuts, design decisions |
| AI skills | `skills/` | `ux-memory`, `ui-review`, shadcn, frontend-design, web/macos platform guidelines |
| Docs | `docs/` | Wails constraints (static build), design-systems sourcing, authoring guides |

Start with `ui-kit/AGENTS.md` and `ui-kit/ui-sdk/docs/CONSUMPTION.md` — they are the rules
and the contract every piece follows.

## Updating and removing

- **Update** — `npx ui-agent-kit update` compares the installed version
  (`ui-kit/.ui-agent-kit.json`) with the latest and refreshes the SDK files in place
  (overwrites kit files only, never consumer files).
- **Re-run safely** — `npx ui-agent-kit` anytime; every step is idempotent.
- **Remove** — delete the `ui-kit/` folder and the kit folders under `src/components/`
  (`evilcharts`, `hextaui`, `retab`, `shadcncraft`, the flat blocks-so files, `example/`).
  Your frozen base and your own code are untouched.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `no package.json found` | You ran it outside a Node project, or the target isn't detected — run inside the frontend (or Wails `frontend/`) folder, or pass `--target <dir>` |
| `shadcn add failed` | The frozen base couldn't install (network, registry) — retry manually: `npx shadcn@latest add --all` |
| `N @/ imports unresolved` | The SDK copy is inconsistent (broken rule) — re-run `npx ui-agent-kit update --force`, then `doctor` |
| `missing dependencies: …` (doctor) | The SDK deps aren't installed — run `npx ui-agent-kit` without `--skip-deps` |
| Vite builds but blank screen in Wails | `base: "./"` missing or history routing used — see `ui-kit/docs/wails-constraints.md`, use `HashRouter` |
| Editor can't resolve `react`/`lucide-react` in `ui-kit/` | Expected: `ui-kit/` is a source library without `node_modules`; imports resolve only in `src/` |

Still stuck? Run `npx ui-agent-kit doctor` — it reports each prerequisite and dependency
with a pass/fail status.

## Repository layout

| Folder | Role |
| --- | --- |
| `sdk/` | **The SDK** (own AGENTS.md + configs): components/blocks (`ui-sdk/`), interface rules (`ui-rules/`), screen patterns (`patterns/`), design memory (`ux/`), dev skills (`skills/`), docs |
| `cli/` | The installer: zero-dependency Node CLI (`install`/`update`/`doctor`), generated `manifest.json`, e2e tests |
| `governance/` | The meta-project's rules: constitution, phases roadmap, parallel work |
| `references/` | Research log, phase reports, Wails constraints source notes, audit reports |
| `skills/` | Meta-level skill: `meta-audit` (recurring project audit) |
| `ui-workspace/` | Temporary buildable mirror (frozen base) — gitignored, used to verify SDK pieces |

> The **npm package ships `cli/` + `sdk/`** (+ README, LICENSE). The remaining folders
> (`governance/`, `references/`, `skills/`, `ui-workspace/`) are the meta-project — they
> exist in the repository only.

## Development

```bash
git clone https://github.com/TheophileBaudouin/ui-agent-kit.git
cd ui-agent-kit

npm run manifest   # regenerate cli/manifest.json from the SDK's actual imports
npm test           # end-to-end suite against temp fixtures (no network)
npm run verify     # manifest freshness + tests
```

- **Adding a piece to the SDK?** Drop it in `sdk/ui-sdk/` and run `npm run manifest` — the
  installer picks up its dependencies and copy rules automatically.
- **Testing unpublished CLI changes** locally: `npm link`, then run `npx ui-agent-kit`.
- **Publishing** — `npm publish` (runs `prepublishOnly`: manifest + tests; the account
  uses passkey 2FA — a Touch ID approval is required).

## Contributing

- **Rules first**: this kit is governance-driven. Read `AGENTS.md` and
  `governance/constitution.md` before contributing.
- **Never touch the frozen base** (shadcn/Radix/Tailwind/Lucide). New work ships as a
  newly named piece (`PremiumButton`, `DesktopButton`…) with a sourced justification.
- **Every rule cites a source** (official design system or verified skill) — an unsourced
  rule is not written.
- **State files reflect reality**: after any executed phase, update `AGENTS.md`,
  `governance/phases.md` and trace the validation in `references/`.

## License

MIT (as declared in `package.json`). SDK pieces retain their per-piece licenses
(MIT / Apache-2.0) — see `sdk/ui-sdk/components-index.md` for provenance. The frozen base
(shadcn/ui) is MIT.
T.
