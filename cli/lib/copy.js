// Copy engine: applies the copy rules from cli/manifest.json and then verifies
// that every `@/` import in the copied source files actually resolves.
// Cross-platform: fs.cpSync only, no shell commands.

import fs from "node:fs";
import path from "node:path";

import { log } from "./log.js";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/** Resolve one copy rule: { from, to } relative to the package root / target root. */
function applyRule(pkgRoot, targetRoot, rule, dryRun) {
  const from = path.join(pkgRoot, rule.from);
  const to = path.join(targetRoot, rule.to);
  if (!fs.existsSync(from)) {
    log.warn(`copy source missing (skipped): ${rule.from}`);
    return { copied: 0, skipped: 0 };
  }
  if (dryRun) {
    const stats = fs.statSync(from);
    return { copied: stats.isDirectory() ? countFiles(from) : 1, skipped: 0 };
  }
  // force:true — re-running install/update refreshes SDK files to the new version.
  // The kit never deletes consumer files; it only adds/overwrites its own.
  fs.cpSync(from, to, { recursive: true, force: true });
  return { copied: countFiles(from), skipped: 0 };
}

function countFiles(dir) {
  if (fs.statSync(dir).isFile()) return 1;
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return n;
}

/** Apply all copy rules; returns total copied file count. */
export function applyCopyRules(pkgRoot, targetRoot, rules, dryRun = false) {
  log.step("Copying the SDK");
  let total = 0;
  for (const rule of rules) {
    const { copied } = applyRule(pkgRoot, targetRoot, rule, dryRun);
    total += copied;
  }
  log.ok(`${total} SDK files in place (code → src/, knowledge → ui-kit/)`);
  return total;
}

// ---------------------------------------------------------------------------
// Import self-check

function resolveAlias(targetRoot, spec) {
  // "@/" resolves to <frontend>/src (shadcn convention). Spec never starts with
  // "./" or "../" — those were filtered out before calling.
  return path.join(targetRoot, "src", ...spec.split("/"));
}

function resolveAsFile(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return true;
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(`${base}${ext}`)) return true;
  }
  if (fs.existsSync(path.join(base, "index.ts")) || fs.existsSync(path.join(base, "index.tsx"))) return true;
  return false;
}

const IMPORT_RE = /\bfrom\s+["'](@\/[^"']+)["']/g;

/**
 * Verify that every `@/` import in the copied source files resolves.
 * - kit-to-kit imports (resolvable in the copied tree) are ERRORS when broken;
 * - frozen-base imports (@/components/ui/*, @/lib/utils, @/hooks/*) are WARNINGS
 *   only — they resolve once the consumer installs the shadcn base.
 * Returns { errors, warnings } arrays of human-readable messages.
 */
export function verifyImports(targetRoot, files) {
  const errors = [];
  const warnings = [];
  const src = path.join(targetRoot, "src");

  for (const file of files) {
    const abs = path.join(targetRoot, file);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;

    const content = fs.readFileSync(abs, "utf8");
    for (const m of content.matchAll(IMPORT_RE)) {
      const spec = m[1];
      const rest = spec.slice(2); // strip "@/"
      const isBase =
        rest.startsWith("components/ui/") || rest.startsWith("lib/") || rest.startsWith("hooks/");
      const resolved = resolveAsFile(resolveAlias(targetRoot, rest));
      const msg = `${file} → ${spec}`;
      if (resolved) continue;
      if (isBase) warnings.push(`${msg} (frozen base — install it with the base step or --skip-base)`);
      else errors.push(msg);
    }
  }
  return { errors, warnings };
}

/** Collect all copied source files under a target subdir (relative paths). */
export function listSourceFiles(dir, root = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSourceFiles(abs, root));
    else out.push(path.relative(root, abs));
  }
  return out;
}
