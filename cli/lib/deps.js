// Dependency installation: installs the SDK's declared deps with the detected
// package manager. The dep list comes from cli/manifest.json (generated from the
// actual imports in sdk/ui-sdk, so new pieces propagate automatically).

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

/** Install the manifest deps with the given package manager. */
export function installDeps(frontendRoot, pm, deps) {
  if (deps.length === 0) {
    log.ok("no extra dependencies required");
    return;
  }
  log.step("Installing SDK dependencies");
  log.dim(`package manager: ${pm}`);
  log.dim(`packages: ${deps.join(", ")}`);

  const args = [...INSTALL_ARGS[pm], ...deps];
  const result = spawnSync(cmdName(pm), args, {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    throw new Error(`could not start ${pm}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${pm} exited with code ${result.status} — see output above`);
  }
  log.ok(`installed ${deps.length} package${deps.length === 1 ? "" : "s"} via ${pm}`);
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
