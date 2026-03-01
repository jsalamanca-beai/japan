import { kv } from "@vercel/kv";
import { Entry } from "./types";

const ENTRIES_KEY = "japan:entries";

export async function getEntries(): Promise<Entry[]> {
  const entries = await kv.get<Entry[]>(ENTRIES_KEY);
  return entries || [];
}

export async function addEntry(entry: Entry): Promise<void> {
  const entries = await getEntries();
  entries.push(entry);
  await kv.set(ENTRIES_KEY, entries);
}
