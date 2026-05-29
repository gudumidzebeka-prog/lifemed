const STREAK_KEY = "lifemed-wellness-streak";
const BADGES_KEY = "lifemed-wellness-badges";
const ACTIVITY_KEY = "lifemed-wellness-activity-dates";

export interface WellnessStreak {
  current: number;
  best: number;
  lastActiveDate: string | null;
}

export interface WellnessBadge {
  id: string;
  earnedAt: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function recordWellnessActivity() {
  const today = todayKey();
  const dates = new Set(readJson<string[]>(ACTIVITY_KEY, []));
  if (dates.has(today)) return loadStreak();
  dates.add(today);
  writeJson(ACTIVITY_KEY, [...dates].slice(-120));

  const streak = loadStreak();
  const nextCurrent =
    streak.lastActiveDate === yesterdayKey() ? streak.current + 1 : streak.lastActiveDate === today ? streak.current : 1;

  const updated: WellnessStreak = {
    current: nextCurrent,
    best: Math.max(streak.best, nextCurrent),
    lastActiveDate: today,
  };
  writeJson(STREAK_KEY, updated);
  unlockBadges(updated);
  return updated;
}

export function loadStreak(): WellnessStreak {
  return readJson<WellnessStreak>(STREAK_KEY, {
    current: 0,
    best: 0,
    lastActiveDate: null,
  });
}

export function loadBadges(): WellnessBadge[] {
  return readJson<WellnessBadge[]>(BADGES_KEY, []);
}

function unlockBadges(streak: WellnessStreak) {
  const earned = new Set(loadBadges().map((badge) => badge.id));
  const now = new Date().toISOString();
  const toAdd: WellnessBadge[] = [];

  if (streak.current >= 3 && !earned.has("streak-3")) {
    toAdd.push({ id: "streak-3", earnedAt: now });
  }
  if (streak.current >= 7 && !earned.has("streak-7")) {
    toAdd.push({ id: "streak-7", earnedAt: now });
  }
  if (streak.current >= 30 && !earned.has("streak-30")) {
    toAdd.push({ id: "streak-30", earnedAt: now });
  }

  if (toAdd.length > 0) {
    writeJson(BADGES_KEY, [...loadBadges(), ...toAdd]);
  }
}
