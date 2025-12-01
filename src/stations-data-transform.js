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
  if (incidents.length === 0) {
    return {
      avgIncidentHoursPerMonth: 0,
      avgIncidentDuration: 0,
      longestIncident: 0,
    };
  }

  const oneHour = 60 * 60 * 1000;
  const oneMonth = 31 * 24 * oneHour;

  const firstDate = getFirstDateFromTimeline(timeline);
  const lastDate = getLastDateFromTimeline(timeline);

  // Calculate total incident hours
  const totalIncidentHours = incidents.reduce((total, incident) => {
    const duration = (incident.end - incident.start) / oneHour;
    return total + duration;
  }, 0);

  // Average incident hours per month
  const avgIncidentHoursPerMonth = Math.round(
    totalIncidentHours / ((lastDate - firstDate) / oneMonth)
  );

  // Average incident duration
  const avgIncidentDuration = Math.round(totalIncidentHours / incidents.length);

  // Longest incident duration
  const longestIncident = incidents.reduce((longest, incident) => {
    const duration = (incident.end - incident.start) / (1000 * 60 * 60);
    return duration > longest ? duration : longest;
  }, 0);

  return {
    avgIncidentHoursPerMonth,
    avgIncidentDuration,
    longestIncident: Math.round(longestIncident),
  };
};

const getFirstDateFromTimeline = (timeline) => {
  if (timeline.length === 0) {
    return null;
  }
  return Math.min(...timeline.map((entry) => entry.start));
};

const getLastDateFromTimeline = (timeline) => {
  if (timeline.length === 0) {
    return null;
  }
  return Math.max(...timeline.map((entry) => entry.end));
};

export const formatHours = (hours) => {
  let roundedHours = Math.round(hours);

  if (roundedHours < 24) {
    return `${Math.round(roundedHours)}h`;
  }
  const days = Math.floor(roundedHours / 24);
  const remainingHours = roundedHours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};
