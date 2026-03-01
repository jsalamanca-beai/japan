import { NextRequest, NextResponse } from "next/server";
import { getEntries, addEntry } from "@/lib/kv";
import { Entry } from "@/lib/types";

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, side } = await request.json();

    if (!date || !side) {
      return NextResponse.json({ error: "Date and side are required" }, { status: 400 });
    }

    if (side !== "L" && side !== "R") {
      return NextResponse.json({ error: "Side must be L or R" }, { status: 400 });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const entry: Entry = {
      id: crypto.randomUUID(),
      date,
      side,
      createdAt: Date.now(),
    };

    await addEntry(entry);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
