"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/translations";

interface LanguageSelectProps {
  useAccentBackground?: boolean;
  useShadow?: boolean;
}

export function LanguageSelect({ useAccentBackground = false, useShadow = false }: LanguageSelectProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="">
      <Select value={language} onValueChange={(value) => setLanguage(value as "ro" | "en")}>
        <SelectTrigger className={`w-[100px] ${useAccentBackground ? '!bg-accent !text-accent-foreground !border-border' : ''} ${useShadow ? 'shadow-lg' : ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ro">🇷🇴 RO</SelectItem>
          <SelectItem value="en">🇬🇧 EN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
