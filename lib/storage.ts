"use client";

import { CategoryStat, SwipeDirection, SwipeRecord, UserProfile } from "./types";

const KEYS = {
  consent: "factmatch_consent",
  profile: "factmatch_profile",
  history: "factmatch_history",
};

const MAX_HISTORY = 600;

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEYS.consent) === "true";
}

export function setConsent(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.consent, value ? "true" : "false");
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "", avatar: null };
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return { name: "", avatar: null };
    return JSON.parse(raw) as UserProfile;
  } catch {
    return { name: "", avatar: null };
  }
}

export function setProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function getHistory(): SwipeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    return JSON.parse(raw) as SwipeRecord[];
  } catch {
    return [];
  }
}

export function addSwipeRecord(record: SwipeRecord) {
  if (typeof window === "undefined") return;
  const history = getHistory();
  history.push(record);
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
  localStorage.setItem(KEYS.history, JSON.stringify(history));
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.history);
  localStorage.removeItem(KEYS.consent);
  localStorage.removeItem("factmatch_activity");
  localStorage.removeItem("factmatch_prefs");
}

// ─── Daily activity tracking ───────────────────────────────────────────────────

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function trackDailySwipe(): void {
  if (typeof window === "undefined") return;
  const today = todayStr();
  const raw = localStorage.getItem("factmatch_activity");
  const data: DailyActivity[] = raw ? JSON.parse(raw) : [];
  const entry = data.find((d) => d.date === today);
  if (entry) {
    entry.count++;
  } else {
    data.push({ date: today, count: 1 });
  }
  // Keep last 365 days only
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const trimmed = data.filter((d) => d.date >= cutoffStr);
  localStorage.setItem("factmatch_activity", JSON.stringify(trimmed));
}

export function getDailyActivity(): DailyActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("factmatch_activity");
    return raw ? (JSON.parse(raw) as DailyActivity[]) : [];
  } catch {
    return [];
  }
}

export function getStreak(activity: DailyActivity[]): number {
  if (activity.length === 0) return 0;
  const dateSet = new Set(activity.map((d) => d.date));
  const today = todayStr();
  let current = new Date();
  // If today has no activity, check if yesterday does (streak still alive)
  if (!dateSet.has(today)) {
    current.setDate(current.getDate() - 1);
    if (!dateSet.has(current.toISOString().split("T")[0])) return 0;
  }
  let streak = 0;
  while (dateSet.has(current.toISOString().split("T")[0])) {
    streak++;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

/** Aggregate per-category like-rate stats from swipe history. */
export function getCategoryStats(history: SwipeRecord[]): CategoryStat[] {
  const map = new Map<string, { liked: number; total: number }>();
  for (const r of history) {
    const entry = map.get(r.category) ?? { liked: 0, total: 0 };
    entry.total += 1;
    if (r.direction === "right") entry.liked += 1;
    map.set(r.category, entry);
  }
  return Array.from(map.entries())
    .map(([category, { liked, total }]) => ({
      category,
      liked,
      total,
      percent: total ? Math.round((liked / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Category -> weight (0..1+) based on right-swipe ratio, for personalization. */
export function getCategoryWeights(history: SwipeRecord[]): Record<string, number> {
  const stats = getCategoryStats(history);
  const weights: Record<string, number> = {};
  for (const s of stats) {
    // base weight 1, boosted by like rate and engagement volume
    weights[s.category] = 1 + (s.liked / Math.max(1, s.total)) * 2 + Math.min(s.total / 10, 1);
  }
  return weights;
}

export function getLikedFacts(history: SwipeRecord[]): SwipeRecord[] {
  return history.filter((r) => r.direction === "right");
}

export function getPreferredCategories(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("factmatch_prefs");
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch { return []; }
}

export function setPreferredCategories(cats: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("factmatch_prefs", JSON.stringify(cats));
}

export type { SwipeDirection };
