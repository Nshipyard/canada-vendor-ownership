import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Federal Vendor Ownership API",
      version: "1.0.0",
      description:
        "Vendor-to-corporation-number resolution and ownership concentration for federal contracts, computed from Treasury Board, CanadaBuys, and Corporations Canada open data.",
    },
    servers: [{ url: "/api" }],
    paths: {
      "/v1/vendors": {
        get: {
          summary: "Search canonical vendors",
          parameters: [
            { name: "q", in: "query", required: true, schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 25, maximum: 100 } },
          ],
          responses: { "200": { description: "Matching vendors" } },
        },
      },
      "/v1/vendors/{id}": {
        get: {
          summary: "Get one vendor by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Vendor record" }, "404": { description: "Not found" } },
        },
      },
      "/v1/corporations/{num}": {
        get: {
          summary: "Get one corporation from the merged Federal Corporations table",
          parameters: [{ name: "num", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Corporation record" }, "404": { description: "Not found" } },
        },
      },
      "/v1/concentration": {
        get: {
          summary: "Ownership concentration aggregates",
          responses: { "200": { description: "Aggregates" } },
        },
      },
      "/openapi.json": {
        get: {
          summary: "This OpenAPI document",
          responses: { "200": { description: "OpenAPI 3.1 JSON" } },
        },
      },
    },
  };
  return NextResponse.json(spec);
}
