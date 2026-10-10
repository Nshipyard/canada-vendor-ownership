"use client";

import { useLang } from "@/i18n";

export default function Methodology() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="kicker">{t.methodology.kicker}</p>
        <h1 className="display mt-4 text-[clamp(32px,4.6vw,54px)] leading-[1.05]">{t.methodology.title}</h1>
        <p className="mt-5 text-[16.5px] leading-relaxed text-ink/65">{t.methodology.body}</p>
      </div>
      <div className="mx-auto mt-12 flex max-w-[860px] flex-col gap-6">
        {t.methodology.sections.map((s) => (
          <article key={s.id} className="card p-7 md:p-9">
            <h2 className="display text-[24px]">{s.title}</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink/70">{s.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
