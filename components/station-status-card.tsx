"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { STATUS_TAILWIND_CLASSES } from "@/lib/status-colors";

interface StationStatusCardProps {
  working: number;
  issues: number;
  broken: number;
}

export function StationStatusCard({ working, issues, broken }: StationStatusCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="w-full bg-default">
      <CardHeader>
        <CardTitle className="text-xl">{t.stationStatus}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t.stationStatusDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-4">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${STATUS_TAILWIND_CLASSES.working}`}>{working}</span>
            <span className="text-sm text-muted-foreground mt-2">{t.working}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${STATUS_TAILWIND_CLASSES.issue}`}>{issues}</span>
            <span className="text-sm text-muted-foreground mt-2">{t.issues}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${STATUS_TAILWIND_CLASSES.broken}`}>{broken}</span>
            <span className="text-sm text-muted-foreground mt-2">{t.broken}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
