import "./style.css";

import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

Chart.register(...registerables);

// Generate dummy data with unix timestamps
const generateDummyData = () => {
  const timestamps = [];
  const working = [];
  const issues = [];
  const broken = [];

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
    timestamps.push(timestamp);

    working.push(Math.floor(Math.random() * 50) + 100);
    issues.push(Math.floor(Math.random() * 20) + 10);
    broken.push(Math.floor(Math.random() * 15) + 5);
  }

  return { timestamps, working, issues, broken };
};

const data = generateDummyData();

document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("historical-chart").getContext("2d");

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.timestamps,
      datasets: [
        {
          label: "Working",
          data: data.working,
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgba(34, 197, 94, 1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Experiencing Issues",
          data: data.issues,
          backgroundColor: "rgba(251, 191, 36, 0.6)",
          borderColor: "rgba(251, 191, 36, 1)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Broken",
          data: data.broken,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgba(239, 68, 68, 1)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            displayFormats: {
              day: "MMM dd",
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  });

  // Initialize Bucharest map
  const map = L.map("map").setView([44.4268, 26.1025], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);
});
