# Parallel work — ui-dev-kit

> Verified in session 0 — `references/research-log.md` §G. This file documents **how** to
> parallelize when needed, not an obligation to do so.

## Principle

The Pi core does not provide subagents (minimalist design, confirmed by the official README
"No sub-agents"). **But on this machine the `pi-subagents` extension is installed**: subagents
are therefore operational here, with 8 ready-to-use builtin agents (see table below). The
"one Git worktree per agent + one tmux window per agent" pattern remains the **manual
fallback** for running independent Pi sessions without pi-subagents (Option B).

## Roles

- **Parent session (lead/orchestrator)**: plans, breaks down the work, launches subagents,
  reviews, synthesizes, fixes, merges. Never does two things at once.
- **Subagent**: a dedicated agent, launched by the parent with a bounded task. It never
  touches shared/cross-cutting files (`governance/`, `AGENTS.md`, `.pi/`) unless explicitly
  instructed otherwise.

### Available builtin subagents (pi-subagents v0.42.0)

| Agent | Role |
| --- | --- |
| `scout` | Fast codebase recon: returns compressed context for handoff |
| `researcher` | Autonomous web researcher: searches, evaluates, synthesizes a focused brief |
| `context-builder` | Analyzes requirements and codebase, generates context and meta-prompt |
| `planner` | Creates implementation plans from context and requirements |
| `worker` | Implementation agent for normal tasks (aliases: developer, coder) |
| `reviewer` | Versatile review specialist: diffs, plans, solutions, codebase health, PRs |
| `oracle` | High-context decision-consistency oracle (preserves inherited state, prevents drift) |
| `delegate` | Lightweight subagent inheriting the parent model, no default reads |

Cost: prefer the lightest sufficient agent (`scout`/`worker` for simple work,
`planner`/`reviewer` when quality matters, `oracle` only for irreversible decisions —
max 2 per session). Detailed recipes: `skills/pi-subagents/`.

## When to parallelize

**Useful** for:

- populating several independent `ui-rules/` files at once (Phase 4),
- evaluating several skill/block candidates in parallel (Phase 0 / Phase 2),
- harvesting several block sources in parallel (Phase 2),
- reviewing several SDK components in parallel (Phase 5),
- delegating a single isolated task to a `worker` without polluting the parent context.

**Not useful** for:

- writing `governance/constitution.md`, `governance/phases.md` or `AGENTS.md` — these are
  unique, cross-cutting files, the responsibility of a single agent at a time, to avoid
  inconsistencies (constitution, principle 4).

## Method

### Option A — pi-subagents (default, installed on this machine)

The `pi-subagents` extension (v0.42.0) handles single-agent delegation (`subagent { agent, task }`)
and scripted multi-agent workflows (`workflowScript`: sequence, parallel, branch, retry,
aggregation), with **isolated Git worktrees** per child (`worktree: true`). The parent
session keeps the lead role: it launches the fan-out, synthesizes, fixes, merges.

- Pick the agent from the table above according to the task (the lightest sufficient one).
- See `skills/pi-subagents/` (skill bundled with the extension) for exact recipes.
- For cross-session coordination: `pi-intercom` (messages between Pi sessions, same machine).

### Option B — manual worktree + tmux (fallback without pi-subagents)

```bash
# From a clean main branch:
git worktree add ../ui-dev-kit-worker-1 -b feat/rules-spacing
git worktree add ../ui-dev-kit-worker-2 -b feat/rules-colors

# One tmux window per worker:
tmux new-window -n worker-1
tmux new-window -n worker-2
# … then launch a Pi instance in each worktree:
cd ../ui-dev-kit-worker-1 && pi
cd ../ui-dev-kit-worker-2 && pi

# The lead reviews then merges:
git checkout main && git merge feat/rules-spacing
git worktree remove ../ui-dev-kit-worker-1
```

### Option C — community packages (evaluate before use)

`pi-agentteam`, `pi-git-worktrees`, `pi-side-agents`, `agents-workflow`, `pi-swarm`,
`pi-mux`, `pi-tmux` exist (see research-log §G). They are **not** installed here: evaluate
them only if pi-subagents is not enough.

## Guardrails

- Only one agent writes to a given file at a time (no merge hell on `ui-rules/01-spacing.md`).
- Subagents/workers never modify: `governance/`, `AGENTS.md`, `.pi/`, `ux/design-decisions.md`.
- Any merge by the lead goes through a review (the `ui-review` skill for UI, the
  constitution for governance).
- In Phase 0 and for governance: **never in parallel**.
