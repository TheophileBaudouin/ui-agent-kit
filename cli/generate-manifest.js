// cli/manifest.json generator — run before every publish (npm run manifest).
// Scans sdk/ui-sdk for .tsx/.ts files, extracts the external npm imports, and
// writes the dep union + the canonical copy rules. This is what keeps the
// installer in sync when new pieces are added to the SDK: add a piece, run
// `npm run manifest`, and the CLI installs its dependencies automatically.
//
// Usage:
//   node cli/generate-manifest.js            write cli/manifest.json
//   node cli/generate-manifest.js --check    exit non-zero when the file is stale

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLI_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.dirname(CLI_DIR);
const SDK_CODE = path.join(PKG_ROOT, "sdk", "ui-sdk");
const OUT = path.join(CLI_DIR, "manifest.json");

// Modules provided by the shadcn frozen base (or by React itself) — never added
// to the install list. Anything else the SDK imports externally IS installed.
const BASE_PROVIDED = new Set([
  "react",
  "react-dom",
  "react/jsx-runtime",
  "lucide-react",
  "radix-ui",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
]);
const isBaseProvided = (spec) =>
  BASE_PROVIDED.has(spec) ||
  spec.startsWith("@radix-ui/") ||
  spec.startsWith("@wailsio/") ||
  spec.startsWith("node:");

// Canonical copy rules. Code goes under src/ (so @/ imports resolve per the
// CONSUMPTION contract); knowledge (rules/patterns/ux/skills/docs) goes to ui-kit/.
const COPY_RULES = [
  // code → src/
  { from: "sdk/ui-sdk/components", to: "src/components" },
  { from: "sdk/ui-sdk/blocks/blocks-so", to: "src/components" }, // flat — blocks are self-contained
  { from: "sdk/ui-sdk/examples/preferences-screen", to: "src/components/example" },
  // knowledge → ui-kit/
  { from: "sdk/ui-sdk/docs", to: "ui-kit/ui-sdk/docs" },
  { from: "sdk/ui-sdk/layouts", to: "ui-kit/ui-sdk/layouts" },
  { from: "sdk/ui-sdk/templates", to: "ui-kit/ui-sdk/templates" },
  { from: "sdk/ui-sdk/README.md", to: "ui-kit/ui-sdk/README.md" },
  { from: "sdk/ui-sdk/components-index.md", to: "ui-kit/ui-sdk/components-index.md" },
  { from: "sdk/ui-rules", to: "ui-kit/ui-rules" },
  { from: "sdk/patterns", to: "ui-kit/patterns" },
  { from: "sdk/ux", to: "ui-kit/ux" },
  { from: "sdk/skills", to: "ui-kit/skills" },
  { from: "sdk/docs", to: "ui-kit/docs" },
  { from: "sdk/AGENTS.md", to: "ui-kit/AGENTS.md" },
  { from: "sdk/README.md", to: "ui-kit/README.md" },
];

const IMPORT_RE = /\bfrom\s+["']([^"']+)["']/g;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) out.push(abs);
  }
  return out;
}

function collectDeps() {
  const deps = new Set();
  if (!fs.existsSync(SDK_CODE)) {
    console.error(`SDK code tree not found: ${SDK_CODE}`);
    process.exit(1);
  }
  for (const file of walk(SDK_CODE)) {
    const content = fs.readFileSync(file, "utf8");
    for (const m of content.matchAll(IMPORT_RE)) {
      const spec = m[1];
      if (spec.startsWith(".") || spec.startsWith("@/")) continue; // relative / alias
      // strip subpaths: "motion/react" → "motion", "recharts/types/…" → "recharts"
      const bare = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (!isBaseProvided(bare)) deps.add(bare);
    }
  }
  return [...deps].sort();
}

function readJson(file, what) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`cannot read ${what} (${file}): ${err.message}`);
    process.exit(1);
  }
}

function build() {
  const version = readJson(path.join(PKG_ROOT, "package.json"), "package.json").version;
  return {
    version,
    deps: collectDeps(),
    copyRules: COPY_RULES,
    generatedAt: new Date().toISOString(),
  };
}

const next = build();

if (process.argv.includes("--check")) {
  const current = readJson(OUT, "manifest.json");
  const stale = JSON.stringify({ version: current.version, deps: current.deps, copyRules: current.copyRules }) !==
    JSON.stringify({ version: next.version, deps: next.deps, copyRules: next.copyRules });
  if (stale) {
    console.error(`manifest.json is stale — run: npm run manifest`);
    process.exit(1);
  }
  console.log(`manifest.json up to date (v${next.version}, ${next.deps.length} deps)`);
} else {
  fs.writeFileSync(OUT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`wrote cli/manifest.json (v${next.version}, ${next.deps.length} deps, ${next.copyRules.length} copy rules)`);
}
