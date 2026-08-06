// Installed-kit manifest: what version of the SDK is in the consumer project,
// and where it lives. Used by `update` to detect staleness and by `doctor` to report.

import fs from "node:fs";
import path from "node:path";

export const MANIFEST_FILE = ".ui-agent-kit.json";

/** Read the installed manifest (null when not installed yet). */
export function readInstalled(uiKitDir) {
  const file = path.join(uiKitDir, MANIFEST_FILE);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Write (or refresh) the installed manifest. Never deletes anything else. */
export function writeInstalled(uiKitDir, { version, frontendRoot, pm }) {
  const data = {
    version,
    installedAt: new Date().toISOString(),
    node: process.version,
    pm,
    frontendRoot,
  };
  fs.mkdirSync(uiKitDir, { recursive: true });
  fs.writeFileSync(path.join(uiKitDir, MANIFEST_FILE), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

function readJson(file, what) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`Cannot read ${what} (${file}): ${err.message}`);
  }
}

/** Load the package's own manifest (generated at publish time). */
export function readPackageManifest(cliDir) {
  return readJson(path.join(cliDir, "manifest.json"), "the package manifest");
}

/** Current package version, read from the shipped package.json. */
export function packageVersion(rootDir) {
  return readJson(path.join(rootDir, "package.json"), "package.json").version;
}
