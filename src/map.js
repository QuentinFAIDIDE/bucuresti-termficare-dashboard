import { Chart, registerables } from "chart.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStations, getStationDetails } from "./api.js";
import { t } from "./i18n.js";
import { startLoading, stopLoading } from "./spinner.js";


// Consistent status colors across all components
const STATUS_COLORS = {
  working: "rgba(34, 197, 94, 1)",
  issues: "rgba(251, 191, 36, 1)",
  broken: "rgba(239, 68, 68, 1)",
};

const STATION_CARDS_CLASS = "station-card";

const extractTimeline = (entries) => {
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

const extractIncidentList = (timeline) => {
  return timeline
    .filter((entry) => entry.status != "working")
    .sort((a, b) => b.start - a.start)
    .slice(0, 10);
};

const calculateStatistics = (timeline) => {
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

const createStatisticsSection = (stats, container) => {
  const statsSection = document.createElement("div");
  statsSection.className = "stats-section";

  const statItems = [
    {
      value: `${stats.avgIncidentHoursPerMonth}h`,
      label: "stats.avgHours",
    },
    { value: `${stats.avgIncidentDuration}h`, label: "stats.avgDuration" },
    {
      value: `${stats.longestIncident}h`,
      label: "stats.longest",
    },
  ];

  statItems.forEach((item) => {
    const statItem = document.createElement("div");
    statItem.className = "stat-item";

    const statValue = document.createElement("div");
    statValue.className = "stat-value";
    statValue.textContent = item.value;

    const statLabel = document.createElement("div");
    statLabel.className = "stat-label";
    statLabel.setAttribute("data-i18n", item.label);
    statLabel.textContent = t(item.label);

    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    statsSection.appendChild(statItem);
  });

  container.appendChild(statsSection);
};

const createOrGetSubCard = (cardId, title) => {
  let card = document.getElementById(cardId);
  if (!card) {
    card = document.createElement("div");
    card.id = cardId;
    card.className = STATION_CARDS_CLASS;

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = t(title);
    cardTitle.setAttribute("data-i18n", title);
    card.appendChild(cardTitle);

    const hr = document.createElement("hr");
    card.appendChild(hr);

    document.getElementById("sub-card").appendChild(card);
  } else {
    const title = card.querySelector("h3");
    const hr = card.querySelector("hr");
    card.innerHTML = "";
    card.appendChild(title);
    card.appendChild(hr);
  }
  return card;
};

const createTimelineChart = (timeline, container) => {
  const chartContainer = document.createElement("div");
  chartContainer.style.height = "150px";
  chartContainer.style.width = "100%";

  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);

  // Calculate min time: max between 3 months ago and earliest data
  const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const earliestData = timeline.length > 0 ? Math.min(...timeline.map(t => t.start)) : threeMonthsAgo;
  const minTime = Math.max(threeMonthsAgo, earliestData);

  new Chart(canvas, {
    type: "bar",
    data: {
      datasets: [
        {
          data: timeline.map((t) => ({
            x: [new Date(t.start), new Date(t.end)],
            y: "Timeline",
          })),
          backgroundColor: timeline.map((t) => {
            switch (t.status) {
              case "working":
                return STATUS_COLORS.working;
              case "broken":
                return STATUS_COLORS.broken;
              case "issues":
                return STATUS_COLORS.issues;
              default:
                return "gray";
            }
          }),
          barPercentage: 1,
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
            unit: "day"
          }
        },
        y: { display: false },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const t = timeline[context.dataIndex];
              return [
                `Status: ${t.status}`,
                `Description: ${t.description}`,
                `Start: ${new Date(t.start).toLocaleString()}`,
                `End: ${new Date(t.end).toLocaleString()}`,
              ];
            },
          },
        },
        legend: { display: false },
      },
      maintainAspectRatio: false,
    },
  });
};

const createIncidentsTable = (incidentList, container) => {
  if (incidentList.length === 0) {
    const noIncidentsMsg = document.createElement("p");
    noIncidentsMsg.textContent = t("incidents.noIncidents");
    noIncidentsMsg.setAttribute("data-i18n", "incidents.noIncidents");
    noIncidentsMsg.style.textAlign = "center";
    noIncidentsMsg.style.color = "#8f98a0";
    container.appendChild(noIncidentsMsg);
    return;
  }

  const table = document.createElement("table");
  table.className = "incident-table";

  const headerRow = document.createElement("tr");
  headerRow.className = "incident-table-header";
  [
    "incidents.startDate",
    "incidents.stopDate",
    "incidents.status",
    "incidents.description",
  ].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = t(header);
    th.setAttribute("data-i18n", header);
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  incidentList.forEach((incident) => {
    const row = document.createElement("tr");

    const startDateCell = document.createElement("td");
    startDateCell.textContent += new Date(incident.start).toLocaleString(
      "ro-RO"
    );

    const endDateCell = document.createElement("td");
    endDateCell.textContent = new Date(incident.end).toLocaleString("ro-RO");

    const statusCell = document.createElement("td");
    statusCell.textContent = incident.status;
    statusCell.className =
      incident.status === "broken" ? "status-broken" : "status-issues";

    const descCell = document.createElement("td");
    descCell.textContent = incident.description || "No description";

    row.appendChild(startDateCell);
    row.appendChild(endDateCell);
    row.appendChild(statusCell);
    row.appendChild(descCell);
    table.appendChild(row);
  });

  container.appendChild(table);
};

const focusStation = async (geoid) => {

  startLoading("stat-" + geoid)

  const entries = await getStationDetails(geoid);
  const timeline = extractTimeline(entries);
  const incidentList = extractIncidentList(timeline);

  // Get station name from stations data
  const stations = await getStations();
  const station = stations.find((s) => s.id === geoid);
  const stationName = station ? station.name : `Station ${geoid}`;

  // Clear placeholder and display station name at top of sub-card
  const subCard = document.getElementById("sub-card");
  const placeholder = subCard.querySelector(".no-selection-placeholder");
  if (placeholder) {
    placeholder.remove();
  }

  let stationTitle = subCard.querySelector(".station-title");
  if (!stationTitle) {
    stationTitle = document.createElement("h2");
    stationTitle.className = "station-title";
    subCard.insertBefore(stationTitle, subCard.firstChild);
  }
  stationTitle.textContent = stationName;

  // Create statistics card
  const statsCard = createOrGetSubCard("statistics-card", "stats.title");
  const stats = calculateStatistics(timeline);
  createStatisticsSection(stats, statsCard);

  const timelineCard = createOrGetSubCard("timeline-card", "timeline.title");
  createTimelineChart(timeline, timelineCard);

  const incidentsCard = createOrGetSubCard("incidents-card", "incidents.title");
  createIncidentsTable(incidentList, incidentsCard);

  // Scroll to sub-card
  document.getElementById("sub-card").scrollIntoView({ behavior: "smooth" });

  stopLoading("stat-" + geoid)
};

export const initMap = async () => {

  startLoading("map");

  // Initialize Bucharest map
  const map = L.map("map").setView([44.4268, 26.1025], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  const stations = await getStations();

  stations.forEach((station) => {
    L.circleMarker([station.latitude, station.longitude], {
      color: STATUS_COLORS[station.status],
      fillColor: STATUS_COLORS[station.status],
      fillOpacity: 0.8,
      radius: 3,
    })
      .bindTooltip(station.name)
      .on("click", () => focusStation(station.id))
      .addTo(map);
  });

  stopLoading("map");

  return map;
};
