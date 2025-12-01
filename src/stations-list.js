import { getStationsStats } from "./api.js";
import { startLoading, stopLoading } from "./spinner.js";

export const updateStationsList = async () => {
  startLoading("stations-stats");
  let stationsRanked = await getStationsStats();
  stopLoading("stations-stats");
};
