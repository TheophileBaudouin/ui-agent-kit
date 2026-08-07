# Phase 8 report — agent chat UI (assistant-ui + Vercel AI patterns)

Date: 2026-08-08 · Status: ✅ done, pushed
Decision: executed at Théo's request ("Chat Agent UI — assistant-ui + Vercel AI patterns",
with the full pipeline: research → ask_user → plan → implementation → sub-agent fresh
review → fixes).

## Goal

Add a conversational AI layer to the SDK: agent chat interfaces (user ↔ agent
conversation, streaming, execution steps, tool calls, human approvals, attachments,
generated artifacts) built on **assistant-ui** + Vercel AI patterns — never a home-grown
chat.

## Research (web + Context7, sources verified)

- **assistant-ui** (`@assistant-ui/react@0.15.x`, MIT, React 19, ~1.3M dl/week):
  production chat library; components follow the **shadcn model** (install via
  `npx shadcn@latest add https://r.assistant-ui.com/thread.json`), built on
  Radix + Tailwind + shadcn/ui — same base as the frozen base; **client-side only**
  (works with Vite — Wails-compatible, no Next.js).
- **assistant-ui/tool-ui**: copy-paste tool-call components (Zod) — young project, kept as
  observation, not foundation.
- **Vercel AI SDK**: `useChat` (v5+ transport-based), `toolApproval` human-in-the-loop,
  `addToolApprovalResponse`, approval parts with `state: "approval-requested"`; assistant-ui
  adapter `@assistant-ui/react-ai-sdk` (100% client-side).

## Decisions (asked to Théo via ask_user, answered 2026-08-08)

| Decision | Chosen | Alternatives considered |
| --- | --- | --- |
| Scope | **Full 9-component kit** (AgentChat, AgentMessage, AgentComposer, ThinkingIndicator, ToolCallCard, ToolResult, ApprovalCard, ExecutionTimeline, ArtifactPreview + useAgentStatus) | minimal vertical slice first |
| Backend coupling | **UI-first, runtime-agnostic** — components are presentational; integration patterns documented | shipping an AI SDK-bound `useAgentChat` hook |
| assistant-ui base | **Harvested** into `ui-sdk/components/assistant-ui/` (official registry, MIT) | documented-only ("npx shadcn add …") |
| Location | `sdk/ui-sdk/components/agent/` (first-party) | separate `agent-ui-sdk/` folder |

## Architecture

- Two layers: **base** = assistant-ui registry harvest (`components/assistant-ui/`: thread,
  markdown-text, tool-group, tool-fallback, reasoning, attachment, follow-up-suggestions,
  tooltip-icon-button) and **first-party agent components** (`components/agent/`: pure
  presentational cards + assistant-ui-bound integration).
- Four concerns separated (constitution): conversation display (`AgentChat`/`AgentMessage`),
  agent state (`AgentStatus` + `useAgentStatus` + `ThinkingIndicator`), tool actions
  (`ToolCallCard`/`ToolResult`/`ToolCallUI`), user validation (`ApprovalCard`).
- `AgentChat` wires the Thread: `AssistantMessage → AgentMessage`, `ToolFallback →
  AgentToolCallUI` (auto-renders approval gates, tool cards, results).
- Agent lifecycle `idle → thinking → planning → executing → waiting_approval → completed |
  error`; `planning` is agent-reported, the rest derive from the thread.
- Status language is a11y-safe: icon + label always (WCAG 1.4.1), `role="status"` live
  regions, `aria-hidden` decorative icons, sr-only step labels.
- Example screen (`examples/agent-chat/`) uses a **scripted mock runtime**
  (`useExternalStoreRuntime`) — buildable without a backend; the reference for `AgentChat`.

## Verification

- ui-workspace mirror: assistant-ui installed via shadcn CLI (frozen base hash verified
  unchanged, 5 overwrite prompts answered no), then agent kit copied; `tsc` 0 errors,
  `vite build` green, eslint 0 errors (assistant-ui folder documented as vendored).
- `npm run manifest`: deps 5 → 10 (added `@assistant-ui/react`, `@assistant-ui/react-markdown`,
  `remark-gfm`, `zustand`, `tw-shimmer` via new `EXTRA_DEPS` for CSS-only imports), copy rules
  +1 (`examples/agent-chat → src/components/example-agent`).
- CLI e2e: 11/11 tests pass (3 new layout assertions for the agent folders).
- markdownlint: 0 issues. Lens diagnostics: no new findings.
- **Sub-agent fresh review** (independent reviewer): 1 🟠 + 10 🟡 findings — all fixed
  (approval double-submit guard, custom approval-kind filtering, `isError` precedence,
  `data` part rendering, indicator/approval-card ARIA roles, non-interactive tool row
  without args, CLI test coverage, doc paths, README deps, demo timer cleanup).

## Deliverables

- `sdk/ui-sdk/components/assistant-ui/` — 8 harvested base components + READMEs (MIT).
- `sdk/ui-sdk/components/agent/` — 12 first-party files (11 components + `agent-status.ts`).
- `sdk/ui-sdk/examples/agent-chat/` — mock-runtime + demo screen (no backend).
- Docs: `sdk/patterns/agent-chat.md`, `sdk/ux/design-decisions.md` (D-005), `sdk/ux/screens.md`,
  `sdk/ui-sdk/docs/CONSUMPTION.md` (agent section), `sdk/ui-sdk/components-index.md` (+20
  entries), `cli/generate-manifest.js` (copy rule + `EXTRA_DEPS`), `cli/test/install.test.js`
  (+3 assertions), root + SDK READMEs.

## Follow-ups

- tool-ui (assistant-ui/tool-ui): re-evaluate as a source of tool-result components once it
  matures.
- AI SDK integration (`@assistant-ui/react-ai-sdk` + `useChat` + Go streaming endpoint
  pattern): documented, not shipped — Théo's call.
