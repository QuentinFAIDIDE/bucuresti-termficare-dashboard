import { Chart, registerables } from "chart.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStations, getStationDetails } from "./api.js";

// Consistent status colors across all components
const STATUS_COLORS = {
  working: "rgba(34, 197, 94, 1)",
  issues: "rgba(251, 191, 36, 1)", 
  broken: "rgba(239, 68, 68, 1)"
};

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

const focusStation = async (geoid) => {
  // TODO: download station data
  const entries = await getStationDetails(geoid);
  const timeline = extractTimeline(entries);

  timeline.forEach((t) => {
    if (t.start === null || t.end === null) {
      console.log(
        new Date(t.start).toLocaleString(),
        new Date(t.end).toLocaleString(),
        t.status,
        t.description
      );
    }
  });

  const incidentList = extractIncidentList(timeline);

  // Create or get the timeline card
  let timelineCard = document.getElementById("timeline-card");
  if (!timelineCard) {
    timelineCard = document.createElement("div");
    timelineCard.id = "timeline-card";
    timelineCard.className = "card";

    const cardTitle = document.createElement("h1");
    cardTitle.textContent = "Timeline";
    timelineCard.appendChild(cardTitle);

    const hr = document.createElement("hr");
    timelineCard.appendChild(hr);

    // Insert after the map card
    const mapCard = document.querySelector(".card:nth-child(3)"); // The map card
    mapCard.parentNode.insertBefore(timelineCard, mapCard.nextSibling);
  } else {
    // Clear existing content except title and hr
    const title = timelineCard.querySelector("h1");
    const hr = timelineCard.querySelector("hr");
    timelineCard.innerHTML = "";
    timelineCard.appendChild(title);
    timelineCard.appendChild(hr);
  }

  // Create canvas container with fixed height
  const chartContainer = document.createElement("div");
  chartContainer.style.height = "150px";
  chartContainer.style.width = "100%";

  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);
  timelineCard.appendChild(chartContainer);

  // Initialize Chart.js timeline
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
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 30,
          right: 30,
        },
      },
      indexAxis: "y",
      scales: {
        x: {
          type: "time",
          beginAtZero: false,
          min: Date.now() - 30 * 24 * 60 * 60 * 1000,
          max: Date.now(),
        },
        y: {
          display: false,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const t = timeline[context.dataIndex];
              const start = new Date(t.start).toLocaleString();
              const end = new Date(t.end).toLocaleString();
              return [
                `Status: ${t.status}`,
                `Description: ${t.description}`,
                `Start: ${start}`,
                `End: ${end}`,
              ];
            },
          },
        },
        legend: {
          display: false,
        },
      },
      maintainAspectRatio: false,
    },
  });

  // Create or get the incidents card
  let incidentsCard = document.getElementById("incidents-card");
  if (!incidentsCard) {
    incidentsCard = document.createElement("div");
    incidentsCard.id = "incidents-card";
    incidentsCard.className = "card";

    const cardTitle = document.createElement("h1");
    cardTitle.textContent = "Last 10 Incidents";
    incidentsCard.appendChild(cardTitle);

    const hr = document.createElement("hr");
    incidentsCard.appendChild(hr);

    // Insert after the timeline card
    timelineCard.parentNode.insertBefore(incidentsCard, timelineCard.nextSibling);
  } else {
    // Clear existing content except title and hr
    const title = incidentsCard.querySelector("h1");
    const hr = incidentsCard.querySelector("hr");
    incidentsCard.innerHTML = "";
    incidentsCard.appendChild(title);
    incidentsCard.appendChild(hr);
  }

  // Create incidents table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const headerRow = document.createElement("tr");
  ["Start Date", "Stop Date", "Status", "Description"].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.style.border = "1px solid rgba(76, 84, 90, 0.5)";
    th.style.padding = "8px";
    th.style.backgroundColor = "#2a475e33";
    th.style.color = "#c7d5e0";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  incidentList.forEach((incident, index) => {
    const row = document.createElement("tr");
    if (index % 2 === 1) {
      row.style.backgroundColor = "#2a475e33";
    }

    const startDateCell = document.createElement("td");
    startDateCell.textContent = new Date(incident.start).toLocaleDateString();
    startDateCell.style.border = "1px solid rgba(76, 84, 90, 0.5)";
    startDateCell.style.padding = "8px";
    startDateCell.style.color = "#c7d5e0";

    const endDateCell = document.createElement("td");
    endDateCell.textContent = new Date(incident.end).toLocaleDateString();
    endDateCell.style.border = "1px solid rgba(76, 84, 90, 0.5)";
    endDateCell.style.padding = "8px";
    endDateCell.style.color = "#c7d5e0";

    const statusCell = document.createElement("td");
    statusCell.textContent = incident.status;
    statusCell.style.border = "1px solid rgba(76, 84, 90, 0.5)";
    statusCell.style.padding = "8px";
    statusCell.style.color = incident.status === "broken" ? STATUS_COLORS.broken : STATUS_COLORS.issues;

    const descCell = document.createElement("td");
    descCell.textContent = incident.description || "No description";
    descCell.style.border = "1px solid rgba(76, 84, 90, 0.5)";
    descCell.style.padding = "8px";
    descCell.style.color = "#c7d5e0";

    row.appendChild(startDateCell);
    row.appendChild(endDateCell);
    row.appendChild(statusCell);
    row.appendChild(descCell);

    table.appendChild(row);
  });

  incidentsCard.appendChild(table);
};

export const initMap = async () => {
  // Initialize Bucharest map
  const map = L.map("map").setView([44.4268, 26.1025], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  const stations = await getStations();
  const statusColors = { working: STATUS_COLORS.working, broken: STATUS_COLORS.broken, issues: STATUS_COLORS.issues };

  stations.forEach((station) => {
    L.circleMarker([station.latitude, station.longitude], {
      color: statusColors[station.status],
      fillColor: statusColors[station.status],
      fillOpacity: 0.8,
      radius: 8,
    })
      .bindTooltip(station.name)
      .on("click", () => focusStation(station.id))
      .addTo(map);
  });

  return map;
};
