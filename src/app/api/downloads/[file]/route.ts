import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const FILES: Record<string, { file: string; type: string }> = {
  corporations: { file: "corporations_merged.csv", type: "text/csv" },
  vendors: { file: "vendor_spine.csv", type: "text/csv" },
  merges: { file: "vendor_merges.json", type: "application/json" },
  crosswalk: { file: "canadabuys_crosswalk.csv", type: "text/csv" },
  quarantine: { file: "quarantine_report.csv", type: "text/csv" },
  facts: { file: "build_facts.json", type: "application/json" },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const entry = FILES[file];
  if (!entry) return NextResponse.json({ error: "Unknown file" }, { status: 404 });
  const p = path.join(process.cwd(), "data", entry.file);
  if (!fs.existsSync(p)) {
    return NextResponse.json({ error: "File not yet built" }, { status: 503 });
  }
  const stat = fs.statSync(p);
  if (stat.size > 50 * 1024 * 1024) {
    const stream = fs.createReadStream(p);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": entry.type,
        "Content-Disposition": `attachment; filename="${entry.file}"`,
        "Content-Length": String(stat.size),
      },
    });
  }
  const body = fs.readFileSync(p);
  return new NextResponse(body, {
    headers: {
      "Content-Type": entry.type,
      "Content-Disposition": `attachment; filename="${entry.file}"`,
      "Content-Length": String(stat.size),
    },
  });
}
