"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      setError(await res.text());
      return;
    }

    router.push("/scraper");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Name <span className="text-gray-400">(optional)</span>
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
      />

      <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
      />
      <p className="mb-4 text-xs text-gray-400">At least 8 characters.</p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create admin account"}
      </button>
    </form>
  );
}
