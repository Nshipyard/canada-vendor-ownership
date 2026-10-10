"use client";

import { useState } from "react";
import { useLang } from "@/i18n";

export default function CiteThis({ text }: { text: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink/70 transition hover:border-ink"
      >
        {copied ? t.showcase.copied : t.showcase.cite} →
      </button>
      <span className="text-[12px] uppercase tracking-[0.12em] text-ink/40">{t.showcase.source}</span>
    </div>
  );
}
