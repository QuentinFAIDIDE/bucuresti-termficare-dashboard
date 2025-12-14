"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getCountData, getStations, getStationsStats, CountData, Station, StationsStatsResult } from "./api";

type DataStore = {
  countData: CountData | null;
  stations: Station[] | null;
  stationsStats: StationsStatsResult | null;
  isLoading: boolean;
  fetchCountData: () => Promise<void>;
  fetchStations: () => Promise<void>;
  fetchStationsStats: () => Promise<void>;
};

const DataContext = createContext<DataStore | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [countData, setCountData] = useState<CountData | null>(null);
  const [stations, setStations] = useState<Station[] | null>(null);
  const [stationsStats, setStationsStats] = useState<StationsStatsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCountData = async () => {
    if (countData) return;
    const data = await getCountData();
    setCountData(data);
  };

  const fetchStations = async () => {
    if (stations) return;
    const data = await getStations();
    setStations(data);
  };

  const fetchStationsStats = async () => {
    if (stationsStats) return;
    const data = await getStationsStats();
    setStationsStats(data);
  };

  useEffect(() => {
    const preloadImages = () => {
      const images = ['/stats-card-icon.svg', '/map-card-icon.svg'];
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    const loadData = async () => {
      preloadImages();
      await Promise.all([fetchCountData(), fetchStations(), fetchStationsStats()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ countData, stations, stationsStats, isLoading, fetchCountData, fetchStations, fetchStationsStats }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
