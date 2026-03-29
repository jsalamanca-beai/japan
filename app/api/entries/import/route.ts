import { NextRequest, NextResponse } from "next/server";
import { getEntries } from "@/lib/kv";
import { kv } from "@vercel/kv";
import { Entry } from "@/lib/types";

const ENTRIES_KEY = "japan:entries";

// POST /api/entries/import
// Body: { entries: [{ date: "2025-12-15", side: "L" }, ...] }
// Merges with existing entries (no duplicates by date+side)
export async function POST(request: NextRequest) {
  try {
    const { entries: newEntries } = await request.json();

    if (!Array.isArray(newEntries) || newEntries.length === 0) {
      return NextResponse.json(
        { error: "entries must be a non-empty array" },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const e of newEntries) {
      if (!e.date || !dateRegex.test(e.date)) {
        return NextResponse.json(
          { error: `Invalid date: ${e.date}` },
          { status: 400 }
        );
      }
      if (e.side !== "L" && e.side !== "R") {
        return NextResponse.json(
          { error: `Invalid side for date ${e.date}: ${e.side}` },
          { status: 400 }
        );
      }
    }

    const existing = await getEntries();
    const existingKeys = new Set(existing.map((e) => `${e.date}_${e.side}`));

    const toAdd: Entry[] = [];
    for (const e of newEntries) {
      const key = `${e.date}_${e.side}`;
      if (!existingKeys.has(key)) {
        toAdd.push({
          id: crypto.randomUUID(),
          date: e.date,
          side: e.side,
          createdAt: Date.now(),
        });
        existingKeys.add(key);
      }
    }

    if (toAdd.length > 0) {
      const merged = [...existing, ...toAdd];
      merged.sort((a, b) => a.date.localeCompare(b.date));
      await kv.set(ENTRIES_KEY, merged);
    }

    return NextResponse.json({
      imported: toAdd.length,
      skipped: newEntries.length - toAdd.length,
      total: existing.length + toAdd.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to import entries" },
      { status: 500 }
    );
  }
}
