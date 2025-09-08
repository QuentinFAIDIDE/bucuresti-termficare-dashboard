const isDev = import.meta.env.DEV;

// Mock data generators
const generateDummyCountData = () => {
  const timestamps = [];
  const working = [];
  const issues = [];
  const broken = [];

  for (let i = 29; i >= 0; i--) {
    const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
    timestamps.push(timestamp);
    working.push(Math.floor(Math.random() * 50) + 100);
    issues.push(Math.floor(Math.random() * 20) + 10);
    broken.push(Math.floor(Math.random() * 15) + 5);
  }

  return { timestamps, working, issues, broken };
};

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
};

// API functions
export const getCountData = async () => {
  if (isDev) {
    return generateDummyCountData();
  }
  const response = await fetch('/api/counts');
  return response.json();
};

export const getStations = async () => {
  if (isDev) {
    return generateDummyHeatingStations();
  }
  const response = await fetch('/api/stations');
  return response.json();
};

export const getStationDetails = async (stationId) => {
  if (isDev) {
    return { id: stationId, name: `Station ${stationId}`, details: "Mock details" };
  }
  const response = await fetch(`/api/stations/${stationId}`);
  return response.json();
};