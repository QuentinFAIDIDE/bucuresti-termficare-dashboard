"use client";

import { NavHeader } from "@/components/nav-header";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/lib/translations";
import { useData } from "@/lib/data-store";
import { StationStatusCard } from "@/components/station-status-card";
import { StationsRankTable } from "@/components/stations-rank-table";
import { StationStatusChart } from "@/components/station-status-chart";
import { convertCountDataToChartData } from "@/lib/utils";

export default function DataView() {
  const { t } = useTranslation();
  const { countData, stations, stationsStats } = useData();

  const countChartData = countData
    ? convertCountDataToChartData(countData)
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />
      <div className="flex-1 p-4">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <StationStatusCard
            working={countData?.working[0] ?? 0}
            issues={countData?.issues[0] ?? 0}
            broken={countData?.broken[0] ?? 0}
          />
          <StationsRankTable stations={stationsStats?.byRank ?? []} />
          <StationStatusChart data={countChartData} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
