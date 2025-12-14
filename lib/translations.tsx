"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "ro" | "en";

const translations = {
  en: {
    title: "Termoficarekt",
    subtitle: "Bucharest public heating and hot water historical data.",
    cityStats: "City Statistics",
    cityStatsDesc:
      "View the number of stations that are currently not functionning, the ranking of the worst stations, and the evolution of incidents in the city over time.",
    stationsView: "Stations View",
    stationsViewDesc:
      "Explore the interractive map of stations in Bucharest, search for the one closest to you, and view their statistics and incident history.",
    version: "Termoficarekt Backend v0.0.0",
    madeBy: "Made by Quentin F",
    stationStatus: "Station Status",
    stationStatusDesc:
      "Number of heating stations across Bucharest that are working, experiencing issues, or broken.",
    working: "Working",
    issues: "Issues",
    broken: "Broken",
    stationsRanking: "Stations Ranking",
    stationsRankingDesc:
      "Stations sorted by incident frequency and the proportion of time in the month where they are broken on average.",
    rank: "Rank",
    stationName: "Station Name",
    monthlyIncidentTime: "Avg Monthly Incident Time",
    avgIncidentTime: "Avg Incident Time",
    viewStatistics: "View Statistics",
    clickStationToView:
      "Click a station to view incident history and statistics.",
    stationStatusHistory: "Station Status History",
    stationStatusHistoryDesc:
      "Daily breakdown of working, issues, and broken stations over time.",
    lastMonth: "Last Month",
    lastYear: "Last Year",
    statistics: "Incidents Statistics",
    avgMonthlyHours: "Avg Monthly Hours",
    avgDuration: "Avg Duration",
    rankWorst: "Rank (worst)",
    timeline: "Timeline",
    recentIncidents: "Recent Incidents",
    noIncidentsFound: "No incidents found",
    start: "Start",
    end: "End",
    status: "Status",
    description: "Description",
    noDescription: "No description",
    searchStreets: "Search streets...",
  },
  ro: {
    title: "Termoficarekt",
    subtitle:
      "Date istorice despre încălzirea publică și apa caldă din București.",
    cityStats: "Statistici Oraș",
    cityStatsDesc:
      "Vizualizați numărul de stații care nu funcționează în prezent, clasamentul celor mai proaste stații și evoluția incidentelor în oraș în timp.",
    stationsView: "Vizualizare Stații",
    stationsViewDesc:
      "Explorați harta interactivă a stațiilor din București, căutați cea mai apropiată de dvs. și vizualizați statisticile și istoricul incidentelor.",
    version: "Termoficarekt Backend v0.0.0",
    madeBy: "Realizat de Quentin F",
    stationStatus: "Starea Stațiilor",
    stationStatusDesc:
      "Numărul de stații de încălzire din București care funcționează, au probleme sau sunt defecte.",
    working: "Funcționează",
    issues: "Probleme",
    broken: "Defecte",
    stationsRanking: "Clasament Stații",
    stationsRankingDesc:
      "Stații sortate după frecvența incidentelor și proporția de timp din lună în care sunt defecte în medie.",
    rank: "Rang",
    stationName: "Nume Stație",
    monthlyIncidentTime: "Timp Mediu Incident Lunar",
    avgIncidentTime: "Timp Mediu Incident",
    viewStatistics: "Vizualizare Statistici",
    clickStationToView:
      "Faceți clic pe o stație pentru a vizualiza istoricul incidentelor și statisticile.",
    stationStatusHistory: "Istoric Stare Stații",
    stationStatusHistoryDesc:
      "Defalcare zilnică a stațiilor funcționale, cu probleme și defecte în timp.",
    lastMonth: "Ultima Lună",
    lastYear: "Ultimul An",
    statistics: "Statistici despre Incidente",
    avgMonthlyHours: "Ore Medii Lunare",
    avgDuration: "Durată Medie",
    rankWorst: "Rang (cel mai rău)",
    timeline: "Cronologie",
    recentIncidents: "Incidente Recente",
    noIncidentsFound: "Nu s-au găsit incidente",
    start: "Început",
    end: "Sfârșit",
    status: "Stare",
    description: "Descriere",
    noDescription: "Fără descriere",
    searchStreets: "Căutați străzi...",
  },
};

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
};

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ro");

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context)
    throw new Error("useTranslation must be used within TranslationProvider");
  return context;
}
