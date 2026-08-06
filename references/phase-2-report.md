# Phase 2 report — block harvest

> Date: August 6, 2026 · Exit criterion met: every kept block has its license verified and
> documented; no unclear-license block kept. Frozen base untouched (61/61 files intact,
> verified by hash). Build green.

## Method

1. Re-read the official open-source registry index `ui.shadcn.com/r/registries.json`
   (**267 registries**, Aug 6, 2026 — re-verification per gotcha).
2. Filtered for desktop-app relevance (dashboards, settings, tables, forms, file workflows,
   charts, onboarding) — excluded AI/chat, crypto, e-commerce, landing/marketing, games,
   icons/fonts, maps, and Base-UI/React-Aria-based registries (different primitive stack
   than the frozen Radix base).
3. Verified the license of every candidate via GitHub API (license + stars + last push) or
   official site/legal page. **100% free/open source only** (Théo's choice).
4. Installed into `ui-workspace/` with the guard rule: **never overwrite a frozen-base file**
   (`yes n | npx shadcn add ...`); every install batch was followed by a hash check of the
   61 frozen-base files.
5. Kept only what compiles against the frozen base; excluded the rest with documented reasons
   (integration debt is Phase 3 work, not Phase 2).

## Registries kept (license verified)

| Registry | License (verified) | Stars / activity | Harvested & kept |
| --- | --- | --- | --- |
| @blocks-so (blocks.so) | MIT (github.com/ephraimduncan/blocks) | 1 721★, push 2026-07 | 7 app blocks |
| @hextaui | MIT (github.com/preetsuthar17/hextaui) | 636★, push 2026-07 | 10 settings/auth/billing components |
| @evilcharts | MIT (github.com/legions-developer/evilcharts) | 2 768★, push 2026-07 | 7 chart components (recharts + echarts) |
| @shadcncraft (free) | Apache-2.0 (github.com/shadcncraft/shadcncraft-free) | — | 8 components (pro-marketing / pro-ecommerce) |
| @retab (partial) | MIT (npm @retab/react) | small/new | dropzone, dropzone-core, file-size-format |

Kept inventory (in `ui-workspace/src/`):

- **blocks-so** (components/): command-menu-01, command-menu-02, file-upload-05, form-layout-01,
  login-03, onboarding-03, stats-12.
- **hextaui** (components/ui/): settings-account, settings-activity-log, settings-api-keys,
  settings-notifications, settings-preferences, settings-security, settings-team-members,
  auth-change-password, auth-session-manager, billing-subscription-settings.
- **evilcharts** (components/evilcharts/): recharts-chart, recharts-tooltip, echarts-chart,
  echarts-line-chart, echarts-bar-chart, echarts-pie-chart, echarts-composed-chart.
- **shadcncraft** (components/shadcncraft/): avatar-stack, marquee, page-heading, section-heading,
  star-rating, tagline, image-zoom, profile-card.
- **retab** (components/ui/): dropzone, dropzone-core, file-size-format.

New runtime deps added by the kept harvest: `echarts`, `motion` (via evilcharts/shadcncraft),
`react-medium-image-zoom`, `@tabler/icons-react` (shadcncraft), `utif`. 41 harvest-only deps
were pruned after excluding non-kept clusters (package.json reflects only used dependencies).

## Registries evaluated and rejected

| Registry | Reason |
| --- | --- |
| @shadcnblocks (shadcnblocks.com) | License = MIT + **Commons Clause** (restricts selling) — not clean open source |
| @hirael | No explicit license found |
| @paceui / @pacekit | Paid plans ($59–$599); free tier separate and marketing-oriented |
| @reui | Free GitHub tier MIT but paid commercial tier mixed in — compliance risk |
| @supabase | License not explicitly stated |
| Base-UI / React-Aria registries (@basecn, @roiui, @oui, @taki, @kanpeki, @liquefy-ui, @coss, @cubby-ui, @cnippet, @flowkit-ui, @7ovr, @lumiui…) | Different primitive stack than the frozen Radix base |
| AI / crypto / e-commerce / marketing / icons / games / maps / fonts (~150 others) | Out of desktop-SDK scope |

## Kept from the harvest, then excluded at integration review (documented)

These were installed, verified license-clean, then **removed** because they do not compile
against the frozen base without deep integration work (that is Phase 3/4 work, not Phase 2):

- **@retab document-viewer cluster** (pptx/xlsx/pdf/docx viewers, file-thumbnail system,
  file-uploader, ~45 files): Vite-incompatible (`erasableSyntaxOnly` TS violations in
  worker code), Next-oriented patterns, heavy worker setup. Kept: the standalone upload
  primitives. → Revisit in Phase 3 if file-preview is a wanted SDK feature.
- **@blocks-so blocks built against a newer Table API** (table-05, dialog-11, grid-list-01,
  form-layout-02, file-upload-03): 17+ TS prop mismatches with the frozen base components.
  → The remaining 7 blocks kept compile cleanly.
- **blocks-so sidebar-01..04**: Next.js-specific (`next/link`). Desktop SDK is Vite/React.
- **@kibo-ui** (MIT, 3 889★): monorepo path aliases (`@repo/shadcn-ui/…`) not resolvable in
  this project + some items require overwriting frozen-base files.
- **@tour** (MIT): imports `next/link` — Next-specific.
- **@hextaui settings-profile**: imports `next/image` — Next-specific (kept the other 10).
- **@motion-primitives** (MIT, 5 841★): registry returned HTTP 429 (rate-limited) at harvest
  time — **deferred**, install directly from motion-primitives.com in Phase 3 if wanted.

## Integration fixes applied to kept files

- `settings-notifications.tsx`: removed dead `getFrequencyLabel` helper (unused var, TS6133).
- `billing-subscription-settings.tsx`: removed unused destructured prop binding (TS6133).
- Pruned 13 orphaned lib/hook files left over from excluded clusters.

## Compliance

- **Frozen base**: 61/61 files, zero modifications (hash-verified after every install batch).
- **Licenses**: every kept block traces to its registry + license (table above). No
  unclear-license block kept.
- **Free/open source only**: paid registries (paceui) and restricted licenses
  (shadcnblocks/Commons Clause) rejected.
- **Nothing copied into `ui-sdk/`**: migration is Phase 3.

## Build

```text
npm run build ✓ 241ms — green (tsc -b + vite build, no errors)
```

## Exit criteria

- [x] Every kept block has its license verified and documented.
- [x] No unclear-license block kept.
- [x] Frozen base untouched; workspace build green.

---

**Status**: Phase 2 complete, validated by Théo on 2026-08-06 to proceed to Phase 3
(reorganization into `ui-sdk/components/` + `ui-sdk/blocks/` with previews).
