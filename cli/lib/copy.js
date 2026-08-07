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
    return { copied: 0, skipped: 0, files: [] };
  }
  if (dryRun) {
    const stats = fs.statSync(from);
    return { copied: stats.isDirectory() ? countFiles(from) : 1, skipped: 0, files: [] };
  }
  // force:true — re-running install/update refreshes SDK files to the new version.
  // The kit never deletes consumer files; it only adds/overwrites its own.
  fs.cpSync(from, to, { recursive: true, force: true });
  // For the import self-check, report the copied CODE files as paths relative to
  // the target root (only src/ rules matter — ui-kit/ is the knowledge mirror).
  const files =
    rule.to.startsWith("src/")
      ? filesUnder(from).map((f) => path.join(rule.to, f))
      : [];
  return { copied: countFiles(from), skipped: 0, files };
}

function filesUnder(dir, root = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(abs, root));
    else out.push(path.relative(root, abs));
  }
  return out;
}

function countFiles(dir) {
  if (fs.statSync(dir).isFile()) return 1;
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return n;
}

/** Apply all copy rules; returns total copied count + the copied code files. */
export function applyCopyRules(pkgRoot, targetRoot, rules, dryRun = false) {
  log.step("Copying the SDK");
  let total = 0;
  const copiedFiles = [];
  for (const rule of rules) {
    const { copied, files } = applyRule(pkgRoot, targetRoot, rule, dryRun);
    total += copied;
    copiedFiles.push(...files);
  }
  log.ok(`${total} SDK files in place (code → src/, knowledge → ui-kit/)`);
  return { total, copiedFiles };
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
