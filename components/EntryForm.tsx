"use client";

import { useState } from "react";

interface EntryFormProps {
  preselectedSide: "L" | "R";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EntryForm({ preselectedSide, onSuccess, onCancel }: EntryFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [side, setSide] = useState<"L" | "R">(preselectedSide);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, side }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Delivery Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={today}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Side
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide("L")}
            className={`py-3 rounded-xl font-semibold text-base transition-all ${
              side === "L"
                ? "bg-side-left text-white shadow-lg shadow-pink-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => setSide("R")}
            className={`py-3 rounded-xl font-semibold text-base transition-all ${
              side === "R"
                ? "bg-side-right text-white shadow-lg shadow-violet-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Right
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
