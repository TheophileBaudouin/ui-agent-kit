#!/usr/bin/env node
// ui-agent-kit — single-command installer for the desktop UI SDK.
// Usage:
//   npx ui-agent-kit [install] [flags]   install or refresh the SDK in the current project
//   npx ui-agent-kit update [--force]    re-run install when a newer SDK version exists
//   npx ui-agent-kit doctor              check prerequisites and report problems
// Flags: --yes | --skip-base | --skip-deps | --target <dir> | --force | --version | --help
// Zero runtime dependencies: node builtins only (>=18.17).
//
// Robustness contract: install NEVER aborts because of consumer-side state —
// peer-dependency conflicts (deps step tolerates + skips), a lockfile-picked
// package manager that is not installed (falls back to npm), or the consumer's
// own src/ files (import self-check only vets the kit's copies).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { log, elapsed } from "./lib/log.js";
import { detectPackageManager, findFrontendRoot, hasViteReact, nodeVersionOk, pmAvailable } from "./lib/env.js";
import { applyCopyRules, verifyImports } from "./lib/copy.js";
import { installDeps, isInstalled } from "./lib/deps.js";
import { ensureBase, baseInstalled } from "./lib/base.js";
import { applyConfigs } from "./lib/configs.js";
import { readInstalled, writeInstalled, readPackageManifest, packageVersion, MANIFEST_FILE } from "./lib/manifest.js";

const CLI_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.dirname(CLI_DIR);
const KIT_DIR_NAME = "ui-kit";

const USAGE = `ui-agent-kit — install the desktop UI SDK (components, rules, patterns, skills) into a Wails/Vite app.

Usage:
  npx ui-agent-kit [install] [flags]   install or refresh the SDK (default command)
  npx ui-agent-kit update [flags]      re-run install when a newer SDK version exists
  npx ui-agent-kit doctor              check prerequisites and report problems

Flags:
  -y, --yes           non-interactive (default — all steps run automatically)
      --skip-base     do not install the shadcn frozen base (already present, or manual)
      --skip-deps     do not install SDK npm dependencies
      --target <dir>  project directory (default: current directory; Wails frontend/ is auto-detected)
      --force         update even when the installed version matches
  -v, --version       print the CLI version
  -h, --help          show this help

What install does (all steps idempotent, existing files never deleted):
  1. copy SDK code to src/ and knowledge (rules/patterns/ux/skills/docs) to ui-kit/
  2. install the shadcn frozen base when missing (radix-nova, 60 components)
  3. install the SDK npm dependencies via your package manager (npm/pnpm/bun/yarn)
  4. wire .pi/settings.json skills and create missing vite/tsconfig configs
  5. write ui-kit/.ui-agent-kit.json and verify every @/ import resolves
`;

function parseArgs(argv) {
  const opts = { command: "install", target: null, skipBase: false, skipDeps: false, force: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "-v":
      case "--version":
        opts.version = true;
        break;
      case "-y":
      case "--yes":
        break; // non-interactive is the default
      case "--skip-base":
        opts.skipBase = true;
        break;
      case "--skip-deps":
        opts.skipDeps = true;
        break;
      case "--force":
        opts.force = true;
        break;
      case "--target":
        opts.target = argv[++i];
        if (!opts.target) throw new Error("--target requires a directory");
        break;
      default:
        if (arg.startsWith("-")) throw new Error(`unknown flag: ${arg}`);
        positional.push(arg);
    }
  }
  if (positional.length > 0) opts.command = positional[0];
  return opts;
}

/** Locate the consumer project root: --target, else cwd; frontend/ is auto-detected. */
function locateProject(opts) {
  const target = opts.target ? path.resolve(opts.target) : process.cwd();
  // Wails apps keep the frontend in frontend/; bare Vite apps live at the root.
  const frontendRoot = findFrontendRoot(target) ?? (fs.existsSync(path.join(target, "package.json")) ? target : null);
  if (!frontendRoot) {
    throw new Error(
      `no package.json found in ${target} (checked root and frontend/) — run this inside a Node project (or pass --target <dir>)`,
    );
  }
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(frontendRoot, "package.json"), "utf8"));
  } catch (err) {
    throw new Error(`cannot read ${path.join(frontendRoot, "package.json")}: ${err.message}`);
  }
  if (!hasViteReact(pkg)) {
    log.warn("no Vite + React setup detected — the kit targets Wails/Vite apps");
  }
  return { target, frontendRoot, pkg };
}

/** The copy rules live in the generated manifest (see cli/generate-manifest.js). */

async function runInstall(opts) {
  const started = Date.now();
  const { frontendRoot } = locateProject(opts);
  // Package-manager priority comes from the lockfiles (bun > pnpm > yarn > npm);
  // a lockfile-picked PM that is NOT installed falls back to npm instead of
  // aborting the install.
  let pm = detectPackageManager(frontendRoot);
  if (!pmAvailable(pm)) {
    log.warn(`${pm} detected (lockfile) but not installed — falling back to npm`);
    pm = "npm";
  }
  const manifest = readPackageManifest(CLI_DIR);
  const uiKitDir = path.join(frontendRoot, KIT_DIR_NAME);

  log.info(`project: ${frontendRoot}`);
  log.info(`package manager: ${pm}`);
  log.info(`SDK version: ${manifest.version}`);

  // 1 — copy
  const { copiedFiles } = applyCopyRules(PKG_ROOT, frontendRoot, manifest.copyRules);

  // 2 — import self-check on the files the kit just copied (the consumer's own
  // src/ is never scanned — their state must not block the install).
  const { errors, warnings } = verifyImports(frontendRoot, copiedFiles);
  for (const w of warnings) log.warn(w);
  if (errors.length > 0) {
    for (const e of errors) log.error(e);
    throw new Error(
      `${errors.length} @/ import${errors.length === 1 ? "" : "s"} unresolved — the SDK copy is inconsistent; run doctor`,
    );
  }
  log.ok("all @/ imports resolve");

  // 3 — frozen base (unless skipped)
  const base = ensureBase(frontendRoot, { skip: opts.skipBase });

  // 4 — dependencies (unless skipped; never aborts on resolution conflicts)
  if (!opts.skipDeps) {
    installDeps(frontendRoot, pm, manifest.deps);
  } else {
    log.warn("dependency install skipped (--skip-deps)");
  }

  // 5 — configuration
  applyConfigs(frontendRoot);

  // 6 — installed manifest
  writeInstalled(uiKitDir, { version: manifest.version, frontendRoot, pm });
  log.ok(`wrote ${KIT_DIR_NAME}/${MANIFEST_FILE}`);

  let baseNote;
  if (!base.installed) {
    baseNote =
      base.reason === "skipped"
        ? " (base skipped — install it manually: npx shadcn@latest add --all)"
        : " (base failed — see error above, kit needs it to compile)";
  } else {
    baseNote = "";
  }

  log.step("Done");
  log.ok(`ui-agent-kit ${manifest.version} installed in ${frontendRoot}${baseNote}`);
  log.dim(`next: read ui-kit/AGENTS.md and ui-kit/ui-sdk/docs/CONSUMPTION.md`);
  log.dim(`re-run anytime to refresh; use "npx ui-agent-kit update" or "doctor"`);
  log.dim(`finished in ${elapsed(started)}`);
}

async function runUpdate(opts) {
  const { frontendRoot } = locateProject(opts);
  const current = readPackageManifest(CLI_DIR).version;
  const installed = readInstalled(path.join(frontendRoot, KIT_DIR_NAME));

  if (installed && installed.version === current && !opts.force) {
    log.ok(`ui-agent-kit ${current} is already installed and up to date`);
    log.dim(`run with --force to refresh the SDK files anyway`);
    return;
  }
  if (installed && installed.version !== current) {
    log.info(`updating ui-agent-kit ${installed.version} → ${current}`);
  } else {
    log.info(`no previous install found — running a fresh install`);
  }
  await runInstall({ ...opts, command: "install" });
}

async function runDoctor(opts) {
  log.step("ui-agent-kit doctor");
  const ok = (m) => log.ok(m);
  const bad = (m) => log.error(m);
  const warn = (m) => log.warn(m);

  // node
  if (nodeVersionOk()) ok(`node ${process.version} (>= 18)`);
  else bad(`node ${process.version} — need >= 18`);

  // project
  try {
    const { frontendRoot, pkg } = locateProject(opts);
    ok(`project detected: ${frontendRoot}`);
    if (hasViteReact(pkg)) ok("Vite + React present");
    else warn("no Vite + React setup detected");

    // base
    if (baseInstalled(frontendRoot)) ok("shadcn frozen base installed");
    else warn("frozen base missing — run install (or: npx shadcn@latest add --all)");

    // configs
    const vite = ["vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.mts"].find((f) =>
      fs.existsSync(path.join(frontendRoot, f)),
    );
    if (vite) {
      const content = fs.readFileSync(path.join(frontendRoot, vite), "utf8");
      if (/base\s*:\s*["']\.\//.test(content)) ok(`vite base "./" (${vite})`);
      else warn(`vite config lacks base: "./" (${vite})`);
    } else warn("no vite config found");

    const tsconfig = path.join(frontendRoot, "tsconfig.json");
    if (fs.existsSync(tsconfig)) {
      const content = fs.readFileSync(tsconfig, "utf8");
      if (/"@\/\*"/.test(content)) ok('tsconfig @/* alias present');
      else warn('tsconfig lacks "@/*": ["./src/*"] paths');
    } else warn("no tsconfig.json");

    // installed manifest
    const installed = readInstalled(path.join(frontendRoot, KIT_DIR_NAME));
    const current = readPackageManifest(CLI_DIR).version;
    if (installed) {
      if (installed.version === current) ok(`ui-kit installed (v${current})`);
      else warn(`ui-kit at v${installed.version}, CLI at v${current} — run "npx ui-agent-kit update"`);
    } else warn("ui-kit not installed — run: npx ui-agent-kit");

    // deps
    const missing = readPackageManifest(CLI_DIR).deps.filter((d) => !isInstalled(frontendRoot, d));
    if (missing.length === 0) ok("all SDK dependencies installed");
    else warn(`missing dependencies: ${missing.join(", ")}`);
  } catch (err) {
    bad(err.message);
  }
  log.dim("doctor is read-only — nothing was modified");
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    log.error(err.message);
    console.log(USAGE);
    process.exit(2);
  }

  if (opts.help) {
    console.log(USAGE);
    return;
  }
  if (opts.version) {
    console.log(packageVersion(PKG_ROOT));
    return;
  }
  if (!nodeVersionOk()) {
    log.error(`node ${process.version} is too old — ui-agent-kit needs node >= 18`);
    process.exit(1);
  }

  try {
    if (opts.command === "install") await runInstall(opts);
    else if (opts.command === "update") await runUpdate(opts);
    else if (opts.command === "doctor") await runDoctor(opts);
    else throw new Error(`unknown command: ${opts.command}`);
  } catch (err) {
    log.error(err.message);
    console.log(`\n${USAGE}`);
    process.exit(1);
  }
}

main();
