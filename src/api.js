const baseApiUri =
  typeof __API_URL__ !== "undefined"
    ? __API_URL__
    : "https:/XXXXXXXX.execute-api.eu-south-2.amazonaws.com/prod/";

// Cache object
const cache = {};

// API functions
export const getCountData = async () => {
  if (cache.countData) return cache.countData;
  
  const response = await fetch(baseApiUri + "counts");
  const respData = await response.json();
  const rawData = respData.data;

  let timestamps = rawData.map((entry) => new Date(entry.time * 1000));
  let working = rawData.map((entry) => entry.numGreen);
  let issues = rawData.map((entry) => entry.numYellow);
  let broken = rawData.map((entry) => entry.numRed);

  const result = { timestamps, working, issues, broken };
  cache.countData = result;
  return result;
};

export const getStations = async () => {
  if (cache.stations) return cache.stations;
  
  const response = await fetch(baseApiUri + "/stations");
  const rawData = await response.json();
  const data = rawData.data.map((station) => ({
    id: station.geoId,
    status: station.lastStatus,
    longitude: station.longitude,
    latitude: station.latitude,
    name: station.name,
  }));
  cache.stations = data;
  return data;
};

export const getStationDetails = async (stationId) => {
  const response = await fetch(
    baseApiUri + `/station-details?geoId=${stationId}`
  );
  const rawData = await response.json();
  const data = rawData.data
    .map((station) => ({
      status: station.status,
      timestamp: new Date(station.fetchTime * 1000),
      description: station.incidentText,
      failureType: station.incidentType,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  return data;
};

export const getStationsStats = async () => {
  if (cache.stationsStats) return cache.stationsStats;
  
  const response = await fetch(baseApiUri + "/stations-stats");
  const rawData = await response.json();

  const data = rawData.data.map((station) => ({
    id: station.geoId,
    rank: station.rank,
    longitude: station.longitude,
    latitude: station.latitude,
    name: station.lastName,
    avgMonthlyIncidentTimeHours: station.avgMonthlyIncidentTimeHours,
    avgIncidentTimeHours: station.avgIncidentTimeHours,
    maxIncidentTimeHours: station.maxIncidentTimeHours,
  }));

  const sortedData = data.sort((a, b) => a.rank - b.rank);
  const stationsMap = data.reduce((map, station) => {
    map[station.id] = station;
    return map;
  }, {});

  const result = {
    byRank: sortedData,
    byId: stationsMap,
  };
  cache.stationsStats = result;
  return result;
};
