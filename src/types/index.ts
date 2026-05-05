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

/** chrome.storage.local key for the exclude list */
export const EXCLUDE_KEY = 'tracker_exclude_list';

export interface ExcludeList {
  hostnames: string[];
}
