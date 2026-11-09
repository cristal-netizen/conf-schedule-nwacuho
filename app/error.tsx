"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("NWACUHO application error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">We couldn’t load this page</h1>
      <p className="text-sm text-slate-600">Your saved schedule should still be on this device. Please try again. If the problem continues, contact the conference team.</p>
      <button type="button" onClick={reset} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Try again</button>
    </main>
  );
}
