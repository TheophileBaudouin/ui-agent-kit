import { Bot } from "lucide-react";
import {
  ErrorPrimitive,
  MessagePrimitive,
  groupPartByType,
  useAuiState,
  type MessageStatus,
} from "@assistant-ui/react";

import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";

import { type AgentStatus } from "./agent-status";
import { ThinkingIndicator } from "./thinking-indicator";
import { AgentToolCallUI } from "./tool-call-ui";

function messageStatusToAgentStatus(status: MessageStatus): AgentStatus {
  switch (status.type) {
    case "running":
      return "thinking";
    case "requires-action":
      return status.reason === "interrupt" ? "waiting_approval" : "executing";
    case "complete":
      return "completed";
    case "incomplete":
      return status.reason === "cancelled" ? "completed" : "error";
  }
}

/**
 * Assistant message variant with agent metadata: avatar, agent name and a
 * per-message `ThinkingIndicator` (derived from the message status). Replaces
 * the default assistant message when passed as `ThreadComponents.AssistantMessage`
 * (AgentChat does it by default).
 *
 * The part rendering mirrors the assistant-ui reference thread: grouped
 * reasoning, grouped tool calls, markdown text, registered tool UIs, and the
 * kit's `AgentToolCallUI` fallback (tool cards + approvals).
 */
export function AgentMessage() {
  const status = useAuiState((s) => s.message.status);

  return (
    <MessagePrimitive.Root
      data-role="assistant"
      data-slot="agent-message"
      className="group/message relative -mb-7.5 flex gap-3 pb-7.5"
    >
      <div
        data-slot="agent-message-avatar"
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10"
      >
        <Bot aria-hidden className="size-4 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 px-2">
          <span className="text-sm font-medium">Agent</span>
          <ThinkingIndicator status={status ? messageStatusToAgentStatus(status) : "completed"} />
        </div>

        <div className="text-foreground px-2 leading-relaxed [overflow-wrap:anywhere]">
          <MessagePrimitive.GroupedParts
            groupBy={groupPartByType({
              reasoning: ["group-chainOfThought", "group-reasoning"],
              "tool-call": ["group-chainOfThought", "group-tool"],
              "standalone-tool-call": [],
            })}
          >
            {({ part, children }) => {
              switch (part.type) {
                case "group-chainOfThought":
                  return <div data-slot="agent-chain-of-thought">{children}</div>;
                case "group-tool":
                  return (
                    <ToolGroupRoot variant="ghost">
                      <ToolGroupTrigger
                        count={part.indices.length}
                        active={part.status.type === "running"}
                      />
                      <ToolGroupContent>{children}</ToolGroupContent>
                    </ToolGroupRoot>
                  );
                case "group-reasoning": {
                  const running = part.status.type === "running";
                  return (
                    <ReasoningRoot streaming={running}>
                      <ReasoningTrigger active={running} />
                      <ReasoningContent aria-busy={running}>
                        <ReasoningText>{children}</ReasoningText>
                      </ReasoningContent>
                    </ReasoningRoot>
                  );
                }
                case "text":
                  return <MarkdownText />;
                case "reasoning":
                  return <Reasoning {...part} />;
                case "tool-call":
                  return part.toolUI ?? <AgentToolCallUI {...part} />;
                case "data":
                  return part.dataRendererUI;
                case "indicator":
                  return (
                    <span
                      data-slot="agent-message-indicator"
                      role="status"
                      className="animate-pulse"
                      aria-label="Agent is working"
                    >
                      {"●"}
                    </span>
                  );
                default:
                  return null;
              }
            }}
          </MessagePrimitive.GroupedParts>

          <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5">
              <ErrorPrimitive.Message className="line-clamp-2" />
            </ErrorPrimitive.Root>
          </MessagePrimitive.Error>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}
