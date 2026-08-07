# tool-group

| | |
| --- | --- |
| Registry | @assistant-ui (official shadcn registry) |
| License | MIT |
| Source | <https://github.com/assistant-ui/assistant-ui> |
| Category | component (assistant-ui) |

Collapsible group that wraps consecutive tool calls of an agent step (one row per step,
expandable to see each call). Rendered by `thread.tsx` for `group-tool` parts.

## Dependencies

- Frozen base (consumer): `@/components/ui/collapsible`, `@/components/ui/tooltip`
- npm: `@assistant-ui/react`, `lucide-react`

## Usage

```tsx
import { ToolGroupRoot, ToolGroupTrigger, ToolGroupContent } from "@/components/assistant-ui/tool-group"

<ToolGroupRoot>
  <ToolGroupTrigger count={3} active />
  <ToolGroupContent>{children}</ToolGroupContent>
</ToolGroupRoot>
```

> Rendered automatically by `thread.tsx` — the `agent/ExecutionTimeline` component offers a
> richer step-by-step alternative for agent workflows.
