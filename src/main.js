import "./style.css";
import "./i18n.js";
import { initCountChart } from "./count-chart.js";
import { initMap } from "./map.js";
import { setSpinner, startLoading, stopLoading } from "./spinner.js";


document.addEventListener("DOMContentLoaded", function () {

  setSpinner(document.getElementById('loading-spinner'));

  initCountChart();
  initMap();
});

