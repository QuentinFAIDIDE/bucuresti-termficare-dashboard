const versionTag =
  typeof __VERSION_TAG__ !== "undefined" ? __VERSION_TAG__ : "undefined";

document.addEventListener("DOMContentLoaded", function () {
  const footerBrand = document.querySelector(".footer-brand p");
  if (footerBrand) {
    footerBrand.textContent += ` ${versionTag}`;
  }
});
