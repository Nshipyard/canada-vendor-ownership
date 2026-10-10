"use client";

import { useLang } from "@/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-24 border-t border-line bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="kicker !text-white/60">{t.nav.brand}</p>
            <p className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-white/70">
              {t.footer.honesty}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/50">
              {t.footer.author}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-[14px]">
              <a href="https://x.com/richardsondx" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                x.com/richardsondx
              </a>
              <a href="https://github.com/richardsondx" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                github.com/richardsondx
              </a>
              <a href="https://github.com/Nshipyard" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                {t.footer.repo}
              </a>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/50">Open Nshipyard</p>
            <div className="mt-4 flex flex-col gap-2 text-[14px]">
              <a href="https://canada.nshipyard.com" className="text-white/80 hover:text-white">
                {t.footer.backTo}
              </a>
              <a href="https://canada.nshipyard.com/data-fixes" className="text-white/80 hover:text-white">
                {t.footer.dataFixes}
              </a>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-white/15 pt-6 text-[12px] text-white/40">
          {t.footer.honesty}
        </p>
      </div>
    </footer>
  );
}
