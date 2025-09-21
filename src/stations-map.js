import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStations } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";
import { STATUS_COLORS } from "./colors.js";
import { showStationInfos } from "./stations-info-focus.js";

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
      .on("click", () => showStationInfos(station.id))
      .addTo(map);
  });

  stopLoading("map");

  return map;
};
