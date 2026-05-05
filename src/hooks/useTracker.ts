import { useState, useEffect, useCallback } from 'react';
import type { DayData, SiteEntry } from '../types';
import { getExcludeList } from './useExcludeList';

function getDateKey(offset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function formatDateLabel(offset: number): string {
  if (offset === 0) return '今日';
  if (offset === -1) return '昨日';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日 (${weekdays[d.getDay()]})`;
}

export function formatDateFull(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${weekdays[d.getDay()]})`;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatTimeFull(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function fetchDayData(offset: number): Promise<DayData> {
  const key = `tracker_${getDateKey(offset)}`;
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve((result[key] as DayData) ?? {});
    });
  });
}

async function clearDayData(offset: number): Promise<void> {
  const key = `tracker_${getDateKey(offset)}`;
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => resolve());
  });
}

export function useSiteData(offset: number) {
  const [entries, setEntries] = useState<SiteEntry[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [data, excluded] = await Promise.all([
      fetchDayData(offset),
      getExcludeList(),
    ]);
    const excludeSet = new Set(excluded);

    const sorted = Object.entries(data)
      .filter(([hostname, v]) => v > 1 && !excludeSet.has(hostname))
      .sort(([, a], [, b]) => b - a);

    const total = sorted.reduce((sum, [, v]) => sum + v, 0);
    setTotalSeconds(total);
    setEntries(
      sorted.map(([hostname, seconds]) => ({
        hostname,
        seconds,
        percentage: total > 0 ? (seconds / total) * 100 : 0,
      }))
    );
    setLoading(false);
  }, [offset]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Auto-refresh every 5s on today's view
  useEffect(() => {
    if (offset !== 0) return;
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [offset, load]);

  const clearData = useCallback(async () => {
    await clearDayData(offset);
    await load();
  }, [offset, load]);

  return { entries, totalSeconds, loading, refresh: load, clearData };
}

export { getDateKey };
