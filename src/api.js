const baseApiUri =
  typeof __API_URL__ !== "undefined"
    ? __API_URL__
    : "https:/XXXXXXXX.execute-api.eu-south-2.amazonaws.com/prod/";

// API functions
export const getCountData = async () => {
  const response = await fetch(baseApiUri + "counts");
  const respData = await response.json();
  const rawData = respData.data;

  let timestamps = rawData.map((entry) => new Date(entry.time * 1000));
  let working = rawData.map((entry) => entry.numGreen);
  let issues = rawData.map((entry) => entry.numYellow);
  let broken = rawData.map((entry) => entry.numRed);

  return { timestamps, working, issues, broken };
};

export const getStations = async () => {
  const response = await fetch(baseApiUri + "/stations");
  const rawData = await response.json();
  const data = rawData.data.map((station) => ({
    id: station.geoId,
    status: station.lastStatus,
    longitude: station.longitude,
    latitude: station.latitude,
    name: station.name,
  }));
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
