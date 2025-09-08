import "./style.css";
import { initCountChart } from "./count-chart.js";
import { initMap } from "./map.js";

document.addEventListener("DOMContentLoaded", function () {
  initCountChart();
  initMap();
});
