"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";
import { STATUS_COLORS, STATUS_COLORS_DIMMED } from "@/lib/status-colors";
import { generateMockChartData } from "@/lib/chart-data";

const chartConfig = {
  working: {
    label: "Working",
    color: STATUS_COLORS.working,
  },
  issues: {
    label: "Issues",
    color: STATUS_COLORS.issue,
  },
  broken: {
    label: "Broken",
    color: STATUS_COLORS.broken,
  },
} satisfies ChartConfig;

interface StationStatusChartProps {
  data?: Array<{
    time: number;
    working: number;
    issues: number;
    broken: number;
  }>;
}

export function StationStatusChart({ data }: StationStatusChartProps) {
  const { t, language } = useTranslation();
  const [timeRange, setTimeRange] = useState<"month" | "year">("year");
  const rawData = data || generateMockChartData();
  const locale = language === "en" ? "en-US" : "ro-RO";

  const now = new Date();
  const cutoffDate =
    timeRange === "month"
      ? new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      : new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const chartData = rawData.filter((item) => item.time >= cutoffDate.getTime());

  return (
    <Card className="w-full bg-default pt-0">
      <CardHeader className="flex flex-row items-stretch justify-between p-0 !pb-0 border-b">
        <div className="flex flex-col justify-center px-6 py-5 flex-1">
          <CardTitle className="text-xl">{t.stationStatusHistory}</CardTitle>
          <CardDescription>{t.stationStatusHistoryDesc}</CardDescription>
        </div>
        <div className="flex">
          <div
            onClick={() => setTimeRange("month")}
            className={`cursor-pointer px-6 flex items-center justify-center border-l transition-colors ${
              timeRange === "month" ? "bg-white/5" : "hover:bg-white/5"
            }`}
          >
            <span className="text-sm font-medium">{t.lastMonth}</span>
          </div>
          <div
            onClick={() => setTimeRange("year")}
            className={`cursor-pointer px-6 flex items-center justify-center border-l transition-colors ${
              timeRange === "year" ? "bg-white/5" : "hover:bg-white/5"
            }`}
          >
            <span className="text-sm font-medium">{t.lastYear}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis width={35} />
            <ChartTooltip
              cursor={{
                fill: "transparent",
                fillOpacity: 0.0,
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload.length > 0) {
                      const timestamp = payload[0].payload.time;
                      return new Date(timestamp).toLocaleDateString(locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="working"
              stackId="a"
              fill="var(--color-working)"
              radius={[0, 0, 4, 4]}
              activeBar={{ fill: STATUS_COLORS_DIMMED.working }}
            />
            <Bar
              dataKey="issues"
              stackId="a"
              fill="var(--color-issues)"
              radius={0}
              activeBar={{ fill: STATUS_COLORS_DIMMED.issue }}
            />
            <Bar
              dataKey="broken"
              stackId="a"
              fill="var(--color-broken)"
              radius={[4, 4, 0, 0]}
              activeBar={{ fill: STATUS_COLORS_DIMMED.broken }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
