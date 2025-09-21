import "./style.css";
import "./i18n.js";
import { updateCountData } from "./count-chart.js";
import { initMap } from "./stations-map.js";
import { setSpinner } from "./spinner.js";

document.addEventListener("DOMContentLoaded", function () {
  setSpinner(document.getElementById("loading-spinner"));
  updateCountData();
  initMap();
});
