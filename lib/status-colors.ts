export const STATUS_COLORS = {
  working: "#22c55e",
  issue: "#f59e0b", 
  broken: "#ef4444",
} as const;

export const STATUS_COLORS_DIMMED = {
  working: "#1a9b4a",
  issue: "#d97706",
  broken: "#dc2626",
} as const;

export const STATUS_TAILWIND_CLASSES = {
  working: "text-green-500",
  issue: "text-yellow-500", 
  broken: "text-red-500",
} as const;

export type StatusType = keyof typeof STATUS_COLORS;