"use client";

import { useState, useEffect, useCallback } from "react";
import { Entry, Prediction } from "@/lib/types";
import { predict, sortEntries } from "@/lib/prediction";
import EntryForm from "./EntryForm";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysFromNow(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function SideBadge({ side }: { side: "L" | "R" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        side === "L"
          ? "bg-side-left-light text-side-left"
          : "bg-side-right-light text-side-right"
      }`}
    >
      {side === "L" ? "Left" : "Right"}
    </span>
  );
}

export default function DashboardView() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const sorted = sortEntries(entries);
  const lastEntry = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const prediction: Prediction | null = predict(entries);

  function handleSuccess() {
    setShowForm(false);
    setLoading(true);
    fetchEntries();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Last Delivery Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Last Delivery
        </h2>
        {lastEntry ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatDate(lastEntry.date)}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {Math.abs(daysFromNow(lastEntry.date))} days ago
              </p>
            </div>
            <SideBadge side={lastEntry.side} />
          </div>
        ) : (
          <p className="text-slate-400">No deliveries recorded yet</p>
        )}
      </div>

      {/* Prediction Card */}
      {prediction && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Next Expected Delivery
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatDate(prediction.expectedDate)}
              </p>
              {(() => {
                const days = daysFromNow(prediction.expectedDate);
                return (
                  <p className="text-sm text-slate-500 mt-1">
                    {days > 0
                      ? `in ${days} days`
                      : days === 0
                      ? "today"
                      : `${Math.abs(days)} days overdue`}
                  </p>
                );
              })()}
            </div>
            <SideBadge side={prediction.expectedSide} />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Avg. cycle: {prediction.averageDaysUsed} days
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                prediction.confidence === "high"
                  ? "bg-green-100 text-green-600"
                  : prediction.confidence === "medium"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {prediction.confidence}
            </span>
          </div>
        </div>
      )}

      {/* New Entry Toggle */}
      {showForm ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            New Delivery
          </h2>
          <EntryForm
            preselectedSide={prediction?.expectedSide || "L"}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-base shadow-lg shadow-primary-200 active:scale-[0.98] transition-transform"
        >
          + New Delivery
        </button>
      )}
    </div>
  );
}
