import { NextRequest, NextResponse } from "next/server";
import { getVendorById } from "../route";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = getVendorById(decodeURIComponent(id));
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }
  return NextResponse.json(vendor);
}
