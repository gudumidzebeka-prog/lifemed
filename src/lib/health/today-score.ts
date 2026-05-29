import { getConditionChecklist, CHRONIC_CONDITIONS, type ChronicConditionId } from "@/lib/health/chronic-conditions";
import { hasLoggedTrackerToday, loadTrackerEntries } from "@/lib/health/trackers";
import type { HealthProfile } from "@/types/health";

export interface TodayScoreBreakdown {
  total: number;
  trackers: number;
  checklist: number;
  profile: number;
  medications: number;
}

function checklistCompletionRatio(conditionId: ChronicConditionId, itemCount: number) {
  if (itemCount === 0) return 0;
  const state = getConditionChecklist(conditionId);
  const done = Object.values(state.checked).filter(Boolean).length;
  return Math.min(1, done / itemCount);
}

export function calculateTodayScore(profile: HealthProfile, checklistItemCount = 4): TodayScoreBreakdown {
  const trackerTypesLogged = [
    hasLoggedTrackerToday("blood-pressure"),
    hasLoggedTrackerToday("pulse"),
    hasLoggedTrackerToday("sleep"),
    hasLoggedTrackerToday("water"),
  ].filter(Boolean).length;

  const trackers = Math.round((trackerTypesLogged / 4) * 30);

  const activeConditions = CHRONIC_CONDITIONS.filter((condition) =>
    profile.chronicIllnesses.some((illness) =>
      illness.toLowerCase().includes(condition.id.replace("-", " ").split(" ")[0] ?? "")
    )
  );

  const conditionSet = activeConditions.length > 0 ? activeConditions : CHRONIC_CONDITIONS.slice(0, 1);
  const checklistAvg =
    conditionSet.reduce((sum, condition) => sum + checklistCompletionRatio(condition.id, checklistItemCount), 0) /
    conditionSet.length;
  const checklist = Math.round(checklistAvg * 30);

  const profileComplete = [
    profile.fullName,
    profile.dateOfBirth,
    profile.bloodType,
    profile.allergies.length > 0 || profile.chronicIllnesses.length > 0,
  ].filter(Boolean).length;
  const profileScore = Math.round((profileComplete / 4) * 20);

  const medications = profile.currentMedications.length > 0 ? 20 : 10;

  const total = Math.min(100, trackers + checklist + profileScore + medications);

  return { total, trackers, checklist, profile: profileScore, medications };
}

export function getRecentTrackerTrend(type: "weight" | "glucose" | "sleep") {
  return loadTrackerEntries()
    .filter((entry) => entry.type === type)
    .slice(0, 7)
    .reverse();
}
