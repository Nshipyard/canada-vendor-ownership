import { fmtMoney, fmtInt, fmtPct } from "@/lib/data";

const RED = "#d80621";
const INK = "#0a0f1e";
const GREY = "#b9b2a4";
const NAVY = "#1e3a5f";
const LIGHT = "#f3f0ea";

export function TopVendorsBar({
  rows,
  width = 720,
}: {
  rows: { name: string; value: number }[];
  width?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const rowH = 34;
  const labelW = Math.min(300, width * 0.42);
  const barW = width - labelW - 90;
  const height = rows.length * rowH + 8;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Top vendors by contract value">
      {rows.map((r, i) => {
        const y = i * rowH;
        const bw = Math.max(2, (r.value / max) * barW);
        return (
          <g key={i} className="chart-bar">
            <text x={0} y={y + 21} fontSize={12.5} fill={INK} fontWeight={500}>
              {r.name.length > 38 ? r.name.slice(0, 37) + "…" : r.name}
            </text>
            <rect x={labelW} y={y + 8} width={bw} height={18} rx={9} fill={RED} />
            <text x={labelW + bw + 8} y={y + 22} fontSize={12.5} fill={INK} fontWeight={700}>
              {fmtMoney(r.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CountryShareBar({
  canada,
  foreign,
  unknown,
  width = 720,
}: {
  canada: number;
  foreign: number;
  unknown: number;
  width?: number;
}) {
  const total = canada + foreign + unknown || 1;
  const h = 44;
  const segs = [
    { v: canada, c: RED, label: "Canada" },
    { v: foreign, c: NAVY, label: "Foreign" },
    { v: unknown, c: GREY, label: "Unknown" },
  ];
  let x = 0;
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${h + 40}`} width="100%" role="img" aria-label="Contract dollars by registered country">
        {segs.map((s, i) => {
          const w = (s.v / total) * width;
          const el = (
            <g key={i}>
              <rect x={x} y={8} width={Math.max(0, w - 2)} height={h} rx={10} fill={s.c} />
              {w > 90 && (
                <text x={x + w / 2} y={8 + h / 2 + 5} fontSize={13} fill="#fff" fontWeight={700} textAnchor="middle">
                  {fmtPct(s.v / total)}
                </text>
              )}
            </g>
          );
          x += w;
          return el;
        })}
        <g fontSize={12.5} fill={INK}>
          <rect x={0} y={h + 22} width={12} height={12} rx={6} fill={RED} />
          <text x={18} y={h + 32}>Canada {fmtMoney(canada)}</text>
          <rect x={200} y={h + 22} width={12} height={12} rx={6} fill={NAVY} />
          <text x={218} y={h + 32}>Foreign {fmtMoney(foreign)}</text>
          <rect x={400} y={h + 22} width={12} height={12} rx={6} fill={GREY} />
          <text x={418} y={h + 32}>Unknown {fmtMoney(unknown)}</text>
        </g>
      </svg>
      <p className="mt-2 text-[13px] text-ink/55">
        Unknown means the vendor did not match a corporation record. It is counted, never assigned.
      </p>
    </div>
  );
}

export function FunnelChart({
  stages,
  width = 720,
}: {
  stages: { label: string; value: number }[];
  width?: number;
}) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  const rowH = 56;
  const height = stages.length * rowH + 8;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Vendor resolution funnel">
      {stages.map((s, i) => {
        const y = i * rowH;
        const w = Math.max(60, (s.value / max) * width);
        const x = (width - w) / 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={40} rx={20} fill={i === stages.length - 1 ? RED : LIGHT} stroke={i === stages.length - 1 ? RED : "#e7e1d7"} />
            <text x={width / 2} y={y + 25} fontSize={13.5} fill={i === stages.length - 1 ? "#fff" : INK} fontWeight={700} textAnchor="middle">
              {fmtInt(s.value)} {s.label}
            </text>
            {i < stages.length - 1 && (
              <text x={width / 2} y={y + 52} fontSize={11} fill={INK} opacity={0.45} textAnchor="middle">▼</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function TrendChart({
  rows,
  width = 720,
}: {
  rows: { year: number; value: number }[];
  width?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const padL = 52;
  const padB = 30;
  const padT = 12;
  const h = 260;
  const w = width - padL - 10;
  const bw = w / rows.length;
  const yticks = [0, 0.5, 1].map((f) => f * max);
  return (
    <svg viewBox={`0 0 ${width} ${h + padB}`} width="100%" role="img" aria-label="Contract value by year">
      {yticks.map((t, i) => {
        const y = padT + h - (t / max) * h;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={width - 10} y2={y} stroke="#e7e1d7" strokeDasharray="4 4" />
            <text x={padL - 8} y={y + 4} fontSize={11} fill={INK} opacity={0.55} textAnchor="end">
              {fmtMoney(t)}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const bh = (r.value / max) * h;
        const x = padL + i * bw + 2;
        return (
          <g key={i} className="chart-bar">
            <rect x={x} y={padT + h - bh} width={Math.max(2, bw - 4)} height={bh} rx={4} fill={RED} opacity={0.88} />
            {(i % Math.ceil(rows.length / 9) === 0 || i === rows.length - 1) && (
              <text x={x + bw / 2} y={padT + h + 18} fontSize={10.5} fill={INK} opacity={0.6} textAnchor="middle">
                {r.year}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function CountriesBar({
  rows,
  width = 720,
}: {
  rows: { country: string; value: number }[];
  width?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const rowH = 32;
  const labelW = Math.min(160, width * 0.28);
  const barW = width - labelW - 90;
  const height = rows.length * rowH + 8;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Contract value by registered country">
      {rows.map((r, i) => {
        const y = i * rowH;
        const bw = Math.max(2, (r.value / max) * barW);
        return (
          <g key={i} className="chart-bar">
            <text x={0} y={y + 20} fontSize={12.5} fill={INK} fontWeight={500}>
              {r.country}
            </text>
            <rect x={labelW} y={y + 7} width={bw} height={17} rx={8.5} fill={i === 0 ? RED : NAVY} opacity={i === 0 ? 1 : 0.75} />
            <text x={labelW + bw + 8} y={y + 21} fontSize={12.5} fill={INK} fontWeight={700}>
              {fmtMoney(r.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
