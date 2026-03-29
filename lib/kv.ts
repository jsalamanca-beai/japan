import { kv } from "@vercel/kv";
import { Entry } from "./types";

const ENTRIES_KEY = "japan:entries";

export async function getEntries(): Promise<Entry[]> {
  const entries = await kv.get<Entry[]>(ENTRIES_KEY);
  return entries || [];
}

export async function addEntry(entry: Entry): Promise<void> {
  const raw = await kv.get<Entry[]>(ENTRIES_KEY);

  // KV key exists but read returned null — likely a transient error.
  // Only allow writing to a fresh (non-existent) key via the import endpoint.
  // For normal adds, the key must already exist with data.
  const exists = await kv.exists(ENTRIES_KEY);
  if (!raw && exists) {
    throw new Error("Could not read existing entries from KV — aborting to prevent data loss");
  }

  const entries = raw || [];
  entries.push(entry);
  await kv.set(ENTRIES_KEY, entries);
}
