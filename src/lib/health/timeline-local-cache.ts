import type { TimelineEvent } from "@/types/health";

const TIMELINE_CACHE_PREFIX = "lifemed-timeline-v1";

function cacheKey(userId: string | null) {
  return userId ? `${TIMELINE_CACHE_PREFIX}:${userId}` : `${TIMELINE_CACHE_PREFIX}:demo`;
}

export function loadCachedTimeline(userId: string | null): TimelineEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as TimelineEvent[];
  } catch {
    return [];
  }
}

export function saveCachedTimeline(userId: string | null, events: TimelineEvent[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(events));
  } catch {
    // Ignore quota errors.
  }
}

export function mergeTimelineWithCache(events: TimelineEvent[], userId: string | null): TimelineEvent[] {
  const cached = loadCachedTimeline(userId);
  if (events.length > 0) return events;
  return cached;
}
