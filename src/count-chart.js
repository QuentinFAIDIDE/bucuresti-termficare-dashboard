import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";
import { getCountData } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";

Chart.register(...registerables);

export const initCountChart = async () => {

  startLoading("countChart");

  const data = await getCountData();
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
