import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatHours = (hours: number): string => {
  const roundedHours = Math.round(hours);

  if (roundedHours < 24) {
    return `${roundedHours}h`;
  }
  const days = Math.floor(roundedHours / 24);
  const remainingHours = roundedHours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const convertCountDataToChartData = (countData: {
  timestamps: Date[];
  working: number[];
  issues: number[];
  broken: number[];
}) => {
  const seenDates = new Set<string>();
  const result = [];

  for (let index = 0; index < countData.timestamps.length; index++) {
    const timestamp = countData.timestamps[index];
    const dateKey = timestamp.toISOString().split("T")[0];

    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey);
      const ts = new Date(timestamp);
      ts.setHours(8, 0, 0, 0);
      result.push({
        time: ts.getTime(),
        working: countData.working[index],
        issues: countData.issues[index],
        broken: countData.broken[index],
      });
    }
  }

  result.sort((a, b) => a.time - b.time);
  result.pop();

  return result;
};
