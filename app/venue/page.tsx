import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rooms = [
  {
    name: "Main Ballroom",
    use: "Opening, Business Meeting, Banquet",
    floor: "Level 2",
  },
  {
    name: "Breakout Rooms A–D",
    use: "Interest Sessions & Roundtables",
    floor: "Level 2 & 3",
  },
  {
    name: "Exhibit Hall",
    use: "Exhibitor Fair, Snacks, Lunch",
    floor: "Level 1",
  },
  {
    name: "Registration Area",
    use: "Check-in, Info Desk",
    floor: "Lobby",
  },
  {
    name: "Affinity & Social Spaces",
    use: "Affinity Socials, Coffee Chats",
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
            Find your way around the conference venue, session rooms, and
            exhibitor spaces.
          </p>
        </header>

        <Card className="border-slate-200/80 shadow-sm bg-white/95">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Venue Overview Map
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center">
              {/* Replace this with your real floorplan image */}
              {/* Place a file at: public/venue-map.png */}
              <Image
                src="/venue-map.png"
                alt="Conference venue map"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-slate-500">
              This map is a placeholder. Once you have the final floorplan or
              hotel/conference center map, save it as{" "}
              <code className="rounded bg-slate-100 px-1">public/venue-map.png</code>{" "}
              and it will appear here automatically.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm bg-white/95">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Key Rooms & Spaces
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="flex flex-col border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-semibold text-slate-900">
                  {room.name}
                </span>
                <span className="text-xs text-slate-600">
                  {room.use}
                </span>
                <span className="text-xs text-slate-500">
                  Location: {room.floor}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center mt-2">
          Room assignments for individual sessions will be listed on the
          schedule when finalized.
        </p>
      </div>
    </main>
  );
}
