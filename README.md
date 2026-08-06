# ui-agent-kit

![Node](https://img.shields.io/badge/node-%3E%3D18.17-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![npm](https://img.shields.io/npm/v/ui-agent-kit)](https://www.npmjs.com/package/ui-agent-kit)

**Premium desktop UI kit for Wails apps** (Go + React). Components, interface rules,
screen patterns and AI design skills — installed, configured and kept up to date with a
single command:

```bash
npx ui-agent-kit
```

Built on the shadcn/ui frozen base (Radix + Tailwind + Lucide), the kit is a
copy-paste source library you own: no runtime dependency on the kit itself.

## Features

- **One-command install** — copies the SDK, installs the frozen base and dependencies,
  wires your configs, and verifies every import.
- **40 license-verified components & blocks** — charts, settings, upload, auth, marketing
  sections, full page blocks (MIT / Apache-2.0, provenance per piece).
- **10 interface rules + 8 screen patterns** — spacing, color, typography, accessibility,
  keyboard, desktop — every rule cites a verified source (Apple HIG, WCAG 2.2, Vercel…).
- **AI design skills** — `ux-memory`, `ui-review` and design-system references, wired into
  your `.pi/settings.json` automatically.
- **Idempotent & safe** — re-running install/update never deletes a consumer file.
- **Cross-platform** — Windows, macOS, Linux. Zero-dependency Node CLI (node builtins only).

## Prerequisites

| Requirement | How to check |
| --- | --- |
| **Node.js ≥ 18.17** (ships with npm/npx) | `node --version` |
| A **target project**: a Wails v2/v3 app with a Vite + React + TypeScript frontend — or any Vite + React project | `package.json` with `vite` + `react` |

That's it. The installer detects your package manager (npm, pnpm, bun or yarn, from the
lockfile) and your project layout (a Wails `frontend/` folder is picked up automatically),
installs the shadcn frozen base when missing, and installs the SDK dependencies itself.
Install Node from [nodejs.org](https://nodejs.org) if you don't have it yet.

## Quick start

Run inside your frontend project (a Wails app's `frontend/` folder, or any Vite project):

```bash
npx ui-agent-kit          # install or refresh the SDK
npx ui-agent-kit update   # refresh when a newer version is published
npx ui-agent-kit doctor   # check prerequisites (read-only)
```

### What `npx ui-agent-kit` does

1. **Copies the SDK** — components/blocks into `src/`, knowledge (rules, patterns, UX,
   skills, docs) into `ui-kit/`.
2. **Verifies imports** — every `@/` import in the copied code is checked; a broken copy
   fails with an explicit error instead of a silent misbuild.
3. **Installs the frozen base** when missing — `npx shadcn@latest add --all` (radix-nova
   style, ~60 components; a `components.json` template is written only if you have none).
4. **Installs SDK dependencies** via your package manager.
5. **Wires configuration** — merges your `.pi/settings.json` (SDK skills), creates
   `vite.config.ts`/`tsconfig.json` only when missing, and warns (never edits) about
   missing `base: "./"` or the `@/` alias in existing configs.

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
| `-v, --version` / `-h, --help` | Version / usage |

### What gets installed

The **entire `sdk/` folder is mirrored to `ui-kit/`** (reference copy — nothing is left
out, hidden configs included), and the code pieces are copied into `src/` so imports work:

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

## Updating & removing

- **Update** — `npx ui-agent-kit update` compares the installed version
  (`ui-kit/.ui-agent-kit.json`) with the latest and refreshes the SDK files
  (overwrites kit files only, never consumer files).
- **Re-run safely** — `npx ui-agent-kit` anytime; it's idempotent.
- **Remove** — delete the `ui-kit/` folder and the kit folders under
  `src/components/` (`evilcharts`, `hextaui`, `retab`, `shadcncraft`, the flat
  blocks-so files, `example/`). Your frozen base and your own code are untouched.

## What's inside

| Folder | Role |
| --- | --- |
| `sdk/` | **The SDK** (own AGENTS.md + configs): components/blocks (`ui-sdk/`), interface rules (`ui-rules/`), screen patterns (`patterns/`), design memory (`ux/`), dev skills (`skills/`), docs (Wails constraints, design systems, authoring guides) |
| `cli/` | The installer: zero-dependency Node CLI (`install`/`update`/`doctor`), generated `manifest.json` |
| `governance/` | The meta-project's rules: constitution, phases, parallel work |
| `references/` | Research log, phase reports, Wails constraints source notes, audit |
| `skills/` | Meta-level skill: `meta-audit` (recurring project audit) |
| `ui-workspace/` | Temporary buildable mirror (frozen base) — gitignored, used to verify SDK pieces |

## Development

```bash
git clone https://github.com/TheophileBaudouin/ui-agent-kit.git
cd ui-agent-kit

npm run manifest   # regenerate cli/manifest.json from the SDK's actual imports
npm test           # end-to-end suite against temp fixtures (no network)
npm run verify     # manifest freshness + tests
```

- **Adding a piece to the SDK?** Drop it in `sdk/ui-sdk/` and run `npm run manifest` —
  the installer picks up its dependencies and copy rules automatically.
- **Trying the CLI locally** before publishing: `npm link` then `npx ui-agent-kit`.
- **Publishing** — `npm publish` (runs `prepublishOnly`: manifest + tests). Until the
  package is live on npm, `npx ui-agent-kit` runs the same code from this repository.

## License

MIT (as declared in `package.json`). SDK pieces retain their per-piece licenses
(MIT / Apache-2.0) — see `sdk/ui-sdk/components-index.md` for provenance. The frozen
base (shadcn/ui) is MIT.
