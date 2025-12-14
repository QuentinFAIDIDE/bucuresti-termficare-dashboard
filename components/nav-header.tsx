"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageSelect } from "@/components/language-select";

export function NavHeader() {
  return (
    <header className="px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      <LanguageSelect />
    </header>
  );
}
