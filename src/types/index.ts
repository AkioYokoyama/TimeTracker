export interface SiteEntry {
  hostname: string;
  seconds: number;
  percentage: number;
}

export interface DayData {
  [hostname: string]: number;
}

export type StorageData = {
  [key: string]: DayData;
};
