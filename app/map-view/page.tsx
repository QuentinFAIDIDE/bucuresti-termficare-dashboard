"use client";

import { useTranslation } from "@/lib/translations";
import { useData } from "@/lib/data-store";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LanguageSelect } from "@/components/language-select";
import { Map } from "@/components/map";
import { StationSheet } from "@/components/station-sheet";
import AutocompleteSearchbar from "@/components/autocomplete-search-bar";
import { getStreetData, Street } from "@/lib/street-data";
import { searchLocation, LocationResult } from "@/lib/api";

export default function StationsView() {
  const { t } = useTranslation();
  const { countData, stations, stationsStats } = useData();
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null
  );
  const [streetData, setStreetData] = useState<Street[]>([]);
  const [locationMarker, setLocationMarker] = useState<LocationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getStreetData().then(setStreetData);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="bg-accent border border-border rounded-md shadow-lg p-2 text-accent-foreground hover:text-accent-foreground/80 transition-colors block"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <AutocompleteSearchbar
            data={streetData}
            onSelect={(street) => console.log('Selected street:', street.name)}
            onSearch={async (query) => {
              setIsSearching(true);
              const result = await searchLocation(query);
              if (result) {
                setLocationMarker(result);
              }
              setIsSearching(false);
            }}
            placeholder={t.searchStreets}
            isLoading={isSearching}
          />
        </div>

        <LanguageSelect useAccentBackground useShadow />
      </header>

      <div className="h-full relative">
        <Map
          className="w-full h-full"
          stations={stations || []}
          onStationClick={setSelectedStationId}
          selectedStationId={selectedStationId}
          locationMarker={locationMarker}
        />
        <StationSheet
          stationId={selectedStationId}
          stations={stations || []}
          onClose={() => setSelectedStationId(null)}
        />
      </div>
    </div>
  );
}
