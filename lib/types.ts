export const STATION_STATUSES = ['working', 'issue', 'broken'] as const;
export type StationStatus = typeof STATION_STATUSES[number];

export const isValidStatus = (status: string): status is StationStatus =>
  STATION_STATUSES.includes(status as StationStatus);