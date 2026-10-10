"use client";

import { useState } from "react";
import { useLang } from "@/i18n";

function snippet(tab: string, origin: string): string {
  if (tab === "ChatGPT") {
    return `Add a custom MCP server in ChatGPT Developer Mode:\n\nServer URL: ${origin}/mcp\nTools: vendor_lookup, ownership_chain, concentration\n\nAsk: "Which vendors received the most federal contract dollars, and how many matched a corporation record?"`;
  }
  if (tab === "Claude") {
    return `Add to claude_desktop_config.json:\n\n{\n  "mcpServers": {\n    "vendor-ownership": {\n      "url": "${origin}/mcp",\n      "transport": "streamable-http"\n    }\n  }\n}\n\nTools: vendor_lookup, ownership_chain, concentration`;
  }
  if (tab === "CLI") {
    return `curl -X POST ${origin}/mcp \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json, text/event-stream" \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`;
  }
  return `Streamable HTTP MCP endpoint: ${origin}/mcp\n\nJSON-RPC methods: initialize, tools/list, tools/call\nTools: vendor_lookup (search vendors), ownership_chain (vendor to corporation), concentration (ownership aggregates)`;
}

export default function McpConnect() {
  const { t } = useLang();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const text = snippet(t.mcp.tabs[tab], origin);
  return (
    <div className="card-warm p-6 md:p-8">
      <h3 className="display text-[24px]">{t.mcp.title}</h3>
      <p className="mt-2 text-[15px] text-ink/65">{t.mcp.body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {t.mcp.tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
              i === tab ? "bg-canada text-white" : "border border-line text-ink/70 hover:border-ink/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <pre className="mcp-snippet mt-4 rounded-2xl bg-ink p-5 font-mono text-[13px] leading-relaxed text-white/90">
        {text}
      </pre>
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="pill-cta !py-2.5 !text-[14px]"
        >
          {copied ? t.mcp.copied : t.mcp.copy}
        </button>
        <span className="text-[13px] text-ink/55">
          {t.mcp.endpoint}: <span className="font-mono">{origin}/mcp</span>
        </span>
      </div>
    </div>
  );
}
