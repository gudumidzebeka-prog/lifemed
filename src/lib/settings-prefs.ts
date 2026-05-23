export interface AppPreferences {
  biometricLogin: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
}

const STORAGE_KEY = "lifemed-preferences";

const defaults: AppPreferences = {
  biometricLogin: true,
  medicationReminders: true,
  appointmentReminders: true,
};

export function loadPreferences(): AppPreferences {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function savePreferences(prefs: AppPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
