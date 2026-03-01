"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Invalid access code");
        setPassword("");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-600 mb-2"
        >
          Access Code
        </label>
        <input
          id="password"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter code"
          autoComplete="off"
          className="w-full px-4 py-3 text-center text-2xl tracking-[0.3em] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
      >
        {loading ? "Verifying..." : "Access Project"}
      </button>
    </form>
  );
}
