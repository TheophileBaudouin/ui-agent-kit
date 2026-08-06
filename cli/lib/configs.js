// Configuration wiring. Deliberately conservative: we only CREATE missing files or
// merge JSON we can read safely (.pi/settings.json). Existing files are never
// edited destructively — the CLI prints an explicit verify checklist instead, so
// re-running install never breaks a project.

import fs from "node:fs";
import path from "node:path";

import { log } from "./log.js";

/** Skills live at ui-kit/skills; Pi settings paths are relative to .pi/. */
const SKILLS_REL = "../ui-kit/skills";

/** Merge ui-kit skills into .pi/settings.json (create the file when missing). */
export function mergePiSettings(frontendRoot) {
  const dir = path.join(frontendRoot, ".pi");
  const file = path.join(dir, "settings.json");
  fs.mkdirSync(dir, { recursive: true });

  let settings = { skills: [] };
  if (fs.existsSync(file)) {
    try {
      settings = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      log.warn(`${file} is not valid JSON — backing it up and starting fresh`);
      fs.copyFileSync(file, `${file}.bak`);
      settings = { skills: [] };
    }
  }
  const skills = Array.isArray(settings.skills) ? settings.skills : [];
  if (!skills.includes(SKILLS_REL)) {
    skills.push(SKILLS_REL);
    settings.skills = skills;
    fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
    log.ok(`wired SDK skills into .pi/settings.json`);
  } else {
    log.dim(`.pi/settings.json already declares the SDK skills`);
  }
}

export const VITE_CONFIG_TEMPLATE = `import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// ui-agent-kit: Wails static-build contract — relative assets + fixed dev port.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) ?? 9245,
    strictPort: true,
  },
});
`;

/** Create vite.config.ts only when no Vite config exists yet. */
export function ensureViteConfig(frontendRoot) {
  const existing = ["vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.mts"].find(
    (f) => fs.existsSync(path.join(frontendRoot, f)),
  );
  if (existing) {
    log.dim(`vite config found (${existing}) — not modified`);
    const content = fs.readFileSync(path.join(frontendRoot, existing), "utf8");
    if (!/base\s*:/.test(content)) {
      log.warn(`add base: "./" to ${existing} (Wails static build)`);
    }
    if (!/9245|WAILS_VITE_PORT/.test(content)) {
      log.warn(`point server.port at 9245 (WAILS_VITE_PORT) in ${existing} (wails3 dev proxy)`);
    }
    return;
  }
  fs.writeFileSync(path.join(frontendRoot, "vite.config.ts"), VITE_CONFIG_TEMPLATE);
  log.ok("created vite.config.ts (Wails static-build contract)");
}

export const TSCONFIG_TEMPLATE = `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`;

/** Create tsconfig.json only when missing; warn (no edit) when the @/ alias is absent. */
export function ensureTsconfig(frontendRoot) {
  const file = path.join(frontendRoot, "tsconfig.json");
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    if (!/"@\/\*"/.test(content)) {
      log.warn(`add "@/*": ["./src/*"] to tsconfig.json paths (kit imports use @/)`);
    }
    return;
  }
  fs.writeFileSync(file, TSCONFIG_TEMPLATE);
  log.ok("created tsconfig.json with the @/ alias");
}

/** Full conservative config pass. */
export function applyConfigs(frontendRoot) {
  log.step("Wiring configuration");
  mergePiSettings(frontendRoot);
  ensureViteConfig(frontendRoot);
  ensureTsconfig(frontendRoot);
  log.dim("existing configs are never modified — see warnings above for manual checks");
}
