"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useTranslation } from "@/lib/translations";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-auto">
      <div className="px-6 py-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/quentin-faidide-ab2866137/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/QuentinFAIDIDE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="mailto:quentin.faidide@gmail.com"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
          <p>{t.version}</p>
          <p>{t.madeBy}</p>
        </div>
      </div>
    </footer>
  );
}
