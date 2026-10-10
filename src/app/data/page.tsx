"use client";

import { useLang } from "@/i18n";
import McpConnect from "@/components/McpConnect";

const FILE_IDS = ["corporations", "vendors", "merges", "crosswalk", "quarantine", "facts"] as const;

export default function Data() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="kicker">{t.data.kicker}</p>
        <h1 className="display mt-4 text-[clamp(32px,4.6vw,54px)] leading-[1.05]">{t.data.title}</h1>
        <p className="mt-5 text-[16.5px] leading-relaxed text-ink/65">{t.data.body}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-[1000px] gap-5 md:grid-cols-2">
        {t.data.files.map((f, i) => {
          const id = FILE_IDS[i];
          const isJson = id === "merges" || id === "facts";
          return (
            <article key={f.id} className="card flex flex-col p-7">
              <h2 className="display text-[21px]">{f.name}</h2>
              <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-ink/65">{f.desc}</p>
              <a
                href={`/api/downloads/${id}`}
                className="pill-ghost mt-5 self-start !py-2.5 !text-[14px]"
              >
                {isJson ? t.data.downloadJson : t.data.download} →
              </a>
            </article>
          );
        })}
      </div>
      <p className="mx-auto mt-10 max-w-[760px] text-center text-[13.5px] text-ink/50">
        {t.data.license}
      </p>
      <div className="mx-auto mt-10 max-w-[1000px]">
        <McpConnect />
      </div>
    </main>
  );
}
