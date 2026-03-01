import { Entry, CycleGap, Prediction, Stats, EntryWithGap } from "./types";

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + "T00:00:00Z");
  const dateB = new Date(b + "T00:00:00Z");
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().split("T")[0];
}

export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function calculateGaps(entries: Entry[]): CycleGap[] {
  const sorted = sortEntries(entries);
  const gaps: CycleGap[] = [];

  for (let i = 1; i < sorted.length; i++) {
    gaps.push({
      fromDate: sorted[i - 1].date,
      toDate: sorted[i].date,
      days: daysBetween(sorted[i - 1].date, sorted[i].date),
      side: sorted[i].side, // gap attributed to the ending entry's side
    });
  }

  return gaps;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function calculateStats(entries: Entry[]): Stats {
  const gaps = calculateGaps(entries);

  const allDays = gaps.map((g) => g.days);
  const lDays = gaps.filter((g) => g.side === "L").map((g) => g.days);
  const rDays = gaps.filter((g) => g.side === "R").map((g) => g.days);

  return {
    averageAll: average(allDays),
    averageL: average(lDays),
    averageR: average(rDays),
    totalEntries: entries.length,
  };
}

export function predict(entries: Entry[]): Prediction | null {
  if (entries.length === 0) return null;

  const sorted = sortEntries(entries);
  const lastEntry = sorted[sorted.length - 1];
  const expectedSide: "L" | "R" = lastEntry.side === "L" ? "R" : "L";

  if (entries.length === 1) {
    return {
      expectedDate: addDays(lastEntry.date, 28),
      expectedSide,
      averageDaysUsed: 28,
      confidence: "low",
    };
  }

  const gaps = calculateGaps(entries);
  const sideGaps = gaps.filter((g) => g.side === expectedSide);
  const allAvg = average(gaps.map((g) => g.days));

  let averageDaysUsed: number;
  let confidence: "low" | "medium" | "high";

  if (sideGaps.length >= 3) {
    averageDaysUsed = average(sideGaps.map((g) => g.days))!;
    confidence = "high";
  } else if (sideGaps.length >= 1) {
    averageDaysUsed = average(sideGaps.map((g) => g.days))!;
    confidence = "medium";
  } else if (allAvg !== null) {
    averageDaysUsed = allAvg;
    confidence = "low";
  } else {
    averageDaysUsed = 28;
    confidence = "low";
  }

  return {
    expectedDate: addDays(lastEntry.date, averageDaysUsed),
    expectedSide,
    averageDaysUsed: Math.round(averageDaysUsed * 10) / 10,
    confidence,
  };
}

export function entriesWithGaps(entries: Entry[]): EntryWithGap[] {
  const sorted = sortEntries(entries);
  return sorted.map((entry, i) => ({
    ...entry,
    gapDays: i > 0 ? daysBetween(sorted[i - 1].date, entry.date) : null,
  }));
}
