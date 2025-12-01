import { Chart, registerables } from "chart.js";

import { getStations, getStationDetails } from "./api.js";
import { t } from "./i18n.js";
import {
  incidentsTimelineFromPoints,
  nMostRecentIncidentsFromTimelineData,
  computeStationStatisticsFromTimelineData,
  formatHours,
} from "./stations-data-transform.js";
import { startLoading, stopLoading } from "./spinner.js";
import { STATUS_COLORS } from "./colors.js";

const STATION_CARDS_CLASS = "station-card";

export const showStationInfos = async (geoid) => {
  startLoading("stat-" + geoid);

  const entries = await getStationDetails(geoid);
  const timeline = incidentsTimelineFromPoints(entries);
  const incidentList = nMostRecentIncidentsFromTimelineData(timeline);

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
  const statsCard = createOrGetMapStationDetailSection(
    "statistics-card",
    "stats.title"
  );
  const stats = computeStationStatisticsFromTimelineData(timeline);
  displayStationStats(stats, statsCard);

  const timelineCard = createOrGetMapStationDetailSection(
    "timeline-card",
    "timeline.title"
  );
  displayStationTimelineChart(timeline, timelineCard);

  const incidentsCard = createOrGetMapStationDetailSection(
    "incidents-card",
    "incidents.title"
  );
  displayStationIncidentsTable(incidentList, incidentsCard);

  // Scroll to sub-card
  document.getElementById("sub-card").scrollIntoView({ behavior: "smooth" });

  stopLoading("stat-" + geoid);
};

const displayStationStats = (stats, container) => {
  const statsSection = document.createElement("div");
  statsSection.className = "stats-section";

  // Clear existing stats if they exist
  while (statsSection.firstChild) {
    statsSection.removeChild(statsSection.firstChild);
  }

  const statItems = [
    {
      value: formatHours(stats.avgIncidentHoursPerMonth),
      label: "stats.avgHours",
    },
    {
      value: formatHours(stats.avgIncidentDuration),
      label: "stats.avgDuration",
    },
    {
      value: formatHours(stats.longestIncident),
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

const displayStationTimelineChart = (timeline, container) => {
  const chartContainer = document.createElement("div");
  chartContainer.style.height = "150px";
  chartContainer.style.width = "100%";

  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);

  // Calculate min time: max between 3 months ago and earliest data
  const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const earliestData =
    timeline.length > 0
      ? Math.min(...timeline.map((t) => t.start))
      : threeMonthsAgo;
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
              case "issue":
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
            unit: "day",
          },
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

const displayStationIncidentsTable = (incidentList, container) => {
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

const createOrGetMapStationDetailSection = (cardId, title) => {
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
