"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      setError(res.status === 401 ? "Invalid email or password" : "Something went wrong");
      return;
    }

    const next = searchParams.get("next") || "/scraper";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <Image
        src="/logo-mark.png"
        alt="Local Lead Finder"
        width={48}
        height={41}
        className="h-12 w-auto"
        priority
      />
      <h1 className="mt-4 text-xl font-semibold text-gray-900">Log in</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
