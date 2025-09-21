import {
  incidentsTimelineFromPoints,
  nMostRecentIncidentsFromTimelineData,
  computeStationStatisticsFromTimelineData,
} from "./stations-data-transform.js";

describe("incidentsTimelineFromPoints", () => {
  it("should return empty array for empty input", () => {
    const result = incidentsTimelineFromPoints([]);
    expect(result).toEqual([]);
  });

  it("should create timeline from status changes", () => {
    const entries = [
      { timestamp: 1000, status: "working", description: null },
      { timestamp: 1500, status: "working", description: null },
      { timestamp: 2000, status: "broken", description: "System failure" },
      { timestamp: 3000, status: "working", description: null },
    ];

    const result = incidentsTimelineFromPoints(entries);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      start: 1000,
      end: 2000,
      status: "working",
      description: null,
    });
    expect(result[1]).toEqual({
      start: 2000,
      end: 3000,
      status: "broken",
      description: "System failure",
    });
  });
});

describe("nMostRecentIncidentsFromTimelineData", () => {
  it("should filter out working status and return most recent incidents", () => {
    const timeline = [
      { start: 1000, status: "working", description: null },
      { start: 2000, status: "broken", description: "Issue 1" },
      { start: 3000, status: "issues", description: "Issue 2" },
      { start: 4000, status: "broken", description: "Issue 3" },
    ];

    const result = nMostRecentIncidentsFromTimelineData(timeline, 2);
    expect(result).toHaveLength(2);
    expect(result[0].start).toBe(4000);
    expect(result[1].start).toBe(3000);
  });
});

describe("computeStationStatisticsFromTimelineData", () => {
  it("should compute statistics from timeline data", () => {
    const oneHour = 60 * 60 * 1000;
    const oneWeek = 7 * 24 * oneHour;
    const oneMonth = 31 * 24 * oneHour;
    const now = Date.now();

    // most recent month: 5h of incidents
    // second recent month: 0h of incidents
    // third recent month: 10h of incidents
    // expected an average of around 5h of incidents per month
    // longest incident should be 10h
    // avg incident duration should be 5h

    const workingStatusStart = now - oneMonth * 3;
    const workingStatusEnd = now;

    const recentMonthIncident1Start = workingStatusEnd - oneWeek;
    const recentMonthIncident2Start = workingStatusEnd - oneWeek * 2;
    const oldIncidentStart = workingStatusStart + oneWeek;

    // statuses in most recent to oldest order
    const timeline = [
      {
        start: workingStatusStart,
        end: workingStatusStart + oneHour,
        status: "working",
      },

      {
        start: recentMonthIncident1Start,
        end: recentMonthIncident1Start + oneHour * 2,
        status: "broken",
      },
      {
        start: recentMonthIncident2Start,
        end: recentMonthIncident2Start + oneHour * 3,
        status: "broken",
      },
      {
        start: oldIncidentStart,
        end: oldIncidentStart + oneHour * 10,
        status: "broken",
      },
      {
        start: workingStatusEnd - oneHour,
        end: workingStatusEnd,
        status: "working",
      },
    ];

    const result = computeStationStatisticsFromTimelineData(timeline);
    expect(result).toHaveProperty("avgIncidentHoursPerMonth");
    expect(Math.abs(result.avgIncidentHoursPerMonth - 5.0)).toBeLessThan(
      0.0001
    );

    expect(result).toHaveProperty("avgIncidentDuration");
    expect(Math.abs(result.avgIncidentDuration - 5.0)).toBeLessThan(0.0001);

    expect(result).toHaveProperty("longestIncident");
    expect(Math.abs(result.longestIncident - 10.0)).toBeLessThan(0.0001);
  });

  it("should return zero values for no incidents", () => {
    const timeline = [{ start: 1000, end: 2000, status: "working" }];

    const result = computeStationStatisticsFromTimelineData(timeline);
    expect(result.avgIncidentHoursPerMonth).toBe(0);
    expect(result.avgIncidentDuration).toBe(0);
    expect(result.longestIncident).toBe(0);
  });

  it("should return zero values for no incidents", () => {
    const timeline = [];

    const result = computeStationStatisticsFromTimelineData(timeline);
    expect(result.avgIncidentHoursPerMonth).toBe(0);
    expect(result.avgIncidentDuration).toBe(0);
    expect(result.longestIncident).toBe(0);
  });
});
