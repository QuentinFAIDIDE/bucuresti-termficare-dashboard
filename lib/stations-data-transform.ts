import { StationDetail } from "./api";

export interface TimelineEntry {
  start: number;
  end: number;
  status: string;
  description: string;
}

export const incidentsTimelineFromPoints = (entries: StationDetail[]): TimelineEntry[] => {
  const timeline: TimelineEntry[] = [];
  let lastStatus = "";
  let lastIncident = "";
  let lastIncidentTs: number | null = null;

  if (entries.length === 0) {
    return [];
  }

  entries.forEach((entry) => {
    const timestamp = entry.timestamp.getTime();
    
    if (lastIncidentTs === null) {
      lastIncidentTs = timestamp;
      lastIncident = entry.description;
      lastStatus = entry.status;
    } else if (lastStatus !== entry.status) {
      timeline.push({
        start: lastIncidentTs,
        end: timestamp,
        status: lastStatus,
        description: lastIncident,
      });
      lastIncidentTs = timestamp;
      lastIncident = entry.description;
      lastStatus = entry.status;
    }
  });

  timeline.push({
    start: lastIncidentTs!,
    end: Date.now(),
    status: lastStatus,
    description: lastIncident,
  });

  return timeline;
};

export const nMostRecentIncidentsFromTimelineData = (timeline: TimelineEntry[], n = 10): TimelineEntry[] => {
  return timeline
    .filter((entry) => entry.status !== "working")
    .sort((a, b) => b.start - a.start)
    .slice(0, n);
};