const baseApiUri = "https://2q8q4aa81c.execute-api.eu-south-2.amazonaws.com/prod/";

export type CountData = {
  timestamps: Date[];
  working: number[];
  issues: number[];
  broken: number[];
};

export type Station = {
  id: string;
  status: string;
  longitude: number;
  latitude: number;
  name: string;
};

export type StationDetail = {
  status: string;
  timestamp: Date;
  description: string;
  failureType: string;
};

export type StationStats = {
  id: string;
  rank: number;
  longitude: number;
  latitude: number;
  name: string;
  avgMonthlyIncidentTimeHours: number;
  avgIncidentTimeHours: number;
  maxIncidentTimeHours: number;
};

export type StationsStatsResult = {
  byRank: StationStats[];
  byId: Record<string, StationStats>;
};

export type LocationResult = {
  latitude: number;
  longitude: number;
  name: string;
};

export const getCountData = async (): Promise<CountData> => {
  const response = await fetch(baseApiUri + "counts");
  const respData = await response.json();
  const rawData = respData.data;

  const timestamps = rawData.map((entry: any) => new Date(entry.time * 1000));
  const working = rawData.map((entry: any) => entry.numGreen);
  const issues = rawData.map((entry: any) => entry.numYellow);
  const broken = rawData.map((entry: any) => entry.numRed);

  return { timestamps, working, issues, broken };
};

export const getStations = async (): Promise<Station[]> => {
  const response = await fetch(baseApiUri + "/stations");
  const rawData = await response.json();
  const data = rawData.data.map((station: any) => ({
    id: station.geoId,
    status: station.lastStatus,
    longitude: station.longitude,
    latitude: station.latitude,
    name: station.name,
  }));
  return data;
};

export const getStationDetails = async (stationId: string): Promise<StationDetail[]> => {
  const response = await fetch(baseApiUri + `/station-details?geoId=${stationId}`);
  const rawData = await response.json();
  const data = rawData.data
    .map((station: any) => ({
      status: station.status,
      timestamp: new Date(station.fetchTime * 1000),
      description: station.incidentText,
      failureType: station.incidentType,
    }))
    .sort((a: StationDetail, b: StationDetail) => a.timestamp.getTime() - b.timestamp.getTime());
  return data;
};

export const getStationsStats = async (): Promise<StationsStatsResult> => {
  const response = await fetch(baseApiUri + "/stations-stats");
  const rawData = await response.json();

  const data = rawData.data.map((station: any) => ({
    id: station.geoId,
    rank: station.rank,
    longitude: station.longitude,
    latitude: station.latitude,
    name: station.lastName,
    avgMonthlyIncidentTimeHours: station.avgMonthlyIncidentTimeHours,
    avgIncidentTimeHours: station.avgIncidentTimeHours,
    maxIncidentTimeHours: station.maxIncidentTimeHours,
  }));

  const sortedData = data.sort((a: StationStats, b: StationStats) => a.rank - b.rank);
  const stationsMap = data.reduce((map: Record<string, StationStats>, station: StationStats) => {
    map[station.id] = station;
    return map;
  }, {});

  return {
    byRank: sortedData,
    byId: stationsMap,
  };
};

export const searchLocation = async (location: string): Promise<LocationResult | null> => {
  try {
    const response = await fetch(baseApiUri + `location?location=${encodeURIComponent(`"${location}"`)}`);  
    const rawData = await response.json();
    
    if (!rawData.data || typeof rawData.data.latitude !== 'number' || typeof rawData.data.longitude !== 'number') {
      return null;
    }
    
    return {
      latitude: rawData.data.latitude,
      longitude: rawData.data.longitude,
      name: rawData.data.address || location,
    };
  } catch (error) {
    console.error('Location search failed:', error);
    return null;
  }
};

