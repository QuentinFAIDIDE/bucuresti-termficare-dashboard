import { getStationsStats } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";
import { showStationInfos } from "./stations-info-focus.js";
import { formatHours } from "./stations-data-transform.js";
import { clickStationOnMap } from "./stations-map.js";

let currentPage = 1;
const itemsPerPage = 10;
let stationsData = [];

export const updateStationsList = async () => {
  startLoading("stations-stats");
  const stationsRanked = await getStationsStats();
  stationsData = stationsRanked.byRank;
  stopLoading("stations-stats");

  renderTable();
  setupPagination();
};

const renderTable = () => {
  const tbody = document.getElementById("stations-table-body");
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = stationsData.slice(startIndex, endIndex);

  tbody.innerHTML = pageData
    .map(
      (station) => `
    <tr>
      <td>${station.rank}</td>
      <td>${station.name}</td>
      <td>${formatHours(station.avgMonthlyIncidentTimeHours)}</td>
      <td><button class="map-focus-btn" data-station-id="${
        station.id
      }">📍</button></td>
    </tr>
  `
    )
    .join("");

  // Add click handlers for Open buttons
  tbody.querySelectorAll(".map-focus-btn").forEach((btn) => {
    btn.onclick = () => clickStationOnMap(btn.dataset.stationId);
  });

  updatePaginationInfo();
};

const setupPagination = () => {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  };

  nextBtn.onclick = () => {
    const totalPages = Math.ceil(stationsData.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  };
};

const updatePaginationInfo = () => {
  const totalPages = Math.ceil(stationsData.length / itemsPerPage);
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
};
