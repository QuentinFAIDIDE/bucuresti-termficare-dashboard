import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import { getCountData } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";
import { t } from "./i18n.js";
import { STATUS_COLORS, STATUS_COLORS_ALPHA } from "./colors.js";

Chart.register(...registerables);

export const updateCountData = async () => {
  startLoading("countChart");

  const data = await getCountData();
  const mostRecentCounts = getMostRecentCountDatums(data);

  createStatusSummary(mostRecentCounts);
  updateLastFetchTimestamp(mostRecentCounts.timestamp);
  createHistoricalChart(data);

  stopLoading("countChart");
};

const createHistoricalChart = (data) => {
  const ctx = document.getElementById("historical-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.timestamps,
      datasets: [
        {
          label: "Working",
          data: data.working,
          backgroundColor: STATUS_COLORS_ALPHA.working,
          borderColor: STATUS_COLORS.working,
          fill: true,
          tension: 0.3,
        },
        {
          label: "Experiencing Issues",
          data: data.issues,
          backgroundColor: STATUS_COLORS_ALPHA.issues,
          borderColor: STATUS_COLORS.issues,
          fill: true,
          tension: 0.3,
        },
        {
          label: "Broken",
          data: data.broken,
          backgroundColor: STATUS_COLORS_ALPHA.broken,
          borderColor: STATUS_COLORS.broken,
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
};

const createStatusSummary = (mostRecentCounts) => {
  const container = document.getElementById("status-summary");
  container.innerHTML = "";

  const statsSection = document.createElement("div");
  statsSection.className = "stats-section";

  mostRecentCounts.counts.forEach((item) => {
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
};

const updateLastFetchTimestamp = (timestamp) => {
  const lastTimestamp = timestamp;
  const dateStr = lastTimestamp.toLocaleDateString();
  const timeStr = lastTimestamp.toLocaleTimeString();
  const fullDateTime = `${dateStr} ${timeStr}`;

  const warningLastUpdateDiv = document.getElementById("warning-last-update");
  if (warningLastUpdateDiv) {
    warningLastUpdateDiv.textContent = fullDateTime;
  }
};

const getMostRecentCountDatums = (data) => {
  return {
    counts: [
      {
        value: data.working[0],
        label: "status.working",
        color: STATUS_COLORS.working,
      },
      {
        value: data.issues[0],
        label: "status.issues",
        color: STATUS_COLORS.issues,
      },
      {
        value: data.broken[0],
        label: "status.broken",
        color: STATUS_COLORS.broken,
      },
    ],
    timestamp: data.timestamps[0],
  };
};
