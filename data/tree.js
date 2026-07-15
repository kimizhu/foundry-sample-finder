// AUTO-GENERATED from data/tree.json by tools/build-data.py. Do not edit by hand.
window.HA_TREE = {
  "meta": {
    "model": "blocks",
    "source": "microsoft-foundry/foundry-samples",
    "note": "Building-blocks model: a Foundry base agent plus capability blocks you stack on top. Each block's SDK-dot coverage is derived from the referenced samples' 'sdk' field in samples.json (meta.sdks holds the legend). Voice/WebSocket samples are intentionally excluded.",
    "sdkOrder": [
      "agent-framework",
      "langgraph",
      "native",
      "openai-agents",
      "claude",
      "pydantic-ai",
      "github-copilot"
    ]
  },
  "base": {
    "id": "base",
    "title": "Foundry base · Basic agent",
    "tagline": "Start here — a minimal chat agent",
    "description": "Every hosted agent starts here: a minimal agent that handles request/response and multi-turn conversation. Choose your SDK, get it running on Foundry, then stack the building blocks below on top.",
    "sampleIds": [
      "af-resp-basic",
      "af-inv-basic",
      "lg-resp-chat",
      "lg-inv-chat",
      "byo-resp-hello-world",
      "byo-inv-hello-world"
    ]
  },
  "blocks": [
    {
      "id": "tools",
      "title": "Tools & MCP",
      "tagline": "local tools · MCP · toolbox",
      "description": "Give the agent capabilities: custom local function tools, remote MCP servers, and the managed Foundry toolbox.",
      "sampleIds": [
        "af-resp-tools",
        "af-resp-mcp",
        "af-resp-foundry-toolbox",
        "lg-resp-toolbox",
        "lg-resp-mcp",
        "byo-resp-toolbox",
        "byo-resp-langgraph-toolbox",
        "byo-resp-langgraph-toolbox-user-identity",
        "byo-inv-toolbox"
      ]
    },
    {
      "id": "knowledge",
      "title": "Knowledge, RAG & Memory",
      "tagline": "grounding · search · memory",
      "description": "Ground answers in your data: file-based skills, Azure AI Search RAG, semantic memory, and Foundry IQ agentic retrieval.",
      "sampleIds": [
        "af-resp-skills",
        "af-resp-azure-search-rag",
        "af-resp-foundry-skills",
        "af-resp-foundry-memory",
        "af-resp-foundry-iq-toolbox"
      ]
    },
    {
      "id": "files",
      "title": "Files & Documents",
      "tagline": "uploads · code interpreter",
      "description": "Let the agent accept file uploads and work with documents, including a code interpreter.",
      "sampleIds": [
        "af-resp-files",
        "lg-resp-files"
      ]
    },
    {
      "id": "human-async",
      "title": "Human-in-the-Loop, Async & Events",
      "tagline": "approvals · background · events",
      "description": "Pause for human approval, run long-running/background work, keep per-user session state, and react to events.",
      "sampleIds": [
        "lg-resp-hitl",
        "byo-resp-notetaking",
        "byo-resp-session-multiplexing",
        "byo-resp-background",
        "byo-inv-notetaking",
        "byo-inv-hitl",
        "byo-inv-event-grid"
      ]
    },
    {
      "id": "orchestration",
      "title": "Multi-Agent & Orchestration",
      "tagline": "workflows · A2A delegation",
      "description": "Coordinate multiple agents: pipelines, declarative routing, and agent-to-agent (A2A) delegation.",
      "sampleIds": [
        "af-resp-workflows",
        "af-resp-declarative",
        "af-a2a-delegation",
        "lg-resp-workflows",
        "lg-a2a-delegation"
      ]
    },
    {
      "id": "observability",
      "title": "Observability & Tracing",
      "tagline": "tracing · metrics · App Insights",
      "description": "See what the agent is doing: distributed tracing and metrics wired to Application Insights / OpenTelemetry.",
      "sampleIds": [
        "af-resp-observability",
        "lg-resp-observability"
      ]
    },
    {
      "id": "security",
      "title": "Security, Governance & Ops",
      "tagline": "identity · guardrails · secrets",
      "description": "Run safely in production: managed identity to downstream Azure services, content-safety guardrails, secrets/connections, and infra diagnostics.",
      "sampleIds": [
        "af-resp-downstream-azure",
        "af-resp-content-safety",
        "byo-resp-env-vars",
        "byo-inv-diagnostic"
      ]
    },
    {
      "id": "optimization",
      "title": "Agent Optimization",
      "tagline": "auto-tune instructions (preview)",
      "description": "Automatically improve agent instructions and behavior with the Agent Optimizer (preview).",
      "sampleIds": [
        "af-resp-optimization-travel",
        "byo-resp-optimization-hello-world",
        "byo-resp-optimization-customer-support"
      ]
    },
    {
      "id": "browser",
      "title": "Browser & Computer Use",
      "tagline": "Playwright · scraping",
      "description": "Drive a real browser for scraping and computer-use tasks via Playwright.",
      "sampleIds": [
        "af-resp-browser-automation",
        "byo-resp-browser-automation"
      ]
    },
    {
      "id": "teams",
      "title": "Teams / M365 Channel",
      "tagline": "ship to Microsoft Teams",
      "description": "Ship the agent as a Microsoft Teams / M365 channel using the Activity protocol.",
      "sampleIds": [
        "af-resp-teams-activity"
      ]
    },
    {
      "id": "adapters",
      "title": "Other SDKs & Adapters",
      "tagline": "bring another SDK to Foundry",
      "description": "Bring a different SDK to Foundry: LangGraph graphs, the OpenAI Agents SDK, the Claude Agent SDK, Pydantic AI (AG-UI), or the GitHub Copilot SDK.",
      "sampleIds": [
        "byo-resp-langgraph-chat",
        "byo-resp-openai-agents-sdk",
        "byo-inv-langgraph-chat",
        "byo-inv-claude-agent-sdk",
        "byo-inv-ag-ui",
        "byo-inv-github-copilot"
      ]
    }
  ]
};
