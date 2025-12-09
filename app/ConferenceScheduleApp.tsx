import React, { useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, Star } from "lucide-react";

// ------------------------------
// TYPES
// ------------------------------
type Session = {
  id: string;
  title: string;
  track: string;
  type: string;
  day: "mon" | "tue" | "wed";
  start: string; // "HH:MM" 24h
  end: string;   // "HH:MM" 24h
  room: string;
  level?: string;
  description?: string;
  presenters: string[]; // ["TBD"]
};

// ------------------------------
// META
// ------------------------------
const conferenceMeta = {
  name: "NWACUHO Annual Conference Schedule",
  year: 2026,
  theme: "Enriching the housing profession",
  location: "Seattle, WA",
  dates: "February 9–11, 2026",
};

const dayOptions: { id: Session["day"]; label: string }[] = [
  { id: "mon", label: "Monday, Feb 9" },
  { id: "tue", label: "Tuesday, Feb 10" },
  { id: "wed", label: "Wednesday, Feb 11" },
];

const tracks = [
  "All Tracks",
  "Residence Education & Programming",
  "Operations & Facilities",
  "Equity, Diversity & Inclusion",
  "Professional Development",
  "Association & Leadership",
];

const sessionTypes = [
  "All Types",
  "Educational Session",
  "Roundtable",
  "Panel",
  "Workshop",
  "Networking / Social",
  "Business Meeting",
  "Conference Operations",
  "Meal",
];

// ------------------------------
// SESSIONS (ALL 3 DAYS, PRESENTERS: ["TBD"])
// ------------------------------
const sessions: Session[] = [
  // MONDAY, FEB 9
  {
    id: "mon-1",
    title: "Pre-Conference Case Study (Sponsored by Mahlum Architects)",
    track: "Professional Development",
    type: "Workshop",
    day: "mon",
    start: "10:00",
    end: "14:00",
    room: "TBD",
    level: "All Levels",
    description: "Pre-conference case study intensive sponsored by Mahlum Architects.",
    presenters: ["TBD"],
  },
  {
    id: "mon-2",
    title: "Registration Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "mon",
    start: "11:30",
    end: "17:00",
    room: "Registration Area",
    presenters: ["TBD"],
  },
  {
    id: "mon-3",
    title: "Volunteer Orientation",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "mon",
    start: "14:00",
    end: "14:30",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "mon-4",
    title: "New to NWACUHO / New to the Profession Welcome",
    track: "Professional Development",
    type: "Networking / Social",
    day: "mon",
    start: "14:30",
    end: "15:00",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "mon-5",
    title: "Mentorship Program Meet-Up",
    track: "Professional Development",
    type: "Networking / Social",
    day: "mon",
    start: "15:00",
    end: "15:45",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "mon-6",
    title: "Conference Opening and Welcome (Awards & Scholarship Announcements)",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "mon",
    start: "16:00",
    end: "16:45",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
  {
    id: "mon-7",
    title: "Open Social",
    track: "Association & Leadership",
    type: "Networking / Social",
    day: "mon",
    start: "16:45",
    end: "17:30",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "mon-8",
    title: "Dinner on Own",
    track: "All Tracks",
    type: "Meal",
    day: "mon",
    start: "17:30",
    end: "20:00",
    room: "Off-Site / On Your Own",
    presenters: ["TBD"],
  },
  {
    id: "mon-9",
    title: "On-Site Entertainment Options",
    track: "Association & Leadership",
    type: "Networking / Social",
    day: "mon",
    start: "20:00",
    end: "21:30",
    room: "TBD",
    presenters: ["TBD"],
  },

  // TUESDAY, FEB 10
  {
    id: "tue-1",
    title: "Registration Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "07:30",
    end: "11:30",
    room: "Registration Area",
    presenters: ["TBD"],
  },
  {
    id: "tue-2",
    title: "Morning Announcements",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "08:30",
    end: "08:50",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
  {
    id: "tue-3",
    title: "Interest Session Block #1",
    track: "Professional Development",
    type: "Educational Session",
    day: "tue",
    start: "09:00",
    end: "09:50",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "tue-4",
    title: "Exhibit Hall Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "10:00",
    end: "15:30",
    room: "Exhibit Hall",
    presenters: ["TBD"],
  },
  {
    id: "tue-5",
    title: "Interest Session Block #2",
    track: "Professional Development",
    type: "Educational Session",
    day: "tue",
    start: "10:00",
    end: "10:50",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "tue-6",
    title: "Exhibit Hall Time / Break",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "11:00",
    end: "12:00",
    room: "Exhibit Hall",
    presenters: ["TBD"],
  },
  {
    id: "tue-7",
    title: "Lunch with Exhibitors",
    track: "All Tracks",
    type: "Meal",
    day: "tue",
    start: "12:00",
    end: "13:00",
    room: "Exhibit Hall",
    presenters: ["TBD"],
  },
  {
    id: "tue-8",
    title: "Interest Session Block #3",
    track: "Professional Development",
    type: "Educational Session",
    day: "tue",
    start: "13:10",
    end: "14:00",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "tue-9",
    title: "Exhibit Hall Time / Break",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "14:00",
    end: "15:30",
    room: "Exhibit Hall",
    presenters: ["TBD"],
  },
  {
    id: "tue-10",
    title: "Snack Break in Exhibit Hall / End of Exhibit Hall",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "14:30",
    end: "15:30",
    room: "Exhibit Hall",
    presenters: ["TBD"],
  },
  {
    id: "tue-11",
    title: "Affinity Social",
    track: "Equity, Diversity & Inclusion",
    type: "Networking / Social",
    day: "tue",
    start: "15:30",
    end: "16:30",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-12",
    title: "Coffee Chat",
    track: "Professional Development",
    type: "Networking / Social",
    day: "tue",
    start: "15:30",
    end: "16:30",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-13",
    title: "Swag Swap",
    track: "Association & Leadership",
    type: "Networking / Social",
    day: "tue",
    start: "16:30",
    end: "17:00",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-14",
    title: "Corporate Member and Board Meeting",
    track: "Association & Leadership",
    type: "Business Meeting",
    day: "tue",
    start: "16:30",
    end: "17:00",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-15",
    title: "Functional Area Meet and Greet",
    track: "Professional Development",
    type: "Networking / Social",
    day: "tue",
    start: "17:15",
    end: "18:00",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-16",
    title: "Past-President Reception",
    track: "Association & Leadership",
    type: "Networking / Social",
    day: "tue",
    start: "17:15",
    end: "18:00",
    room: "TBD",
    presenters: ["TBD"],
  },
  {
    id: "tue-17",
    title: "Dinner on Own",
    track: "All Tracks",
    type: "Meal",
    day: "tue",
    start: "18:00",
    end: "20:00",
    room: "Off-Site / On Your Own",
    presenters: ["TBD"],
  },
  {
    id: "tue-18",
    title: "Night on the Town and On-Site Entertainment Options",
    track: "Association & Leadership",
    type: "Networking / Social",
    day: "tue",
    start: "20:00",
    end: "22:00",
    room: "On-Site / Off-Site Options",
    presenters: ["TBD"],
  },

  // WEDNESDAY, FEB 11
  {
    id: "wed-1",
    title: "Registration Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "wed",
    start: "07:30",
    end: "10:00",
    room: "Registration Area",
    presenters: ["TBD"],
  },
  {
    id: "wed-2",
    title: "Case Study Presentations",
    track: "Professional Development",
    type: "Educational Session",
    day: "wed",
    start: "08:00",
    end: "09:30",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "wed-3",
    title: "Roundtables – Open Topic Sessions",
    track: "Residence Education & Programming",
    type: "Roundtable",
    day: "wed",
    start: "08:30",
    end: "09:30",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "wed-4",
    title: "Morning Announcements and Strategic Plan Presentation / Town Hall",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "wed",
    start: "09:30",
    end: "10:20",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
  {
    id: "wed-5",
    title: "Interest Session Block #4",
    track: "Professional Development",
    type: "Educational Session",
    day: "wed",
    start: "10:30",
    end: "11:20",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "wed-6",
    title: "Interest Session Block #5",
    track: "Professional Development",
    type: "Educational Session",
    day: "wed",
    start: "11:30",
    end: "12:20",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "wed-7",
    title: "Lunch and NWACUHO Business Meeting",
    track: "Association & Leadership",
    type: "Business Meeting",
    day: "wed",
    start: "12:30",
    end: "14:20",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
  {
    id: "wed-8",
    title: "NWACUHO Work Groups / Engagement Opportunities",
    track: "Association & Leadership",
    type: "Business Meeting",
    day: "wed",
    start: "14:30",
    end: "15:20",
    room: "Breakout Rooms",
    description:
      "Explore ways to stay engaged with NWACUHO post-conference through work groups and volunteer roles.",
    presenters: ["TBD"],
  },
  {
    id: "wed-9",
    title: "Interest Session Block #6",
    track: "Professional Development",
    type: "Educational Session",
    day: "wed",
    start: "15:30",
    end: "16:20",
    room: "Breakout Rooms",
    presenters: ["TBD"],
  },
  {
    id: "wed-10",
    title: "Break",
    track: "All Tracks",
    type: "Conference Operations",
    day: "wed",
    start: "16:20",
    end: "17:00",
    room: "Conference Center",
    presenters: ["TBD"],
  },
  {
    id: "wed-11",
    title: "Dinner Buffet Line Opens",
    track: "All Tracks",
    type: "Meal",
    day: "wed",
    start: "17:00",
    end: "17:30",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
  {
    id: "wed-12",
    title: "Closing Banquet Program",
    track: "Association & Leadership",
    type: "Meal",
    day: "wed",
    start: "17:30",
    end: "19:00",
    room: "Main Ballroom",
    presenters: ["TBD"],
  },
];

// ------------------------------
// UTILS
// ------------------------------
function toDisplayTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function sortSessions(list: Session[]): Session[] {
  return [...list].sort((a, b) => a.start.localeCompare(b.start));
}

// ------------------------------
// MAIN COMPONENT
// ------------------------------
export default function ConferenceScheduleApp() {
  const [selectedDay, setSelectedDay] = useState<Session["day"]>("mon");
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [type, setType] = useState("All Types");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredSessions = useMemo(() => {
    let list = sessions.filter((s) => s.day === selectedDay);

    if (track !== "All Tracks") {
      list = list.filter((s) => s.track === track);
    }

    if (type !== "All Types") {
      list = list.filter((s) => s.type === type);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.presenters.some((p) => p.toLowerCase().includes(q))
      );
    }

    if (onlyFavorites) {
      list = list.filter((s) => favorites.has(s.id));
    }

    return sortSessions(list);
  }, [selectedDay, search, track, type, onlyFavorites, favorites]);

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      {/* HEADER */}
      <header className="bg-[#28903b] text-white px-6 py-5 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">
            {conferenceMeta.year} NWACUHO Annual Conference
          </p>
          <h1 className="text-2xl font-bold">{conferenceMeta.name}</h1>
          <p className="text-sm opacity-90">{conferenceMeta.theme}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm opacity-90">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {conferenceMeta.dates}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {conferenceMeta.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" />
              My Schedule: {favorites.size} session
              {favorites.size === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="w-full md:w-64 flex flex-col gap-4 mb-4 md:mb-0">
          {/* Day select */}
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
            <h2 className="text-sm font-semibold mb-1">Browse by Day</h2>
            <p className="text-[11px] text-slate-500 mb-2">
              Choose a day to view sessions.
            </p>
            <select
              className="w-full h-9 text-xs rounded-md border border-slate-200 px-2"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as Session["day"])}
            >
              {dayOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filters */}
          <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide flex items-center gap-2">
                <Search className="h-3 w-3" />
                Filters
              </span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="h-3 w-3"
                />
                <Star className="h-3 w-3" />
                My Schedule Only
              </label>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, topic, presenter"
                  className="w-full h-8 pl-7 pr-2 rounded-md border border-slate-200 text-xs"
                />
              </div>

              <select
                className="w-full h-8 rounded-md border border-slate-200 text-xs px-2"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              >
                {tracks.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select
                className="w-full h-8 rounded-md border border-slate-200 text-xs px-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {sessionTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: Star sessions to build your personal schedule, then toggle{" "}
              <span className="font-semibold">My Schedule Only</span> to review.
            </p>
          </div>
        </aside>

        {/* RIGHT: SESSION LIST */}
        <section className="flex-1 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">
                {dayOptions.find((d) => d.id === selectedDay)?.label} Schedule
              </h2>
              <p className="text-[11px] text-slate-500">
                {filteredSessions.length} session
                {filteredSessions.length === 1 ? "" : "s"} found
                {onlyFavorites && " (showing favorites only)"}.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
            {filteredSessions.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-12">
                No sessions match your filters yet.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-slate-200 rounded-lg p-3 text-xs flex gap-3 hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleFavorite(session.id)}
                    className={`mt-1 h-6 w-6 flex items-center justify-center rounded-full border ${
                      favorites.has(session.id)
                        ? "bg-[#28903b] text-white border-[#28903b]"
                        : "bg-white text-slate-500 border-slate-300"
                    }`}
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className={`h-3 w-3 ${
                        favorites.has(session.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-semibold text-[13px]">
                        {session.title}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        {toDisplayTime(session.start)}–{toDisplayTime(session.end)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-600">
                      <span className="px-2 py-[2px] rounded-full border border-slate-200 bg-slate-50">
                        {session.track}
                      </span>
                      <span className="px-2 py-[2px] rounded-full border border-slate-200">
                        {session.type}
                      </span>
                      {session.level && (
                        <span className="px-2 py-[2px] rounded-full border border-slate-200">
                          {session.level}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.room}
                      </span>
                    </div>

                    {session.description && (
                      <p className="mt-2 text-[11px] text-slate-700">
                        {session.description}
                      </p>
                    )}

                    <p className="mt-1 text-[11px] text-slate-500">
                      <span className="font-semibold">Presenters:</span>{" "}
                      {session.presenters.join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
