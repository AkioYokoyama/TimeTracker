import { useState, useEffect, useCallback } from 'react';
import { EXCLUDE_KEY } from '../types';

// ── Storage helpers ──────────────────────────────────────────────────────────

export async function getExcludeList(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(EXCLUDE_KEY, (result) => {
      resolve((result[EXCLUDE_KEY] as string[]) ?? []);
    });
  });
}

async function setExcludeList(list: string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [EXCLUDE_KEY]: list }, () => resolve());
  });
}

// Normalise: strip protocol / path, lowercase
export function normaliseHostname(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  // If user typed something like "https://example.com/path", extract hostname
  try {
    const url = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return url.hostname;
  } catch {
    return trimmed;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useExcludeList() {
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await getExcludeList();
    setList(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const add = useCallback(async (raw: string) => {
    const hostname = normaliseHostname(raw);
    if (!hostname) return { ok: false, error: 'ホスト名が空です' };

    const current = await getExcludeList();
    if (current.includes(hostname)) return { ok: false, error: 'すでに登録済みです' };

    const next = [...current, hostname].sort();
    await setExcludeList(next);
    setList(next);
    return { ok: true, error: null };
  }, []);

  const remove = useCallback(async (hostname: string) => {
    const current = await getExcludeList();
    const next = current.filter((h) => h !== hostname);
    await setExcludeList(next);
    setList(next);
  }, []);

  const clear = useCallback(async () => {
    await setExcludeList([]);
    setList([]);
  }, []);

  return { list, loading, add, remove, clear, reload };
}
