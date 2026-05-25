export const APP_NAME = "LifeMed";

export const HEALTH_CATEGORIES = [
  { id: "cardiology", icon: "Heart", color: "rose" },
  { id: "neurology", icon: "Brain", color: "purple" },
  { id: "nephrology", icon: "Droplets", color: "blue" },
  { id: "immunology", icon: "Shield", color: "teal" },
  { id: "dermatology", icon: "Sparkles", color: "amber" },
  { id: "medications", icon: "Pill", color: "green" },
  { id: "allergies", icon: "AlertTriangle", color: "orange" },
  { id: "vaccinations", icon: "Syringe", color: "cyan" },
  { id: "surgeries", icon: "Scissors", color: "indigo" },
  { id: "lab-results", icon: "FlaskConical", color: "violet" },
] as const;

export const TIMELINE_EVENT_TYPES = [
  "vaccination",
  "illness",
  "surgery",
  "hospitalization",
  "diagnosis",
  "treatment",
  "lab_test",
  "doctor_visit",
  "imaging",
  "medication",
] as const;

export const DOCUMENT_CATEGORIES = [
  "Lab Results",
  "Prescriptions",
  "Imaging",
  "Doctor Notes",
  "Insurance",
  "Vaccination Records",
  "Other",
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", key: "home", icon: "LayoutDashboard" },
  { href: "/timeline", key: "timeline", icon: "Clock" },
  { href: "/documents", key: "documents", icon: "FolderOpen" },
  { href: "/categories", key: "categories", icon: "Layers" },
  { href: "/ai-assistant", key: "aiAssistant", icon: "Sparkles" },
  { href: "/share", key: "share", icon: "Share2" },
  { href: "/family", key: "family", icon: "Users" },
  { href: "/profile", key: "profile", icon: "User" },
  { href: "/settings", key: "settings", icon: "Settings" },
] as const;

export const EMERGENCY_QUICK_ACCESS = "/emergency";

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
