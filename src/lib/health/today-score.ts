import { getConditionChecklist, CHRONIC_CONDITIONS, type ChronicConditionId } from "@/lib/health/chronic-conditions";
import { loadTrackerEntries, type TrackerEntry, type TrackerType } from "@/lib/health/trackers";
import type { HealthProfile } from "@/types/health";

export interface TodayScoreBreakdown {
  total: number;
  trackers: number;
  checklist: number;
  profile: number;
  medications: number;
}

export const SCORE_MAX = {
  trackers: 30,
  checklist: 30,
  profile: 20,
  medications: 20,
} as const;

const TRACKER_TYPES_FOR_SCORE: TrackerType[] = ["blood-pressure", "pulse", "sleep", "water"];

function matchesChronicCondition(illness: string, conditionId: ChronicConditionId): boolean {
  const normalized = illness.toLowerCase().trim();
  if (!normalized) return false;

  const aliases: Record<ChronicConditionId, string[]> = {
    diabetes: ["diabetes", "diabet", "დიაბეტ", "diab"],
    lupus: ["lupus", "lup", "ლუპუს"],
    "kidney-disease": ["kidney", "nephro", "renal", "თირკმ", "nephrology"],
    hypertension: ["hypertension", "hypertens", "pressure", "ჰიპერტ", "hypert"],
    thyroid: ["thyroid", "hypothyroid", "hyperthyroid", "ფარის", "thyro"],
    pcos: ["pcos", "polycystic", "პკოს", "polycyst"],
  };

  return aliases[conditionId].some((alias) => normalized.includes(alias));
}

function checklistCompletionRatio(conditionId: ChronicConditionId, itemCount: number) {
  if (itemCount === 0) return 0;
  const state = getConditionChecklist(conditionId);
  const done = Object.values(state.checked).filter(Boolean).length;
  return Math.min(1, done / itemCount);
}

export function calculateTodayScore(
  profile: HealthProfile,
  checklistItemCount = 4,
  entries: TrackerEntry[] = loadTrackerEntries()
): TodayScoreBreakdown {
  const today = new Date().toISOString().slice(0, 10);
  const trackerTypesLogged = TRACKER_TYPES_FOR_SCORE.filter((type) =>
    entries.some((entry) => entry.type === type && entry.recordedAt.slice(0, 10) === today)
  ).length;

  const trackers = Math.round((trackerTypesLogged / TRACKER_TYPES_FOR_SCORE.length) * SCORE_MAX.trackers);

  const activeConditions = CHRONIC_CONDITIONS.filter((condition) =>
    profile.chronicIllnesses.some((illness) => matchesChronicCondition(illness, condition.id))
  );

  const checklist =
    activeConditions.length === 0
      ? 0
      : Math.round(
          (activeConditions.reduce(
            (sum, condition) => sum + checklistCompletionRatio(condition.id, checklistItemCount),
            0
          ) /
            activeConditions.length) *
            SCORE_MAX.checklist
        );

  const profileComplete = [
    profile.fullName?.trim(),
    profile.dateOfBirth,
    profile.bloodType,
    profile.allergies.length > 0 || profile.chronicIllnesses.length > 0,
  ].filter(Boolean).length;
  const profileScore = Math.round((profileComplete / 4) * SCORE_MAX.profile);

  const medications =
    profile.currentMedications.length > 0
      ? SCORE_MAX.medications
      : 0;

  const total = Math.min(
    100,
    trackers + checklist + profileScore + medications
  );

  return { total, trackers, checklist, profile: profileScore, medications };
}

export function getRecentTrackerTrend(
  type: TrackerType,
  limit = 7,
  entries: TrackerEntry[] = loadTrackerEntries()
) {
  return entries
    .filter((entry) => entry.type === type)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .slice(-limit);
}

export function getTrackerTrendValue(entry: TrackerEntry) {
  return entry.value;
}
