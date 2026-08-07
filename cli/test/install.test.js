// ui-agent-kit install CLI — end-to-end tests (node:test, no dependencies, no network).
// Runs the real CLI against temp fixture projects with --skip-base --skip-deps.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { verifyImports } from "../lib/copy.js";
import { installDeps } from "../lib/deps.js";
import { detectPackageManager } from "../lib/env.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(TEST_DIR, "..", "index.js");
const PKG_ROOT = path.dirname(path.dirname(TEST_DIR));

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`cannot read test fixture ${file}: ${err.message}`);
  }
}

const VERSION = readJson(path.join(PKG_ROOT, "package.json")).version;

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
}

/** Minimal consumer project: Vite + React deps, fake frozen base (no network). */
function makeFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-kit-test-"));
  fs.mkdirSync(path.join(dir, "src", "lib"), { recursive: true });
  fs.mkdirSync(path.join(dir, "src", "components", "ui"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".pi"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "fixture-app",
      version: "0.0.1",
      dependencies: {
        react: "^19",
        "react-dom": "^19",
        vite: "^6",
        "@vitejs/plugin-react": "^4",
      },
    }),
  );
  fs.writeFileSync(
    path.join(dir, "src", "lib", "utils.ts"),
    'export function cn(...parts) { return parts.filter(Boolean).join(" "); }\n',
  );
  fs.writeFileSync(
    path.join(dir, "src", "components", "ui", "button.tsx"),
    "export function Button() { return <button />; }\n",
  );
  fs.writeFileSync(
    path.join(dir, ".pi", "settings.json"),
    JSON.stringify({ skills: ["../existing"] }),
  );
  fs.writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: {} }),
  );
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("install copies code to src/ and knowledge to ui-kit/", (t) => {
  const dir = makeFixture(t);
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0, res.stdout + res.stderr);

  // code → src/, canonical layout
  assert.ok(
    fs.existsSync(
      path.join(
        dir,
        "src",
        "components",
        "hextaui",
        "settings-preferences.tsx",
      ),
    ),
    "hextaui origin folder",
  );
  assert.ok(
    fs.existsSync(
      path.join(
        dir,
        "src",
        "components",
        "evilcharts",
        "charts",
        "echarts-bar-chart.tsx",
      ),
    ),
    "evilcharts origin folder",
  );
  assert.ok(
    fs.existsSync(path.join(dir, "src", "components", "command-menu-02.tsx")),
    "blocks-so copied flat",
  );
  assert.ok(
    fs.existsSync(
      path.join(dir, "src", "components", "example", "preferences-screen.tsx"),
    ),
    "example under components/example",
  );
  // agent chat kit: assistant-ui base + first-party agent components + demo example
  assert.ok(
    fs.existsSync(
      path.join(dir, "src", "components", "assistant-ui", "thread.tsx"),
    ),
    "assistant-ui base under components/assistant-ui",
  );
  assert.ok(
    fs.existsSync(
      path.join(dir, "src", "components", "agent", "agent-chat.tsx"),
    ),
    "agent components under components/agent",
  );
  assert.ok(
    fs.existsSync(
      path.join(
        dir,
        "src",
        "components",
        "example-agent",
        "agent-chat-demo.tsx",
      ),
    ),
    "agent example under components/example-agent",
  );

  // knowledge → ui-kit/ = ENTIRE sdk/ mirrored (nothing left out, incl. hidden files)
  for (const p of [
    "AGENTS.md",
    "README.md",
    "ui-rules",
    "patterns",
    "ux",
    "skills",
    "docs",
    "ui-sdk/docs/CONSUMPTION.md",
    "ui-sdk/components-index.md",
    ".pi/settings.json",
    ".pi-lens.json",
    ".markdownlint-cli2.jsonc",
    "ui-sdk/components/hextaui/settings-preferences.tsx",
  ]) {
    assert.ok(fs.existsSync(path.join(dir, "ui-kit", p)), `ui-kit/${p}`);
  }

  // example imports were canonicalized — no leftover @/components/ui/settings-* paths
  const example = fs.readFileSync(
    path.join(dir, "src", "components", "example", "preferences-screen.tsx"),
    "utf8",
  );
  assert.match(example, /@\/components\/hextaui\/settings-preferences/);
  assert.doesNotMatch(example, /@\/components\/ui\/settings-/);
});

test(".pi/settings.json is merged, preserving existing entries", (t) => {
  const dir = makeFixture(t);
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0);
  const settings = JSON.parse(
    fs.readFileSync(path.join(dir, ".pi", "settings.json"), "utf8"),
  );
  assert.ok(
    settings.skills.includes("../existing"),
    "existing skill preserved",
  );
  assert.ok(settings.skills.includes("../ui-kit/skills"), "SDK skills wired");
});

test("installed manifest records the SDK version", (t) => {
  const dir = makeFixture(t);
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0);
  const manifest = readJson(path.join(dir, "ui-kit", ".ui-agent-kit.json"));
  assert.equal(manifest.version, VERSION);
  assert.equal(manifest.frontendRoot, dir);
});

test("re-running install is idempotent (exit 0, same file count)", (t) => {
  const dir = makeFixture(t);
  assert.equal(
    runCli(["install", "--skip-base", "--skip-deps", "--target", dir]).status,
    0,
  );
  const count = () => {
    let n = 0;
    for (const root of ["ui-kit", "src"]) {
      const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, e.name);
          if (e.isDirectory()) walk(p);
          else n++;
        }
      };
      walk(path.join(dir, root));
    }
    return n;
  };
  const before = count();
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0);
  assert.equal(count(), before, "second run must not duplicate files");
});

test("update reports up to date, --force refreshes", (t) => {
  const dir = makeFixture(t);
  assert.equal(
    runCli(["install", "--skip-base", "--skip-deps", "--target", dir]).status,
    0,
  );
  const upToDate = runCli([
    "update",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(upToDate.status, 0);
  assert.match(upToDate.stdout, /up to date/);

  fs.rmSync(path.join(dir, "src", "components", "retab"), {
    recursive: true,
    force: true,
  });
  const forced = runCli([
    "update",
    "--force",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(forced.status, 0);
  assert.ok(
    fs.existsSync(path.join(dir, "src", "components", "retab", "dropzone.tsx")),
    "--force restores removed files",
  );
});

test("import self-check fails loudly on an unresolvable kit import", (t) => {
  const dir = makeFixture(t);
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0);

  // unit-level: corrupt a copied file AFTER the copy, then run the guard directly
  const file = path.join(dir, "src", "components", "retab", "dropzone.tsx");
  fs.appendFileSync(file, '\nimport x from "@/components/does-not-exist";\n');
  const { errors } = verifyImports(dir, ["src/components/retab/dropzone.tsx"]);
  assert.ok(errors.length > 0, "broken @/ import must be reported");
  assert.match(errors[0], /dropzone\.tsx → @\/components\/does-not-exist/);
});

test("missing frozen base is a warning, not a failure (--skip-base)", (t) => {
  const dir = makeFixture(t);
  fs.rmSync(path.join(dir, "src", "components", "ui"), {
    recursive: true,
    force: true,
  });
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0);
  assert.match(res.stdout + res.stderr, /base .*skipped/i);
});

test("doctor is read-only and exits 0", (t) => {
  const dir = makeFixture(t);
  const res = runCli(["doctor", "--target", dir]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /doctor/);
});

test("Wails layout (frontend/) is auto-detected", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-kit-wails-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "frontend", "src", "lib"), { recursive: true });
  fs.mkdirSync(path.join(dir, "frontend", "src", "components", "ui"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(dir, "frontend", ".pi"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "frontend", "package.json"),
    JSON.stringify({
      name: "wails-app",
      dependencies: { react: "^19", vite: "^6", "@vitejs/plugin-react": "^4" },
    }),
  );
  fs.writeFileSync(
    path.join(dir, "frontend", "src", "lib", "utils.ts"),
    "export const cn = () => '';\n",
  );
  fs.writeFileSync(
    path.join(dir, "frontend", "src", "components", "ui", "button.tsx"),
    "export function Button() { return null; }\n",
  );
  fs.writeFileSync(path.join(dir, "frontend", ".pi", "settings.json"), "{}\n");

  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0, res.stdout + res.stderr);
  // the kit must land in frontend/, not at the repo root
  assert.ok(
    fs.existsSync(path.join(dir, "frontend", "ui-kit", "AGENTS.md")),
    "ui-kit under frontend/",
  );
  assert.ok(
    fs.existsSync(
      path.join(
        dir,
        "frontend",
        "src",
        "components",
        "hextaui",
        "settings-preferences.tsx",
      ),
    ),
  );
  assert.ok(
    !fs.existsSync(path.join(dir, "ui-kit")),
    "nothing copied at the repo root",
  );
});

test("non-project directory → explicit error, exit 1", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-kit-noproj-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const res = runCli(["install", "--target", dir]);
  assert.equal(res.status, 1);
  assert.match(res.stdout + res.stderr, /no package\.json/i);
});

test("--version and --help work", () => {
  assert.equal(runCli(["--version"]).stdout.trim(), VERSION);
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:/);
});

// ---------------------------------------------------------------------------
// Resilience regressions — the install must NEVER abort on consumer-side state.

test("installDeps never throws: failing PM, missing PM, tolerant retry", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui-kit-deps-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  // "true" exits 0 → batch succeeds.
  assert.doesNotThrow(() => installDeps(dir, "true", ["a", "b"]));
  // "false" exits 1 → batch fails, no tolerance, individual attempts fail → warn, no throw.
  assert.doesNotThrow(() => installDeps(dir, "false", ["a"]));
  // nonexistent binary → "missing" path → warn, no throw (the install continues).
  assert.doesNotThrow(() => installDeps(dir, "no-such-pm-xyz", ["a"]));
});

test("consumer src/ state does not block the install (scoped import check)", (t) => {
  const dir = makeFixture(t);
  // A broken @/ import in the CONSUMER's own file (not part of the kit copy).
  fs.writeFileSync(
    path.join(dir, "src", "broken.ts"),
    'import x from "@/components/does-not-exist";\n',
  );
  const res = runCli([
    "install",
    "--skip-base",
    "--skip-deps",
    "--target",
    dir,
  ]);
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout + res.stderr, /all @\/ imports resolve/i);
});

test("package-manager priority: bun.lock wins over package-lock.json", (t) => {
  const dir = makeFixture(t);
  fs.writeFileSync(path.join(dir, "package-lock.json"), "{}\n");
  fs.writeFileSync(path.join(dir, "bun.lock"), "");
  assert.equal(detectPackageManager(dir), "bun");
});
