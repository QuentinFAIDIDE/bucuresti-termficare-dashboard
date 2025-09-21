const statusColorsBytes = {
  green: "34, 197, 94",
  orange: "251, 191, 36",
  red: "239, 68, 68",
};
export const STATUS_COLORS = {
  working: "rgba(" + statusColorsBytes.green + ", 1)",
  issues: "rgba(" + statusColorsBytes.orange + ", 1)",
  issue: "rgba(" + statusColorsBytes.orange + ", 1)",
  broken: "rgba(" + statusColorsBytes.red + ", 1)",
};
export const STATUS_COLORS_ALPHA = {
  working: "rgba(" + statusColorsBytes.green + ", 0.6)",
  issues: "rgba(" + statusColorsBytes.orange + ", 0.6)",
  issue: "rgba(" + statusColorsBytes.orange + ", 0.6)",
  broken: "rgba(" + statusColorsBytes.red + ", 0.6)",
};
