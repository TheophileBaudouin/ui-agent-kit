// Frozen base install: detects the shadcn base (components.json + src/components/ui)
// and installs it via the shadcn CLI when missing. Never overwrites a consumer's
// existing components.json.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { log } from "./log.js";
import { cmdName } from "./env.js";

export const BASE_CONFIG_FILE = "components.json";

// The frozen-base config (radix-nova style, `@/` aliases, harvest registries).
// Only written when the consumer has no components.json yet.
export const BASE_CONFIG_TEMPLATE = {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "radix-nova",
  rsc: false,
  tsx: true,
  tailwind: {
    config: "",
    css: "src/index.css",
    baseColor: "neutral",
    cssVariables: true,
    prefix: "",
  },
  iconLibrary: "lucide",
  rtl: false,
  menuColor: "default",
  menuAccent: "subtle",
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
};

/** True when the frozen base looks installed (config present + ui components exist). */
export function baseInstalled(frontendRoot) {
  const cfg = path.join(frontendRoot, BASE_CONFIG_FILE);
  const ui = path.join(frontendRoot, "src", "components", "ui");
  if (!fs.existsSync(cfg)) return false;
  if (!fs.existsSync(ui)) return false;
  return fs.readdirSync(ui).some((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
}

/**
 * Ensure the frozen base is present. Returns { installed: boolean, reason?: string }.
 * Never destructive: components.json is only written when missing, and the shadcn
 * CLI only adds files.
 */
export function ensureBase(frontendRoot, { skip = false } = {}) {
  if (skip) {
    log.warn("base install skipped (--skip-base)");
    return { installed: false, reason: "skipped" };
  }
  if (baseInstalled(frontendRoot)) {
    log.ok("frozen base already installed");
    return { installed: true };
  }

  log.step("Installing the frozen base (shadcn/ui, radix base)");
  if (!fs.existsSync(path.join(frontendRoot, BASE_CONFIG_FILE))) {
    const file = path.join(frontendRoot, BASE_CONFIG_FILE);
    fs.writeFileSync(file, `${JSON.stringify(BASE_CONFIG_TEMPLATE, null, 2)}\n`);
    log.ok(`wrote ${BASE_CONFIG_FILE} (radix-nova, harvest registries)`);
  } else {
    log.dim(`reusing existing ${BASE_CONFIG_FILE}`);
  }

  log.dim("this downloads ~60 components — can take a few minutes");
  const result = spawnSync(cmdName("npx"), ["shadcn@latest", "add", "--all", "--yes"], {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: false,
  });
  if (result.error || result.status !== 0) {
    log.error("shadcn add failed — the kit needs the frozen base to compile");
    log.dim('retry manually with:  npx shadcn@latest add --all');
    return { installed: false, reason: "shadcn add failed" };
  }
  log.ok("frozen base installed");
  return { installed: true };
}
