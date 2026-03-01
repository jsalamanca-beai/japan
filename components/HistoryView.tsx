"use client";

import { useState, useEffect, useCallback } from "react";
import { Entry, Stats } from "@/lib/types";
import { calculateStats, entriesWithGaps } from "@/lib/prediction";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function HistoryView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/entries");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const stats: Stats = calculateStats(entries);
  const withGaps = entriesWithGaps(entries).reverse(); // newest first

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Avg. All"
          value={stats.averageAll !== null ? `${Math.round(stats.averageAll)}d` : "--"}
        />
        <StatCard
          label="Avg. Left"
          value={stats.averageL !== null ? `${Math.round(stats.averageL)}d` : "--"}
        />
        <StatCard
          label="Avg. Right"
          value={stats.averageR !== null ? `${Math.round(stats.averageR)}d` : "--"}
        />
      </div>

      {/* Entry List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            All Deliveries ({entries.length})
          </h2>
        </div>

        {withGaps.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400">
            No deliveries recorded yet
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {withGaps.map((entry) => (
              <div
                key={entry.id}
                className="px-5 py-3.5 flex items-center gap-3"
              >
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    entry.side === "L" ? "bg-side-left" : "bg-side-right"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {entry.side === "L" ? "Left" : "Right"}
                  </p>
                </div>
                {entry.gapDays !== null && (
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {entry.gapDays}d gap
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
