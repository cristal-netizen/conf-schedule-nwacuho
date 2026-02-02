<p className="text-xs text-red-600">VENUE VERSION: 4</p>

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Venue",
};

export const viewport = {
  themeColor: "#28903b",
};

const rooms = [
  {
    name: "Cascade Ballroom",
    use: "Conference opening/closing, large programs, exhibitor hall & meal functions (see schedule for specifics)",
    floor: "Mezzanine Level (2nd Floor)",
  },
  {
    name: "Cascade Foyer North",
    use: "Registration open / pre-function gathering",
    floor: "Mezzanine Level (2nd Floor)",
  },
  { name: "Adams", use: "Educational sessions & workshops", floor: "Mezzanine Level (2nd Floor)" },
  {
    name: "Olympic",
    use: "Educational sessions, mentoring/social meet-ups, volunteer orientation",
    floor: "Mezzanine Level (2nd Floor)",
  },
  { name: "Baker", use: "Lactation space", floor: "Mezzanine Level (2nd Floor)" },
  { name: "St. Helens", use: "Sensory recovery space", floor: "Mezzanine Level (2nd Floor)" },
  { name: "Stuart", use: "Open work space; some meetings", floor: "Mezzanine Level (2nd Floor)" },
  { name: "Loft", use: "Past President Reception", floor: "Mezzanine Level (2nd Floor)" },
  {
    name: "Puget Sound",
    use: "Social events (Game Night, Meet & Greet, etc.)",
    floor: "Lobby Level (1st Floor)",
  },
  {
    name: "Hotel Lobby",
    use: "Pre-conference tour departures / meetup point",
    floor: "Lobby Level (1st Floor)",
  },
  {
    name: "Whidbey",
    use: "Roundtables, trivia, and other evening programming",
    floor: "San Juan Level (3rd Floor)",
  },
  {
    name: "Orcas",
    use: "Breakouts / evening programming (sometimes combined rooms)",
    floor: "San Juan Level (3rd Floor)",
  },
  {
    name: "Blakely",
    use: "Educational sessions & affinity/social programming",
    floor: "San Juan Level (3rd Floor)",
  },
  {
    name: "Mahlum Seattle Home Office",
    use: "Off-site pre-conference case study",
    floor: "Off-site",
  },
  {
    name: "UW Campus – Lander Hall",
    use: "Off-site UW facilities tour stop",
    floor: "Off-site",
  },
  {
    name: "Various Locations",
    use: "Meals/breaks and events not in a single room",
    floor: "Various",
  },
];

export default function VenuePage() {
  return (
    <main className="min-h-screen bg-neutral-900/5 py-6 px-3 md:px-6 font-[Calibri,_system-ui,_sans-serif]">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg">
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            Venue Map & Rooms
          </h1>
          <p className="mt-1 text-sm md:text-base text-white/90">
            Find your way around the conference venue, session rooms, and exhibitor spaces.
          </p>
        </header>

        <Card className="border-slate-200/80 shadow-sm bg-white/95">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Venue Overview Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/westin-seattle-meeting-space.png"
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28903b] focus-visible:ring-offset-2"
              aria-label="Open the venue map full size in a new tab"
              title="Open full-size map"
            >
              <Image
                src="/westin-seattle-meeting-space.png"
                alt="The Westin Seattle meeting space map showing Grand Level, San Juan Level, Mezzanine Level, Lobby Level, and Westlake Level rooms"
                width={1400}
                height={1050}
                className="h-auto w-full object-contain"
                priority
              />
            </a>

            <p className="text-xs text-slate-500">Tap or click the map to view it full size.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white/95">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Key Rooms & Spaces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-xs text-slate-500">Rooms loaded: {rooms.length}</p>

            {rooms.map((room) => (
              <div
                key={room.name}
                className="flex flex-col border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-semibold text-slate-900">{room.name}</span>
                <span className="text-xs text-slate-600">{room.use}</span>
                <span className="text-xs text-slate-500">Location: {room.floor}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center mt-2">
          Room assignments for individual sessions will be listed on the schedule when finalized.
        </p>
      </div>
    </main>
  );
}
