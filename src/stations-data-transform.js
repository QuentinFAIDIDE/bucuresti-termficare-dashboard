export const incidentsTimelineFromPoints = (entries) => {
  const timeline = [];
  let lastStatus = "";
  let lastIncident = "";
  let lastIncidentTs = null;

  if (entries.length === 0) {
    return [];
  }

  entries.forEach((entry) => {
    if (lastIncidentTs === null) {
      lastIncidentTs = entry.timestamp;
      lastIncident = entry.description;
      lastStatus = entry.status;
    } else if (lastStatus != entry.status) {
      timeline.push({
        start: lastIncidentTs,
        end: entry.timestamp,
        status: lastStatus,
        description: lastIncident,
      });
      lastIncidentTs = entry.timestamp;
      lastIncident = entry.description;
      lastStatus = entry.status;
    }
  });

  timeline.push({
    start: lastIncidentTs,
    end: Math.floor(Date.now()),
    status: lastStatus,
    description: lastIncident,
  });

  return timeline;
};

export const nMostRecentIncidentsFromTimelineData = (timeline, n = 10) => {
  return timeline
    .filter((entry) => entry.status != "working")
    .sort((a, b) => b.start - a.start)
    .slice(0, n);
};

export const computeStationStatisticsFromTimelineData = (timeline) => {
  const incidents = timeline.filter((entry) => entry.status !== "working");
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Filter incidents in the last year
  const lastYearIncidents = incidents.filter(
    (incident) => incident.start >= now - oneYear
  );

  // Calculate total incident hours
  const totalIncidentHours = lastYearIncidents.reduce((total, incident) => {
    const duration = (incident.end - incident.start) / (1000 * 60 * 60);
    return total + duration;
  }, 0);

  // Average incident hours per month
  const avgIncidentHoursPerMonth = Math.round(totalIncidentHours / 12);

  // Average incident duration
  const avgIncidentDuration =
    lastYearIncidents.length > 0
      ? Math.round(totalIncidentHours / lastYearIncidents.length)
      : 0;

  // Longest incident duration
  const longestIncident = lastYearIncidents.reduce((longest, incident) => {
    const duration = (incident.end - incident.start) / (1000 * 60 * 60);
    return duration > longest ? duration : longest;
  }, 0);

  return {
    avgIncidentHoursPerMonth,
    avgIncidentDuration,
    longestIncident: Math.round(longestIncident),
  };
};
