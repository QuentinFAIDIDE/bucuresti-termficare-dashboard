"use client";

import { LanguageSelect } from "@/components/language-select";
import { useTranslation } from "@/lib/translations";

export function Header() {
  const { t } = useTranslation();
  
  return (
    <header>
      <div className="px-6 py-4 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <div className="mt-[8px]"><LanguageSelect /></div>
        </div>
      </div>
      <p className="text-center text-muted-foreground mt-[8px]">
        {t.subtitle}
      </p>
    </header>
  );
}
