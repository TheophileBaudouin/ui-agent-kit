// Minimal zero-dependency progress logger with ANSI colors (auto-disabled when not a TTY).

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function paint(code, s) {
  return useColor ? `${code}${s}${c.reset}` : s;
}

export const log = {
  /** Section header. */
  step(msg) {
    console.log(`\n${paint(c.blue, "▸")} ${paint(c.bold ?? "", msg)}`);
  },
  /** Normal info line. */
  info(msg) {
    console.log(`  ${msg}`);
  },
  ok(msg) {
    console.log(`  ${paint(c.green, "✔")} ${msg}`);
  },
  warn(msg) {
    console.log(`  ${paint(c.yellow, "!")} ${msg}`);
  },
  error(msg) {
    console.error(`  ${paint(c.red, "✖")} ${msg}`);
  },
  dim(msg) {
    console.log(`  ${paint(c.dim, msg)}`);
  },
  /** Inline progress without a trailing newline. */
  inline(msg) {
    process.stdout.write(`  ${msg}`);
  },
};

log.step = (msg) => console.log(`\n${paint(c.blue, "▸")} ${msg}`);

/** Pretty elapsed time. */
export function elapsed(start) {
  const ms = Date.now() - start;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
