export interface Entry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  side: "L" | "R";
  createdAt: number; // timestamp
}

export interface CycleGap {
  fromDate: string;
  toDate: string;
  days: number;
  side: "L" | "R"; // side of the ending entry
}

export interface Prediction {
  expectedDate: string;
  expectedSide: "L" | "R";
  averageDaysUsed: number;
  confidence: "low" | "medium" | "high";
}

export interface Stats {
  averageAll: number | null;
  averageL: number | null;
  averageR: number | null;
  totalEntries: number;
}

export interface EntryWithGap extends Entry {
  gapDays: number | null;
}
