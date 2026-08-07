# reasoning

| | |
| --- | --- |
| Registry | @assistant-ui (official shadcn registry) |
| License | MIT |
| Source | <https://github.com/assistant-ui/assistant-ui> |
| Category | component (assistant-ui) |

Collapsible chain-of-thought / reasoning block (expand to read the reasoning text).
Rendered by `thread.tsx` for `reasoning` and `group-reasoning` parts.

## Dependencies

- Frozen base (consumer): `@/components/ui/collapsible`, `@/components/ui/tooltip`
- npm: `@assistant-ui/react`, `lucide-react`

## Usage

```tsx
import { Reasoning } from "@/components/assistant-ui/reasoning"
<Reasoning {...part} />
```

> Rendered automatically by `thread.tsx`. The agent `ThinkingIndicator` shows the
> reasoning/running state compactly at message level.
