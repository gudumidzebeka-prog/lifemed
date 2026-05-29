export const CHRONIC_CONDITIONS = [
  { id: "diabetes", categoryId: "endocrinology", icon: "Activity" },
  { id: "lupus", categoryId: "rheumatology", icon: "Shield" },
  { id: "kidney-disease", categoryId: "nephrology", icon: "Droplets" },
  { id: "hypertension", categoryId: "cardiology", icon: "Heart" },
  { id: "thyroid", categoryId: "endocrinology", icon: "Activity" },
  { id: "pcos", categoryId: "gynecology", icon: "HeartHandshake" },
] as const;

export type ChronicConditionId = (typeof CHRONIC_CONDITIONS)[number]["id"];

export interface ConditionChecklistState {
  checked: Record<string, boolean>;
  updatedAt: string;
}

export interface FlareEntry {
  id: string;
  conditionId: ChronicConditionId;
  severity: 1 | 2 | 3;
  note?: string;
  recordedAt: string;
}

const CHECKLIST_KEY = "lifemed-condition-checklists";
const FLARE_KEY = "lifemed-condition-flares";

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

export function getConditionChecklist(conditionId: ChronicConditionId): ConditionChecklistState {
  const all = readJson<Record<string, ConditionChecklistState>>(CHECKLIST_KEY, {});
  return (
    all[conditionId] ?? {
      checked: {},
      updatedAt: new Date().toISOString(),
    }
  );
}

export function toggleChecklistItem(conditionId: ChronicConditionId, itemKey: string, checked: boolean) {
  const all = readJson<Record<string, ConditionChecklistState>>(CHECKLIST_KEY, {});
  const current = all[conditionId] ?? { checked: {}, updatedAt: new Date().toISOString() };
  all[conditionId] = {
    checked: { ...current.checked, [itemKey]: checked },
    updatedAt: new Date().toISOString(),
  };
  writeJson(CHECKLIST_KEY, all);
  return all[conditionId];
}

export function loadFlares(conditionId?: ChronicConditionId): FlareEntry[] {
  const all = readJson<FlareEntry[]>(FLARE_KEY, []);
  const sorted = all.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  return conditionId ? sorted.filter((entry) => entry.conditionId === conditionId) : sorted;
}

export function addFlare(
  conditionId: ChronicConditionId,
  severity: FlareEntry["severity"],
  note?: string
): FlareEntry {
  const entry: FlareEntry = {
    id: `flare-${Date.now()}`,
    conditionId,
    severity,
    note: note?.trim() || undefined,
    recordedAt: new Date().toISOString(),
  };
  writeJson(FLARE_KEY, [entry, ...loadFlares()].slice(0, 200));
  return entry;
}

export function getChronicCondition(id: string) {
  return CHRONIC_CONDITIONS.find((item) => item.id === id) ?? null;
}
