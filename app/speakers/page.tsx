"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPEAKERS } from "@/lib/speakersData";

function initialsFromName(name: string) {
  return (name || "?")
    .split(" ")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function SpeakersPage() {
  return (
    <main className="min-h-screen bg-neutral-900/5 py-6 px-3 md:px-6 font-[Calibri,_system-ui,_sans-serif]">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg">
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">Speaker Profiles</h1>
          <p className="mt-1 text-sm md:text-base text-white/90">
            Learn more about the presenters sharing their expertise at the NWACUHO Annual Conference.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {SPEAKERS.map((s) => (
            <Card
              key={s.id}
              id={s.id} // ✅ anchor target: /speakers#sp-josh-gana
              className="scroll-mt-24 border-slate-200/80 shadow-sm bg-white/95"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-white">
                    {s.photoUrl ? (
                      <Image src={s.photoUrl} alt={s.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs font-semibold text-slate-600">
                        {initialsFromName(s.name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold">{s.name}</CardTitle>
                    {(s.title || s.institution) && (
                      <p className="text-xs text-slate-600">
                        {s.title}
                        {s.title && s.institution ? " • " : ""}
                        {s.institution}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold">Link: </span>
                      <span className="font-mono">/speakers#{s.id}</span>
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-slate-700">
                <p className="whitespace-pre-line">{s.bio || "Bio coming soon."}</p>
                {s.trackFocus && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Primary Track: </span>
                    {s.trackFocus}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
