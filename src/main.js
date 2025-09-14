import "./style.css";
import "./i18n.js";
import { initCountChart } from "./count-chart.js";
import { initMap } from "./map.js";

document.addEventListener("DOMContentLoaded", function () {
  initCountChart();
  initMap();
});
