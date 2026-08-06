# Research log — Session 0 (ui-dev-kit meta-project)

> Verification date: August 6, 2026 (every statement below was verified by direct reading of
> the locally installed Pi docs, official pages, or GitHub repos cloned during this session —
> no statement comes from training memory).

## A. The Pi CLI itself

| Question | Verified answer | Source |
| --- | --- | --- |
| Where does Pi look for `AGENTS.md`? | `~/.pi/agent/AGENTS.md` (global) + parent directories + current directory, concatenated. `AGENTS.override.md` replaces `AGENTS.md`/`CLAUDE.md` in its directory. | `README.md` §Context Files + `docs/usage.md` (local install v23.11.0) |
| Where does `SYSTEM.md` live? | `.pi/SYSTEM.md` (project) or `~/.pi/agent/SYSTEM.md` (global); `APPEND_SYSTEM.md` to append without replacing. | `README.md` §System Prompt |
| Skill structure? | Agent Skills standard (`agentskills.io/specification`): folder with `SKILL.md` (required frontmatter `name` ≤64 chars + `description` ≤1024 chars; optional `license`, `compatibility`, `metadata`). Pi is lenient (warns, doesn't block) except missing description (skill not loaded). | `docs/skills.md` |
| Where does Pi load skills from? | Global: `~/.pi/agent/skills/`, `~/.agents/skills/`. Project: `.pi/skills/`, `.agents/skills/` (cwd + ancestors up to the git root). Also: packages, `settings.json` → `skills` key, CLI `--skill`. | `docs/skills.md` §Locations |
| ⚠️ **Important correction** | A root `skills/` folder is **NOT** auto-discovered by Pi. To keep it at the root (requested tree), declare it in `.pi/settings.json`: `{ "skills": ["../skills"] }` (same pattern as the official example `{ "skills": ["../.claude/skills"] }`). Alternative: put everything in `.pi/skills/`. | `docs/skills.md` §Using Skills from Other Harnesses |
| Does Pi have native subagents? | **No in the core** ("No sub-agents" by design). BUT the `pi-subagents` extension (v0.42.0) is **installed on this machine** → subagents operational: 8 builtin agents (scout, researcher, context-builder, planner, worker, reviewer, oracle, delegate — full list in `governance/parallel-work.md`), single-agent delegation + scripted multi-agent workflows with worktrees. Solutions without the extension remain: tmux instances, packages. | `README.md` §What Pi doesn't do + real `subagent list` output (2026-08-06) |
| Does Pi have native MCP? | **No.** "No MCP" — solutions: CLI tools documented via skills, or an extension adding MCP support. | `README.md` §What Pi doesn't do |
| Does Pi have a native plan mode? | **No.** "No plan mode" — solutions: plans written to files, extensions, packages. | `README.md` §What Pi doesn't do |
| Does Pi have a built-in to-do? | **No.** "No built-in to-dos" — recommended solution: a `TODO.md` file. | `README.md` §What Pi doesn't do |
| Does Pi have native background bash? | **No.** "No background bash" — recommended solution: tmux (full observability, direct interaction). | `README.md` §What Pi doesn't do |
| Extensions / packages? | Extensions in `~/.pi/agent/extensions/`, `.pi/extensions/`, or Pi packages. A Pi package = npm/git, declares its resources in `package.json` (`pi` key) or via conventional auto-discovered folders (`extensions/`, `skills/`, `prompts/`, `themes/`). | `README.md` §Extensions + `docs/packages.md` |

## B. The AGENTS.md standard

| Question | Verified answer | Source |
| --- | --- | --- |
| Format? | Open format, plain Markdown, no required fields. Used by 60k+ open-source projects. | agents.md (official page) |
| Conflict resolution between nested AGENTS.md? | "The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything." | agents.md §FAQ |
| Length/content best practices? | No formal limit; recommendations: cover what helps the agent (overview, build/test, style, testing, security), nested AGENTS.md per subproject for monorepos. Gloaguen et al. (2026) study: too-long contexts **reduce** success rate → stay short. | agents.md + mission prompt |
| Standard governance? | Stewarded by the Agentic AI Foundation under the Linux Foundation (transferred from OpenAI). | agents.md §About |

## C. The shadcn/ui ecosystem

| Question | Verified answer | Source |
| --- | --- | --- |
| Current CLI commands? | `init` (templates: next, vite, start, react-router, laravel, astro; bases: `base`, `radix`, `aria`; `--name` creates a project; `--monorepo`; `-y` default), `add` (components; `-a/--all` = all components; `-o/--overwrite`; `--dry-run`; `--diff`; `--view`), `apply` (theme/font presets), `preset decode/resolve/url/open`, `search`/`list` (`-q`, `@registry`), `view`, `docs [component]`, `info`, `build` (registries), `migrate` (icons/radix/rtl), `eject` (inline `shadcn/tailwind.css`). | ui.shadcn.com/docs/cli |
| Flag to install everything at once? | `npx shadcn add --all` (or `-a`). ⚠️ `add`'s `-y` option defaults to **false** (unlike `init`). | ui.shadcn.com/docs/cli |
| Official Skills page? | `pnpm dlx skills add shadcn/ui` installs the official skill. It reads `components.json`, runs `shadcn info --json`, covers: project context, CLI commands, theming/customization, registry authoring, MCP server. | ui.shadcn.com/docs/skills |
| Where does the shadcn skill live? | In the `shadcn-ui/ui` repo → `skills/shadcn/` (SKILL.md, cli.md, customization.md, registry.md, mcp.md, `rules/`: base-vs-radix, chat, composition, forms, icons, styling; agents/openai.yml; evals). | shadcn-ui/ui repo (GitHub API, verified) |
| Current blocks ecosystem? | Official open-source registry directory: `ui.shadcn.com/docs/registry/registry-index`, full index `ui.shadcn.com/r/registries.json`. Usage: `npx shadcn add @<namespace>/<item>`. Verified examples: `blocks.so` (MIT, ~1,690★), BagUI (MIT), shadcncraft-free (Apache-2.0), bigmints/shadcn-blocks (MIT). ⚠️ The ecosystem moves fast: **re-verify the list at Phase 2** (official docs advise reviewing code before install — third-party sources). | ui.shadcn.com/docs/registry/registry-index + web search |
| shadcn repo state? | `shadcn-ui/ui`: 120,679★, MIT, pushed 2026-08-06 (very active). v4 (OKLCH CSS variables, `@import "shadcn/tailwind.css"`, default base = `base`). | GitHub API |

## D. skills.sh / npx skills

| Question | Verified answer | Source |
| --- | --- | --- |
| How does it work? | Open-source CLI (vercel-labs/skills, MIT, 28,199★, pushed 2026-08-05). `npx skills add <owner>/<repo>` (also: GitHub/GitLab URL, direct path to a skill, git URL, local path). Options: `-a/--agent`, `-s/--skill`, `-g/--global`, `--list`, `--copy`, `--all`, `-y`. Commands: `use`, `list/ls`, `find`, `remove`, `update`, `init`. | vercel-labs/skills repo (README, cloned) |
| **Is Pi a target agent?** | **YES.** Official supported-agents list — `Pi` → project folder `.pi/skills/`, global `~/.pi/agent/skills/`. `npx skills add <source> -a pi` installs directly into the paths Pi discovers. | vercel-labs/skills README §Supported Agents (Pi line) |
| Fallback method if needed? | Not needed for Pi (supported). For other cases: clone the repo and manually copy the `SKILL.md` folder + assets into `skills/` (Pi discovers folders containing SKILL.md). | docs/skills.md + verified practice |
| Name collisions? | Pi warns on name collisions and keeps the first found. → The `web-design-guidelines` skills from vercel-labs AND ehmo **collide**: rename ehmo's to `web-platform-guidelines` (Pi does not require name = folder). | docs/skills.md §Validation + finding on both repos |

## E. Reference design skills — verdicts

| Skill | Repo / source | License | Stars / freshness | Verdict |
| --- | --- | --- | --- | --- |
| **shadcn** (official) | shadcn-ui/ui → `skills/shadcn/` | MIT (repo) | 120,679★, active | **Kept** — source of truth for the frozen base |
| **frontend-design** (Anthropic) | anthropics/skills → `skills/frontend-design/` | Apache-2.0 | 166,676★, active | **Kept** — aesthetic direction, anti "generic AI look" |
| **web-design-guidelines** (Vercel) | vercel-labs/agent-skills → `skills/web-design-guidelines/` | n/d (Vercel repo) | 29,803★, active | **Kept** — review guard (100+ a11y/UX/perf rules) |
| **macos-design-guidelines** (ehmo) | ehmo/platform-design-skills → `skills/macos/` | MIT | 480★, pushed 2026-03 | **Kept** — Apple HIG for macOS, THE desktop reference |
| **web-platform-guidelines** (ehmo, renamed) | ehmo/platform-design-skills → `skills/web/` | MIT | same | **Kept (renamed)** — WCAG 2.2 + MDN, a11y complement |
| Other ehmo platforms (ios, ipados, watchos, visionos, tvos, android/Material 3) | ehmo/platform-design-skills | MIT | same | **Not installed** — desktop-only project; add if Théo builds mobile/tablet |
| Apple HIG alternative (ebuntario/apple-hig) | github.com/ebuntario/apple-hig | MIT | 2★ | **Rejected** — too little traction to be reliable |
| Other HIG alternatives (Elevatormusic/apple-hig, raintree-technology/hig-doctor) | — | — | — | **Not deeply verified** → documented in design-systems.md, not installed |
| Fluent (Microsoft) | fluent2.microsoft.design | — | — | **No reliable agent skill found** → official doc pointer only |
| Carbon (IBM) | carbondesignsystem.com | — | — | **No reliable agent skill found** → official doc pointer only |
| Primer (GitHub) | primer.style | — | — | **No reliable agent skill found** → official doc pointer only |
| plugin87/ux-ui-agent-skills ("138 design systems") | GitHub | — | — | **Rejected** — reliability unverifiable, not adopted |

Bonus (same vercel-labs/agent-skills repo, not installed but useful later): `react-best-practices`
(40+ React/Next perf rules) and `composition-patterns` (React component composition) —
candidates for Phase 4 (code rules, not design).

## F. The "constitution first" model (spec-kit)

| Question | Verified answer | Source |
| --- | --- | --- |
| How does spec-kit work? | Spec-Driven Development: specifications become executable. Workflow: `/speckit.constitution` (project governance principles) → `/speckit.specify` (describe the WHAT/WHY, not the stack) → technical plan → constitution compliance check at each planning step → deviation tracking. | github/spec-kit repo (README, cloned) |
| Constitution structure? | Versioned file (`.specify/memory/constitution.md`): numbered principles, NON-NEGOTIABLE flags, "SYNC IMPACT REPORT" (MAJOR/MINOR/PATCH bump + justification), ratification date, principles derived from the codebase's real patterns, binding on all changes. | github/spec-kit `.specify/memory/constitution.md` (read) |
| Adaptation for this project? | We do not install the `specify` tool (it targets other agents via slash commands). We adapt its discipline as plain Markdown read by Pi via `AGENTS.md` → `governance/constitution.md`. Semver versioning, deviations noted at end of session. | mission decision, validated by the study |

## G. Parallel work with Pi

| Question | Verified answer | Source |
| --- | --- | --- |
| Standard pattern? | **One Git worktree per agent + one tmux window/pane per agent.** "Lead" agent: plans, breaks down, reviews, merges (never two things at once). "Worker" agents: bounded to a folder/task, never touching cross-cutting files. | web research (community ecosystem) + Pi README |
| Dedicated orchestration package? | **Yes, several.** Installed on this machine: `pi-subagents` v0.42.0 (single-agent delegation + scripted workflows: sequence, parallel, branches, isolated worktrees, aggregation) and `pi-intercom` v0.9.2 (messages between Pi sessions). Community: pi-agentteam, pi-git-worktrees, pi-side-agents, agents-workflow, pi-swarm, pi-mux, pi-tmux. | local node_modules + web research |
| Recommendation for this project? | Phase 0: no parallelization (governance = one agent at a time). Phases 1-4: pi-subagents (already installed) for parallel fan-out, pi-intercom for coordination. tmux+worktree remains the documented base pattern in `governance/parallel-work.md`. | synthesis |

## Points left unverifiable / to re-verify

- **Block registries**: the exact list of available open-source registries **changes fast** →
  Phase 2 must re-read `ui.shadcn.com/r/registries.json` and verify each license at install
  (Théo chose: 100% free/open source).
- **Exact license of vercel-labs skills** (web-design-guidelines): not declared per skill in
  the repo (Vercel repo) → verify before commercial integration.
- **`{"skills": ["../skills"]}` in `.pi/settings.json`**: officially documented mechanism,
  but the exact relative-path resolution could not be live-tested this session (manual check
  of the skills loaded by Pi = to do at session 1 startup).
- **Star counts**: reliability indicators (GitHub API, Aug 6, 2026), not quality guarantees.
