const translations = {
  en: {
    "about.title": "About This Website",
    "about.description":
      "Termoficarekt monitors the health of public heating stations in Bucharest. You can get global metrics about the proportions of stations that are broken over time, and station specific statistics and incident history.",
    "chart.title": "Broken Heating Stations Over Time",
    "chart.description":
      "Count of stations over time that are either working, experiencing issues, or are broken.",
    "map.title": "Inspect a Heating Station",
    "map.description":
      "Click on a station to inspect its uptime and a list of recent incidents.",
    "warning.text":
      "This dashboard periodically collects heating stations statuses. For real time updates, refer to the",
    "warning.link": "official website",
    "stats.title": "Statistics",
    "stats.avgHours": "Avg Incident Hours/Month",
    "stats.avgDuration": "Avg Incident Duration",
    "stats.longest": "Longest Incident (Last Year)",
    "timeline.title": "Timeline",
    "incidents.title": "Last 10 Incidents",
    "incidents.startDate": "Start Date",
    "incidents.stopDate": "Stop Date",
    "incidents.status": "Status",
    "incidents.description": "Description",
    "incidents.noIncidents": "No incidents to show for this station",
    "status.title": "Current Station Status",
    "status.working": "Working",
    "status.issues": "Issues",
    "status.broken": "Broken",
    "placeholder.text":
      "Click on a station to view its timeline and incident history.",
    "status.working": "working",
    "status.broken": "broken",
    "status.issues": "issues",
  },
  ro: {
    "about.title": "Despre Acest Site",
    "about.description":
      "Termoficarekt monitorizează starea stațiilor de încălzire publică din București. Puteți obține statistici globale despre proporțiile stațiilor defecte în timp și statistici specifice stațiilor și istoricul incidentelor.",
    "chart.title": "Stații de Încălzire Defecte în Timp",
    "chart.description":
      "Numărul stațiilor în timp care fie funcționează, au probleme sau sunt defecte.",
    "map.title": "Inspectează o Stație de Încălzire",
    "map.description":
      "Faceți clic pe o stație pentru a inspecta timpul de funcționare și lista incidentelor recente.",
    "warning.text":
      "Acest tablou de bord colectează periodic statusurile stațiilor de încălzire. Pentru actualizări în timp real, consultați",
    "warning.link": "site-ul oficial",
    "stats.title": "Statistici",
    "stats.avgHours": "Ore Incidente Medii/Lună",
    "stats.avgDuration": "Durata Medie Incident",
    "stats.longest": "Cel Mai Lung Incident (Ultimul An)",
    "timeline.title": "Cronologie",
    "incidents.title": "Ultimele 10 Incidente",
    "incidents.startDate": "Data Început",
    "incidents.stopDate": "Data Sfârșit",
    "incidents.status": "Status",
    "incidents.description": "Descriere",
    "incidents.noIncidents": "Nu există incidente de afișat pentru această stație",
    "status.title": "Starea Actuală a Stațiilor",
    "status.working": "Funcționează",
    "status.issues": "Probleme",
    "status.broken": "Defecte",
    "placeholder.text":
      "Faceți clic pe o stație pentru a vedea cronologia și istoricul incidentelor.",
    "status.working": "funcționează",
    "status.broken": "defect",
    "status.issues": "probleme",
  },
};

let currentLang = localStorage.getItem("language") || "en";

export const t = (key) => {
  return translations[currentLang][key] || key;
};

export const setLanguage = (lang) => {
  currentLang = lang;
  localStorage.setItem("language", lang);
  updatePageContent();
};

const updatePageContent = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = t(key);
  });
};

document.addEventListener("DOMContentLoaded", updatePageContent);
window.setLanguage = setLanguage;
