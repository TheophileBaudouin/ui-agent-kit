---
name: meta-audit
description: Reusable audit of a governed AI-built project (meta-project vs SDK separation, governance coherence, sourcing, skills, links, language, decision traceability). Use when asked to audit the project, check constitution compliance, or verify the meta/SDK boundary — re-discovers the real tree on every run, works before and after the SDK is built.
---

# meta-audit — reusable project audit

Audit an AI-governed project **without modifying it**. This skill re-discovers the real
structure on every run (never trust memory or previous reports). It applies the same method
whether the SDK exists yet or not — the meta/SDK separation check becomes more important
once it does.

## Posture (mandatory)

- **Never modify** governance or structure files during the audit, except unambiguous
  corrections (typo, dead link to a file that exists under another name).
- **Never judge literal compliance** with any original construction prompt. Judge compliance
  with the **project's own governance files as they exist today** (constitution, phases,
  AGENTS.md). A renamed/moved folder is not a violation if coherent and documented.
- An deviation is a problem only if it: (1) contradicts an explicit constitution principle,
  (2) is documented nowhere, or (3) breaks internal coherence (files referencing names that
  no longer exist).
- Do not invent findings for the sake of having some — a healthy project may be mostly ✅.
- Do not start building anything "while you're at it".

## Step 0 — Cartography (before any judgment)

1. List the full real tree (all useful levels).
2. Read in full: the found `AGENTS.md`-equivalent, any constitution/charter file, any phase
   roadmap file, any end-of-session reports.
3. Note immediately (without judging): real project name, real location (standalone repo /
   subfolder of another project / plain folder with or without git), and any documented
   decision that diverges from expectations.
4. Only then start judging — the map, not the original prompt, is the reference.

## Source of truth

1. **First**: the real governance files (constitution, phases, AGENTS.md) — what Théo and
   the previous agent actually decided.
2. **Second, only for one principle**: the strict separation between the meta-project
   (rules, templates, governance) and the SDK itself (components, blocks, real code). Check
   this **even if** the governance has gone silent on it — in that case, the silence itself
   is a finding (missing written guardrail = risk).
3. If constitution contradicts common sense (e.g. it explicitly allows mixing meta and SDK),
   flag it as a critical point for Théo to arbitrate — do not silently ignore, do not fix.

## Priority axis — meta-project / SDK separation

- **4.1 Premature SDK construction**: does the SDK folder contain real code (components,
  node_modules, package.json with UI deps, .tsx files beyond short illustrative snippets)?
  If yes, check whether this is covered by the CURRENT phases.md (validated phases) — if the
  roadmap planned and validated the construction, it is not premature; if it contradicts the
  roadmap, it is 🔴. Also check no shadcn/frozen-base component leaked into unexpected places.
- **4.2 Explicit written boundary**: is there a clear, unambiguous statement in AGENTS.md
  and/or phases.md of what belongs to the meta-project vs the SDK? Would a fresh agent
  understand in <2 minutes "I must not build components now, only rules/templates" — and
  does that statement match the REAL state (not stale)?
- **4.3 Purity of rule files**: ui-rules/, patterns/, authoring guides contain rules and
  short snippets only — no full component/page deliverables.
- **4.4 Skills govern, don't build**: installed skills are "how to build/verify" guidance,
  not finished components to paste as part of the SDK.
- **4.5 Separation readable despite structure**: even if inside a shared repo, the
  meta/SDK separation must be unambiguous at the folder + documentation level.

## Other axes

- **a. Governance coherence**: constitution versioned and respected elsewhere; AGENTS.md
  short and dense (not bloated); phases roadmap up to date with what was actually done.
- **b. Authoring guides / memory systems**: every living memory system has its twin guide;
  guides answer 4 questions (purpose / exact format with example / when to read / when+how
  to update, with an analysis method, not just "update").
- **c. Sourcing**: every rule in ui-rules/patterns cites a verifiable source; research log
  consistent with installed skills (no skill mentioned but absent on disk, none on disk
  absent from the log).
- **d. Skills functional**: each announced skill physically present in a Pi-discoverable
  location (verify the real discovery mechanism: .pi/settings.json skills array, .pi/skills/,
  .agents/skills/, packages — not a guess) with SKILL.md name+description (missing
  description = not loaded).
- **e. Names and links**: internal links resolve; project name consistent across files.
- **f. Language**: all files in one language (Théo's documented decision); flag any file or
  section that switched by mistake.
- **g. Decision traceability**: questions asked to Théo (name, location, paid sources) have
  a traced answer or an explicit "to confirm" default. A silent, untraced choice is a
  finding even if reasonable.

## Walkthrough method

Go folder by folder, then file by file inside each, in this order: governance first (it is
the reference to judge the rest), then skills, then ux/, then ui-rules/ and patterns/, then
the SDK folder, then the rest. For each file, note: conforme / non-conforme / non applicable,
with a one-line reason.

## Report format

Write to `references/audit-<date>.md` (or equivalent found). Classify by severity:

| Severity | Meaning |
| --- | --- |
| 🔴 Blocking | Contradicts a non-negotiable principle, especially meta/SDK separation. Fix before anything else. |
| 🟠 To fix | Breaks coherence or reliability (dead link, missing source, absent guide) but not the foundations. |
| 🟡 Minor | Possible improvement, no urgency. |
| 🟢 Conforme | Explicitly verified and correct — tells Théo what needs no attention. |

For every 🔴/🟠 finding: propose a concrete correction, apply nothing structural without
Théo's validation. End with a ≤3-line plain-language summary for Théo: overall state, number
of blocking points, and the single first question to decide, if any.
