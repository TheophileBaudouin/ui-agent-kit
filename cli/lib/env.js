// Environment detection: project root, frontend root, package manager, node version.
// All cross-platform, no external commands beyond `node -v`-free checks.

import fs from "node:fs";
import path from "node:path";

export const MIN_NODE_MAJOR = 18;

/** Wails apps keep the frontend in `frontend/`; bare Vite apps live at the root. */
export function findFrontendRoot(targetDir) {
  for (const candidate of [targetDir, path.join(targetDir, "frontend")]) {
    const pkg = path.join(candidate, "package.json");
    if (fs.existsSync(pkg)) {
      try {
        const data = JSON.parse(fs.readFileSync(pkg, "utf8"));
        const isFrontend =
          (data.dependencies && (data.dependencies.vite || data.dependencies.react)) ||
          (data.devDependencies && data.devDependencies.vite);
        if (isFrontend) return candidate;
      } catch {
        // malformed package.json — fall through to the next candidate
      }
    }
  }
  return null;
}

/** Detect the package manager from lockfiles, falling back to npm. */
export function detectPackageManager(frontendRoot) {
  const names = [
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ];
  for (const [file, pm] of names) {
    if (fs.existsSync(path.join(frontendRoot, file))) return pm;
  }
  return "npm";
}

/** Windows ships `npx.cmd`, `npm.cmd`, … — plain `npx` works only on POSIX shells. */
export function cmdName(base) {
  return process.platform === "win32" ? `${base}.cmd` : base;
}

export function nodeVersion() {
  const m = /^v?(\d+)\./.exec(process.version);
  return m ? Number(m[1]) : 0;
}

export function nodeVersionOk() {
  return nodeVersion() >= MIN_NODE_MAJOR;
}

/** True when the target looks like a Vite + React project. */
export function hasViteReact(pkg) {
  const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  return Boolean(all.vite && (all.react || all["@vitejs/plugin-react"]));
}
