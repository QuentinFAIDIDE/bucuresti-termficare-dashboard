import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStations } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";
import { STATUS_COLORS } from "./colors.js";
import { showStationInfos } from "./stations-info-focus.js";

const selectedColor = "rgba(2, 178, 209, 1)";

var stationMarkers = {};
let selectedMarkerId = null;
let cachedStationsColors = {};

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
    const stationmarker = L.circleMarker(
      [station.latitude, station.longitude],
      {
        color: STATUS_COLORS[station.status],
        fillColor: STATUS_COLORS[station.status],
        fillOpacity: 0.8,
        radius: 3,
      }
    )
      .bindTooltip(station.name)
      .on("click", () => {
        const oldMarker = stationMarkers[selectedMarkerId];
        const thisMarker = stationMarkers[station.id];

        if (oldMarker) {
          oldMarker.setStyle({
            color: cachedStationsColors[selectedMarkerId],
            fillColor: cachedStationsColors[selectedMarkerId],
            fillOpacity: 0.8,
            radius: 3,
          });
        }

        thisMarker.setStyle({
          color: selectedColor,
          fillColor: selectedColor,
          fillOpacity: 1,
          radius: 10,
        });

        selectedMarkerId = station.id;

        // Zoom to marker
        map.setView([station.latitude, station.longitude], 15);

        showStationInfos(station.id);
      })
      .addTo(map);

    cachedStationsColors[station.id] = STATUS_COLORS[station.status];
    stationMarkers[station.id] = stationmarker;
  });

  stopLoading("map");

  return map;
};

export const clickStationOnMap = (stationId) => {
  const marker = stationMarkers[stationId];
  if (marker) {
    marker.fire("click");
  }
};
