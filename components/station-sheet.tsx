"use client";

import { useEffect, useState, useRef } from "react";
import {
  Station,
  getStationDetails,
  StationDetail,
  getStationsStats,
  StationStats,
} from "@/lib/api";
import { STATUS_COLORS } from "@/lib/status-colors";
import { useTranslation } from "@/lib/translations";
import { formatHours } from "@/lib/utils";
import {
  incidentsTimelineFromPoints,
  nMostRecentIncidentsFromTimelineData,
  TimelineEntry,
} from "@/lib/stations-data-transform";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(...registerables);

interface StationSheetProps {
  stationId: string | null;
  stations: Station[];
  onClose: () => void;
}

export function StationSheet({
  stationId,
  stations,
  onClose,
}: StationSheetProps) {
  const [details, setDetails] = useState<StationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [stationStats, setStationStats] = useState<StationStats | null>(null);
  const [totalStations, setTotalStations] = useState<number>(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<TimelineEntry[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { t, language } = useTranslation();

  const station = stations.find((s) => s.id === stationId);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 500);
  };

  useEffect(() => {
    if (!stationId) {
      setIsVisible(false);
      return;
    }

    setTimeout(() => setIsVisible(true), 10);

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [detailsData, statsData] = await Promise.all([
          getStationDetails(stationId),
          getStationsStats(),
        ]);
        setDetails(detailsData);
        setStationStats(statsData.byId[stationId]);
        setTotalStations(statsData.byRank.length);

        const timelineData = incidentsTimelineFromPoints(detailsData);
        setTimeline(timelineData);
        setRecentIncidents(
          nMostRecentIncidentsFromTimelineData(timelineData, 10)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [stationId]);

  useEffect(() => {
    if (!chartRef.current || timeline.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const filteredTimeline = timeline.filter((t) => t.end >= threeMonthsAgo);
    const earliestData =
      filteredTimeline.length > 0
        ? Math.min(...filteredTimeline.map((t) => t.start))
        : threeMonthsAgo;
    const minTime = Math.max(threeMonthsAgo, earliestData);

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: filteredTimeline.map((_, i) => `Incident ${i + 1}`),
        datasets: [
          {
            data: filteredTimeline.map((t, i) => ({
              x: [t.start, t.end],
              y: i,
            })),
            backgroundColor: filteredTimeline.map((t) => {
              switch (t.status) {
                case "working":
                  return STATUS_COLORS.working;
                case "broken":
                  return STATUS_COLORS.broken;
                case "issue":
                  return STATUS_COLORS.issue;
                default:
                  return "gray";
              }
            }),
            barPercentage: 0.8,
            categoryPercentage: 1,
          },
        ],
      },
      options: {
        layout: { padding: { top: 10, bottom: 10, left: 30, right: 30 } },
        indexAxis: "y",
        scales: {
          x: {
            type: "time",
            beginAtZero: false,
            min: minTime,
            max: Date.now(),
            time: {
              unit: "day",
            },
            grid: {
              color: "#e7e7e722",
            },
            border: {
              color: "#e7e7e722",
            },
          },
          y: {
            display: true,
            type: "linear",
            min: -0.5,
            max: filteredTimeline.length - 0.5,
            grid: {
              color: "#e7e7e722",
            },
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const timelineItem = filteredTimeline[context.dataIndex];
                const locale = language === "en" ? "en-US" : "ro-RO";
                const statusText =
                  timelineItem.status === "working"
                    ? t.working
                    : timelineItem.status === "issue"
                    ? t.issues
                    : t.broken;
                return [
                  `${t.status}: ${statusText}`,
                  `${t.description}: ${
                    timelineItem.description || t.noDescription
                  }`,
                  `${t.start}: ${new Date(timelineItem.start).toLocaleString(
                    locale
                  )}`,
                  `${t.end}: ${new Date(timelineItem.end).toLocaleString(
                    locale
                  )}`,
                ];
              },
            },
          },
          legend: { display: false },
        },
        maintainAspectRatio: false,
      },
    } as any);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [timeline, language, t]);

  if (!stationId) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black/50 z-10"
        onClick={handleClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[32rem] bg-accent border-r border-border rounded-r-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] z-20 transform transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 relative">
          <h2 className="text-xl font-bold text-foreground text-center max-w-[350px] mx-auto">
            {station?.name}
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-muted-foreground hover:text-foreground text-3xl cursor-pointer p-2"
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pt-[0px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-12 h-12 border-4 border-muted-foreground border-t-foreground rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {stationStats && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    {t.statistics}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatHours(stationStats.avgMonthlyIncidentTimeHours)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.avgMonthlyHours}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatHours(stationStats.avgIncidentTimeHours)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.avgDuration}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {stationStats.rank}/{totalStations}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.rankWorst}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {t.timeline}
                </h3>
                <div className="h-48">
                  <canvas ref={chartRef} className="w-full h-full"></canvas>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {t.recentIncidents}
                </h3>
                {recentIncidents.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    {t.noIncidentsFound}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-sm font-medium text-foreground">
                            {t.start}
                          </th>
                          <th className="text-left p-2 text-sm font-medium text-foreground">
                            {t.status}
                          </th>
                          <th className="text-left p-2 text-sm font-medium text-foreground">
                            {t.description}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentIncidents.map((incident, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="p-2 text-xs text-muted-foreground">
                              {new Date(incident.start).toLocaleDateString(
                                language === "en" ? "en-US" : "ro-RO"
                              )}
                            </td>
                            <td className="p-2">
                              <span
                                className="text-xs font-medium"
                                style={{
                                  color:
                                    STATUS_COLORS[
                                      incident.status as keyof typeof STATUS_COLORS
                                    ] || STATUS_COLORS.broken,
                                }}
                              >
                                {incident.status === "working"
                                  ? t.working
                                  : incident.status === "issue"
                                  ? t.issues
                                  : t.broken}
                              </span>
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">
                              {incident.description || t.noDescription}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
