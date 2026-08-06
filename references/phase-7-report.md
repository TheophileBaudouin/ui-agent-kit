# Phase 7 report — single-command installer (npx ui-agent-kit)

Date: 2026-08-07 · Status: ✅ done, pushed (`e154645`), published on npm
Decision: executed at Théo's request (mission: "install, configure and maintain with a single command").

## Goal

Any new user installs, configures and maintains the SDK with **one command**, on
Windows/macOS/Linux, with minimal prerequisites, updatable without breaking existing projects.

## Decisions (asked to Théo via ask_user, answered 2026-08-06)

| Decision | Chosen | Alternatives considered |
| --- | --- | --- |
| Command name | `ui-agent-kit` (matches product/repo) | `ui-kit`, `desktop-ui-kit` |
| Invocation model | **`npx ui-agent-kit`** — published npm package with `bin` | `npm create` (scaffold-only), devDependency+script (two-step) |
| Consumer file layout | **Split**: whole `sdk/` mirrored to `ui-kit/` + code into `src/` | single `ui-kit/` (breaks `@/` imports), all under `src/` |
| Install scope | **Full auto** (base + deps + configs, detect & skip if present) | content-only, interactive wizard |

## Architecture

- Zero-dependency Node CLI (`node >= 18.17`), node builtins only — nothing to install beyond Node itself.
- `bin` → `cli/index.js`; subcommands `install` (default) / `update` / `doctor`.
- `cli/manifest.json` is **generated** from the SDK's actual `.tsx` imports
  (`npm run manifest`) — new pieces propagate their deps and copy rules automatically.
- Copy model: one rule mirrors the **entire `sdk/`** to `ui-kit/` (reference, hidden files
  included) + 3 rules copy code to `src/` (`components/<origin>`, flat blocks-so, example).
- Steps: detect env (Wails `frontend/` auto-detected, PM from lockfile) → copy → import
  self-check (every `@/` import must resolve) → frozen base (shadcn `add --all`, radix-nova
  `components.json` only written when missing) → deps via detected PM → configs
  (`.pi/settings.json` merged, vite/tsconfig created only when missing, existing configs
  never edited) → version manifest `ui-kit/.ui-agent-kit.json`.
- Idempotent: re-running never deletes consumer files (add/overwrite only).

## Verification

- 11 end-to-end tests (node:test, temp fixtures, no network): layout, `.pi` merge, version
  manifest, idempotency, `update --force`, import self-check, base-skip warning, Wails
  `frontend/` detection, non-project error, `--version`/`--help`.
- Real smoke test on a Wails layout (`frontend/`): 237 files installed, all imports resolve.
- `npm pack --dry-run`: payload = `cli/` + `sdk/` + README.

## Follow-ups

- Fix found by smoke test: `frontend/` layout rejected before detection (fixed, regression
  test added).
- Fix from Théo's report: the 15-rule copy whitelist missed hidden SDK files → whole-folder
  mirror (commit `e154645`).
- npm publish runs `prepublishOnly` (manifest + tests). Package name availability verified.
