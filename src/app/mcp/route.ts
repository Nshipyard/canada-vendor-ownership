import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { facts } from "@/lib/data";
import { searchSpine, getVendorById } from "../api/v1/vendors/route";

const DATA_DIR = path.join(process.cwd(), "data");

const TOOLS = [
  {
    name: "vendor_lookup",
    description: "Search canonical vendors in the federal vendor spine by name.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Vendor name search string" },
        limit: { type: "integer", description: "Max results", default: 10 },
      },
      required: ["q"],
    },
  },
  {
    name: "ownership_chain",
    description:
      "Get a vendor's record with its matched corporation number and registered country, plus the corporation row from the merged Federal Corporations table.",
    inputSchema: {
      type: "object",
      properties: {
        vendor_id: { type: "string", description: "Canonical vendor ID" },
      },
      required: ["vendor_id"],
    },
  },
  {
    name: "concentration",
    description: "Ownership concentration aggregates: top vendors, Canadian vs foreign vs unknown shares, yearly series.",
    inputSchema: { type: "object", properties: {} },
  },
];

let corpDb: DatabaseSync | null = null;

function corpRow(num: string | null): Record<string, string> | null {
  if (!num) return null;
  const p = path.join(DATA_DIR, "corporations.db");
  if (!fs.existsSync(p)) return null;
  if (!corpDb) corpDb = new DatabaseSync(p, { readOnly: true });
  const hit = corpDb.prepare("SELECT * FROM corps WHERE corp_number = ?").get(num) as
    | Record<string, string>
    | undefined;
  return hit ?? null;
}

function sse(payload: unknown): NextResponse {
  const body = `event: message\ndata: ${JSON.stringify(payload)}\n\n`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

export async function POST(req: NextRequest) {
  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    );
  }
  const { id = null, method, params = {} } = body;

  if (method === "initialize") {
    return sse({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "vendor-ownership", version: "1.0.0" },
      },
    });
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 202 });
  }

  if (method === "tools/list") {
    return sse({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
  }

  if (method === "tools/call") {
    const name = params.name as string;
    const args = (params.arguments ?? {}) as Record<string, unknown>;
    let result: unknown;
    try {
      if (name === "vendor_lookup") {
        result = searchSpine(String(args.q ?? ""), Math.min(25, Number(args.limit ?? 10)));
      } else if (name === "ownership_chain") {
        const vendor = getVendorById(String(args.vendor_id ?? ""));
        if (!vendor) throw new Error("Vendor not found");
        result = { vendor, corporation: corpRow(vendor.corporation_number) };
      } else if (name === "concentration") {
        result = {
          vintage: facts.vintage,
          total_value_cad: facts.total_value_cad,
          canonical_vendors: facts.canonical_vendors,
          country_share: facts.country_share,
          top_vendors: facts.top_vendors.slice(0, 10),
        };
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (e) {
      return sse({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: `Error: ${(e as Error).message}` }], isError: true },
      });
    }
    return sse({
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
    });
  }

  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json({ name: "vendor-ownership", version: "1.0.0", transport: "streamable-http", tools: TOOLS.map((t) => t.name) });
}
