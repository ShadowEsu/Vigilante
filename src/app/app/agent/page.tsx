import { WatcherPageView } from "@/components/agent/AgentPageView";
import { MOCK_AGENT_MESSAGES, MOCK_AGENT_THREADS } from "@/lib/preview/mock-extended";

export default function AgentPage() {
  return (
    <WatcherPageView threads={MOCK_AGENT_THREADS} initialMessages={MOCK_AGENT_MESSAGES} />
  );
}
