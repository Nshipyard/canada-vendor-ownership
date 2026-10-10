# Federal Vendor Ownership skill

Use this skill to query the federal vendor ownership spine: vendor-to-corporation-number resolution and ownership concentration for Canadian federal contracts.

## MCP endpoint

`POST /mcp` (Streamable HTTP, JSON-RPC 2.0)

## Tools

- `vendor_lookup` - search canonical vendors by name. Args: `q` (string), `limit` (integer, default 10).
- `ownership_chain` - vendor record plus matched corporation row. Args: `vendor_id` (string).
- `concentration` - aggregates: total value, canonical vendor count, Canadian vs foreign vs unknown shares, top vendors.

## REST

- `GET /api/v1/vendors?q=&limit=`
- `GET /api/v1/vendors/{id}`
- `GET /api/v1/corporations/{num}`
- `GET /api/v1/concentration`
- `GET /api/openapi.json`

## Honest limits to quote back

- Contract data is unaudited and self-reported by departments.
- Registered country is not ultimate ownership. A Canadian-registered subsidiary of a foreign parent reads as Canadian.
- Unmatched vendors are labeled unknown, never assigned a country.
