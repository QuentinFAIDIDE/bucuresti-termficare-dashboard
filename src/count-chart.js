import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import { getCountData } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";
import { t } from "./i18n.js";

Chart.register(...registerables);

const createStatusSummary = (data) => {
  const container = document.getElementById("status-summary");
  container.innerHTML = "";

  const statsSection = document.createElement("div");
  statsSection.className = "stats-section";

  const lastIndex = 0;
  const statItems = [
    {
      value: data.working[lastIndex],
      label: "status.working",
      color: "rgba(34, 197, 94, 1)",
    },
    {
      value: data.issues[lastIndex],
      label: "status.issues",
      color: "rgba(251, 191, 36, 1)",
    },
    {
      value: data.broken[lastIndex],
      label: "status.broken",
      color: "rgba(239, 68, 68, 1)",
    },
  ];

  statItems.forEach((item) => {
    const statItem = document.createElement("div");
    statItem.className = "stat-item";

    const statValue = document.createElement("div");
    statValue.className = "stat-value";
    statValue.textContent = item.value;
    statValue.style.color = item.color;

    const statLabel = document.createElement("div");
    statLabel.className = "stat-label";
    statLabel.setAttribute("data-i18n", item.label);
    statLabel.textContent = t(item.label);

    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    statsSection.appendChild(statItem);
  });

  container.appendChild(statsSection);

  // Update last update timestamp in warning card
  const lastTimestamp = data.timestamps[lastIndex];
  const dateStr = lastTimestamp.toLocaleDateString();
  const timeStr = lastTimestamp.toLocaleTimeString();
  const fullDateTime = `${dateStr} ${timeStr}`;

  const warningLastUpdateDiv = document.getElementById("warning-last-update");
  if (warningLastUpdateDiv) {
    warningLastUpdateDiv.textContent = fullDateTime;
  }
};

export const initCountChart = async () => {
  startLoading("countChart");

  const data = await getCountData();

  createStatusSummary(data);

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

  stopLoading("countChart");

  return chart;
};
