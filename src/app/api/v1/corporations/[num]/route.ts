import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = path.join(process.cwd(), "data");

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync | null {
  const p = path.join(DATA_DIR, "corporations.db");
  if (!fs.existsSync(p)) return null;
  if (!db) db = new DatabaseSync(p, { readOnly: true });
  return db;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ num: string }> }) {
  const { num } = await params;
  const database = getDb();
  if (!database) {
    return NextResponse.json({ error: "Corporations table not yet built" }, { status: 503 });
  }
  const target = decodeURIComponent(num).trim();
  const hit = database
    .prepare("SELECT * FROM corps WHERE corp_number = ?")
    .get(target) as Record<string, string> | undefined;
  if (!hit) {
    return NextResponse.json({ error: "Corporation not found" }, { status: 404 });
  }
  return NextResponse.json(hit);
}
