import fs from "fs";
import path from "path";
import {
  demoDocuments,
  demoProfile,
  demoTimeline,
} from "@/data/demo-data";

export interface DemoShareEntry {
  token: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".lifemed");
const STORE_FILE = path.join(DATA_DIR, "demo-shares.json");

function readEntries(): DemoShareEntry[] {
  try {
    if (!fs.existsSync(STORE_FILE)) return [];
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoShareEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: DemoShareEntry[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(entries, null, 2), "utf8");
}

function loadStore(): Map<string, DemoShareEntry> {
  const now = new Date();
  const all = readEntries();
  const entries = all.filter((entry) => new Date(entry.expiresAt) >= now);
  if (entries.length !== all.length) {
    writeEntries(entries);
  }
  return new Map(entries.map((entry) => [entry.token, entry]));
}

function persistStore(store: Map<string, DemoShareEntry>) {
  writeEntries(Array.from(store.values()));
}

export function saveDemoShare(entry: DemoShareEntry) {
  const store = loadStore();
  store.set(entry.token, entry);
  persistStore(store);
}

export function getDemoShare(token: string): DemoShareEntry | null {
  const store = loadStore();
  const entry = store.get(token);
  if (!entry) return null;
  if (new Date(entry.expiresAt) < new Date()) {
    store.delete(token);
    persistStore(store);
    return null;
  }
  return entry;
}

export function revokeDemoShare(token: string) {
  const store = loadStore();
  store.delete(token);
  persistStore(store);
}

export function listDemoShares(): DemoShareEntry[] {
  const store = loadStore();
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function clearAllDemoShares() {
  writeEntries([]);
}

export function getDemoSharePayload(scopes: string[]) {
  const payload: Record<string, unknown> = { scopes, demo: true };

  if (scopes.includes("profile") || scopes.includes("emergency")) {
    payload.profile = demoProfile;
  }
  if (scopes.includes("timeline")) {
    payload.timeline = demoTimeline;
  }
  if (scopes.includes("documents")) {
    payload.documents = demoDocuments;
  }

  return payload;
}
