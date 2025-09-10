import { Chart, registerables } from "chart.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStations, getStationDetails } from "./api.js";

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
    end: Math.floor(Date.now() / 1000),
    status: lastStatus,
    description: lastIncident,
  });

  return timeline;
};

const extractIncidentList = (entries) => {
  const incidentList = [];
  entries.forEach((entry) => {});
  return incidentList;
};

const focusStation = async (geoid) => {
  // TODO: download station data
  const entries = await getStationDetails(geoid);
  const timeline = extractTimeline(entries);
  const incidentList = extractIncidentList(entries);
  // TODO: clear all children of map-station-placeholder
  // TODO: insert a timeline chart in map-station-placeholder
  // Clear existing content
  const placeholder = document.getElementById("map-station-placeholder");
  placeholder.innerHTML = "";

  // Create canvas element
  const canvas = document.createElement("canvas");
  placeholder.appendChild(canvas);

  // Initialize Chart.js timeline
  new Chart(canvas, {
    type: "bar",
    data: {
      datasets: [
        {
          data: timeline.map((t) => ({
            x: [new Date(t.start * 1000), new Date(t.end * 1000)],
            y: "Timeline",
          })),
          backgroundColor: timeline.map((t) => {
            switch (t.status) {
              case "working":
                return "green";
              case "broken":
                return "red";
              case "issues":
                return "orange";
              default:
                return "gray";
            }
          }),
          barPercentage: 0.8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      scales: {
        x: {
          type: "time",
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
              const start = new Date(t.start * 1000).toLocaleString();
              const end = new Date(t.end * 1000).toLocaleString();
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
  const statusColors = { working: "green", broken: "red", issues: "orange" };

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
