import L from "leaflet";
import "leaflet/dist/leaflet.css";

const generateDummyHeatingStations = () => {
  const stations_ids = [12, 15, 25];
  const stations_status = ["working", "broken", "issues"];
  const stations_longitudes = [26.119855, 26.013808, 26.135406];
  const stations_latitudes = [44.386471, 44.440822, 44.382201];
  const stations_names = ["Station 1", "Station 2", "Station 3"];

  return stations_ids.map((id, index) => ({
    id,
    status: stations_status[index],
    longitude: stations_longitudes[index],
    latitude: stations_latitudes[index],
    name: stations_names[index]
  }));
}

const focusStation = (geoid) => {
  // TODO: download station data
  // TODO: clear and add card div for station below map
  console.log("Station", geoid);
};

export const initMap = () => {
  // Initialize Bucharest map
  const map = L.map("map").setView([44.4268, 26.1025], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  const stations = generateDummyHeatingStations();
  const statusColors = { working: "green", broken: "red", issues: "orange" };

  stations.forEach(station => {
    L.circleMarker([station.latitude, station.longitude], {
      color: statusColors[station.status],
      fillColor: statusColors[station.status],
      fillOpacity: 0.8,
      radius: 8
    }).bindTooltip(station.name)
      .on('click', () => focusStation(station.id))
      .addTo(map);
  });

  return map;
};