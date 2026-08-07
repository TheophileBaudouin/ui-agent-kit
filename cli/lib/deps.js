// Dependency installation: installs the SDK's declared deps with the detected
// package manager. The dep list comes from cli/manifest.json (generated from the
// actual imports in sdk/ui-sdk, so new pieces propagate automatically).
//
// Resilient by contract: this step NEVER aborts the install. npm/pnpm hard-fail
// on peer-dependency conflicts (ERESOLVE) — including conflicts that pre-exist
// in the consumer project and have nothing to do with the kit (e.g. a Vite
// plugin peer mismatch, or a Tailwind 3 project where tw-shimmer wants
// tailwindcss >= 4). Strategy: batch install → retry with tolerant peer
// resolution → install each package individually, skipping failures with a
// warning. The kit is copy-paste code: a missing dep is a warning (doctor
// reports it), not a reason to block the whole install.

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

import { log } from "./log.js";
import { cmdName } from "./env.js";

const INSTALL_ARGS = {
  npm: ["install", "--no-audit", "--no-fund"],
  pnpm: ["add"],
  bun: ["add"],
  yarn: ["add"],
};

// Flags that relax peer-dependency resolution per package manager (npm/pnpm
// fail hard by default on ANY peer conflict; bun/yarn are lenient or warn).
const TOLERANCE_ARGS = {
  npm: ["--legacy-peer-deps"],
  pnpm: ["--config.strict-peer-dependencies=false"],
  bun: [],
  yarn: [],
};

/** Run one package-manager invocation; never throws. */
function runPm(pm, args, cwd) {
  const result = spawnSync(cmdName(pm), args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    return { ok: false, reason: result.error.code === "ENOENT" ? "missing" : "spawn" };
  }
  if (result.status !== 0) return { ok: false, reason: `exit ${result.status}` };
  return { ok: true };
}

/** Install the manifest deps with the given package manager. Never throws. */
export function installDeps(frontendRoot, pm, deps) {
  if (deps.length === 0) {
    log.ok("no extra dependencies required");
    return;
  }
  log.step("Installing SDK dependencies");
  log.dim(`package manager: ${pm}`);
  log.dim(`packages: ${deps.join(", ")}`);

  const installArgs = INSTALL_ARGS[pm] ?? INSTALL_ARGS.npm;
  const tolerance = TOLERANCE_ARGS[pm] ?? [];

  // 1 — batch install with the PM defaults.
  const batch = runPm(pm, [...installArgs, ...deps], frontendRoot);
  if (batch.ok) {
    log.ok(`installed ${deps.length} package${deps.length === 1 ? "" : "s"} via ${pm}`);
    return;
  }
  if (batch.reason === "missing") {
    log.warn(`${pm} is not installed — SDK dependencies were NOT installed (install ${pm}, or use --skip-deps)`);
    return;
  }

  // 2 — peer-conflict retry with tolerant resolution (the common killer).
  if (tolerance.length > 0) {
    log.warn(
      `${pm} dependency resolution failed — retrying with tolerant peer resolution (${tolerance.join(" ")})`,
    );
    const retry = runPm(pm, [...installArgs, ...tolerance, ...deps], frontendRoot);
    if (retry.ok) {
      log.ok(`installed ${deps.length} package${deps.length === 1 ? "" : "s"} via ${pm}`);
      return;
    }
  }

  // 3 — install each package individually, skipping failures with a warning.
  // A failing package is a warn (doctor reports it), never a blocked install.
  log.warn("batch install failed — installing packages individually (failures are skipped)");
  const failed = [];
  for (const dep of deps) {
    const attempt = runPm(pm, [...installArgs, ...tolerance, dep], frontendRoot);
    if (attempt.ok) continue;
    failed.push(dep);
  }

  if (failed.length === 0) {
    log.ok(`installed ${deps.length} package${deps.length === 1 ? "" : "s"} via ${pm} (individual resolution)`);
  } else {
    log.warn(`could not install: ${failed.join(", ")}`);
    log.dim(`retry later with: ${cmdName(pm)} add ${failed.join(" ")} — or run doctor`);
  }
}

/** True when a module can be resolved from the consumer's node_modules. */
export function isInstalled(frontendRoot, spec) {
  try {
    const requireFrom = createRequire(path.join(frontendRoot, "package.json"));
    requireFrom.resolve(spec);
    return true;
  } catch {
    return false;
  }
}
