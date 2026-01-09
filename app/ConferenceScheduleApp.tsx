"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Filter, MapPin, Search, Star } from "lucide-react";

import { SPEAKER_ID_BY_NAME } from "@/lib/speakersData";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// =======================
// Config (EDIT THESE)
// =======================
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby0pPaSuE0XhIwAqencFZTTEYtFT57wB648KDppSymJA4CSb1HHeQHnBPX1ZMbteZUy/exec";
const FAVORITES_KEY = "nwacuho:favorites:v1";

// =======================
// Types
// =======================
type Session = {
  id: string;
  title: string;
  track: string;
  type: string;
  day: "mon" | "tue" | "wed";
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  room: string;
  level: string;
  description?: string;

  // API may return these as string or array
  presenters: string[] | string;
  presenterIds?: string[] | string; // semicolon-separated OR array
};

type ApiResponse = {
  lastUpdated?: string;
  sessions?: Session[];
  rowErrors?: Array<{ row: number; id?: string; errors: string[] }>;
};

// =======================
// Local favorites helpers
// =======================
function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)));
  } catch {
    // ignore quota/private mode errors
  }
}

// =======================
// JSONP fallback (if CORS blocks fetch)
// =======================
function fetchJsonp(url: string, timeoutMs = 15000): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const cb = `__nw_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");

    const cleanup = () => {
      try {
        delete (window as any)[cb];
      } catch {
        // ignore
      }
      script.remove();
    };

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("JSONP request timed out"));
    }, timeoutMs);

    (window as any)[cb] = (data: ApiResponse) => {
      window.clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${cb}`;
    script.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(new Error("JSONP script failed to load"));
    };

    document.body.appendChild(script);
  });
}

// =======================
// Display helpers
// =======================
const conferenceMeta = {
  name: "NWACUHO Annual Conference Schedule",
  year: 2026,
  theme: "Enriching the housing profession",
  location: "Seattle, WA",
  dates: "February 9–11, 2026",
};

const days = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
] as const;

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

function toDisplayTime(time: string): string {
  if (!time) return "TBD";
  const match24 = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match24) return time;

  const h = Number(match24[1]);
  const m = Number(match24[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "TBD";

  const hour12 = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function sortSessions(list: Session[]): Session[] {
  return [...list].sort((a, b) => a.start.localeCompare(b.start));
}

// =======================
// Presenter linking helpers
// =======================
function normPresenter(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCommaNames(v: string) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitSemicolonIds(v: string) {
  return (v || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function asNameArray(presenters: string[] | string | undefined): string[] {
  if (!presenters) return [];
  return Array.isArray(presenters) ? presenters : splitCommaNames(presenters);
}

function asIdArray(presenterIds: string[] | string | undefined): string[] {
  if (!presenterIds) return [];
  return Array.isArray(presenterIds)
    ? presenterIds
    : splitSemicolonIds(presenterIds);
}

function PresentersLine({
  presenters,
  presenterIds,
}: {
  presenters?: string[] | string;
  presenterIds?: string[] | string;
}) {
  const names = asNameArray(presenters);
  const ids = asIdArray(presenterIds);

  if (!names.length) return null;
  if (names.length === 1 && normPresenter(names[0]) === "n/a") return null;

  return (
    <p className="text-xs text-slate-500">
      <span className="font-semibold">Presenters:</span>{" "}
      {names.map((name, i) => {
        const idFromIds = ids[i];
        const idFromName = SPEAKER_ID_BY_NAME[normPresenter(name)];
        const id = idFromIds || idFromName;

        return (
          <span key={`${name}-${i}`}>
            {id ? (
              <Link
                href={`/speakers#${id}`}
                className="text-[#1f7a2f] font-semibold hover:underline underline-offset-4"
              >
                {name}
              </Link>
            ) : (
              <span>{name}</span>
            )}
            {i < names.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </p>
  );
}

// =======================
// Default fallback sessions (your existing mock data)
// =======================
const mockSessions: Session[] = [
  // Monday, February 9, 2026
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
    description:
      "Pre-conference case study intensive sponsored by Mahlum Architects.",
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
    level: "All Levels",
    presenters: ["NWACUHO Volunteers"],
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["NWACUHO Leadership"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["N/A"],
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
    level: "All Levels",
    presenters: ["TBD"],
  },

  // Tuesday, February 10, 2026
  {
    id: "tue-1",
    title: "Registration Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "tue",
    start: "07:30",
    end: "11:30",
    room: "Registration Area",
    level: "All Levels",
    presenters: ["NWACUHO Volunteers"],
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
    level: "All Levels",
    presenters: ["NWACUHO Leadership"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["Corporate Partners"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["Corporate Partners"],
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
    level: "All Levels",
    presenters: ["N/A"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["Corporate Partners"],
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
    level: "All Levels",
    presenters: ["Corporate Partners"],
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["Board & Corporate Members"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["Past Presidents"],
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
    level: "All Levels",
    presenters: ["N/A"],
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
    level: "All Levels",
    presenters: ["TBD"],
  },

  // Wednesday, February 11, 2026
  {
    id: "wed-1",
    title: "Registration Open",
    track: "Association & Leadership",
    type: "Conference Operations",
    day: "wed",
    start: "07:30",
    end: "10:00",
    room: "Registration Area",
    level: "All Levels",
    presenters: ["NWACUHO Volunteers"],
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["NWACUHO Leadership"],
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
    level: "All Levels",
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["NWACUHO Board"],
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
    level: "All Levels",
    description:
      "Explore ways to stay engaged with NWACUHO post-conference through work groups and volunteer roles.",
    presenters: ["NWACUHO Work Group Leads"],
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
    level: "All Levels",
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
    level: "All Levels",
    presenters: ["N/A"],
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
    level: "All Levels",
    presenters: ["N/A"],
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
    level: "All Levels",
    presenters: ["NWACUHO Leadership"],
  },
];

// =======================
// Components
// =======================
type SessionCardProps = {
  session: Session;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <Card className="mb-3 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base font-semibold leading-snug">
            {session.title}
          </CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {toDisplayTime(session.start)}–{toDisplayTime(session.end)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {session.room}
            </span>
          </CardDescription>
        </div>
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={() => onToggleFavorite(session.id)}
          aria-label={
            isFavorite ? "Remove from My Schedule" : "Add to My Schedule"
          }
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-slate-300 bg-slate-50">
            {session.track}
          </Badge>
          <Badge variant="secondary">{session.type}</Badge>
          {session.level && <Badge variant="outline">{session.level}</Badge>}
        </div>

        {session.description && (
          <p className="text-xs text-slate-700 mb-2">{session.description}</p>
        )}

        <PresentersLine
          presenters={session.presenters}
          presenterIds={session.presenterIds}
        />
      </CardContent>
    </Card>
  );
};

type FilterBarProps = {
  search: string;
  onSearch: (value: string) => void;
  track: string;
  onTrackChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  onlyFavorites: boolean;
  onToggleFavorites: (value: boolean) => void;
};

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearch,
  track,
  onTrackChange,
  type,
  onTypeChange,
  onlyFavorites,
  onToggleFavorites,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Switch
            id="favorites-toggle"
            checked={onlyFavorites}
            onCheckedChange={onToggleFavorites}
          />
          <Label
            htmlFor="favorites-toggle"
            className="flex items-center gap-1 text-[11px] text-slate-700 cursor-pointer"
          >
            <Star className="h-3 w-3" /> My Schedule Only
          </Label>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by title, topic, or presenter"
            className="pl-8 text-xs"
          />
        </div>
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          value={track}
          onChange={(e) => onTrackChange(e.target.value)}
        >
          {tracks.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          {sessionTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// =======================
// Main App
// =======================
export default function ConferenceScheduleApp() {
  const [selectedDay, setSelectedDay] = useState<"mon" | "tue" | "wed">("mon");
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [type, setType] = useState("All Types");

  // Favorites (persisted)
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Sessions from API (fallback to mock)
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Persist favorites locally
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Sync favorites across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) setFavorites(loadFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Load schedule from Apps Script (try fetch, then JSONP fallback)
  useEffect(() => {
    const url = APPS_SCRIPT_URL?.trim();
    if (!url || url.includes("PASTE_YOUR")) return;

    setLoading(true);
    setLoadError(null);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ApiResponse;
      })
      .catch(async () => {
        // CORS or fetch failure -> try JSONP
        return await fetchJsonp(url);
      })
      .then((data) => {
        if (Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        } else {
          throw new Error("Unexpected API response (missing sessions[])");
        }
        setLastUpdated(data.lastUpdated ?? null);
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load schedule. Showing the built-in schedule.");
        setSessions(mockSessions);
      })
      .finally(() => setLoading(false));
  }, []);

  // Optional: prune favorites that don't exist in the current sessions list
  useEffect(() => {
    const valid = new Set(sessions.map((s) => s.id));
    setFavorites((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let list = sessions.filter((s) => s.day === selectedDay);

    if (track !== "All Tracks") list = list.filter((s) => s.track === track);
    if (type !== "All Types") list = list.filter((s) => s.type === type);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const presentersArr = asNameArray(s.presenters);
        return (
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          presentersArr.some((p) => p.toLowerCase().includes(q))
        );
      });
    }

    if (onlyFavorites) list = list.filter((s) => favorites.has(s.id));

    return sortSessions(list);
  }, [selectedDay, search, track, type, favorites, onlyFavorites, sessions]);

  const favoriteCount = favorites.size;

  return (
    <div className="min-h-screen bg-neutral-900/5 py-6 px-3 md:px-6 font-[Calibri,_system-ui,_sans-serif]">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
            <div className="text-center md:text-left flex-1 min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                {conferenceMeta.year} NWACUHO Annual Conference
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl font-['Franklin_Gothic',_Calibri,_system-ui,_sans-serif]">
                {conferenceMeta.name}
              </h1>
              <p className="mt-1 text-sm md:text-base">{conferenceMeta.theme}</p>
              <div className="mt-2 text-[11px] text-white/80">
                {loading ? (
                  <span>Updating schedule…</span>
                ) : loadError ? (
                  <span>{loadError}</span>
                ) : lastUpdated ? (
                  <span>
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="text-center md:text-right text-xs md:text-sm min-w-[180px]">
              <div className="flex items-center justify-end gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{conferenceMeta.dates}</span>
              </div>
              <div className="mt-1 flex items-center justify-end gap-2">
                <MapPin className="h-4 w-4" />
                <span>{conferenceMeta.location}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/40 bg-slate-900/40 px-3 py-1 text-[11px]">
                <Star className="h-3 w-3" />
                <span>
                  My Schedule: {favoriteCount} session
                  {favoriteCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Layout */}
        <main className="grid gap-4 md:grid-cols-[260px,1fr]">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Browse by Day</CardTitle>
                <CardDescription className="text-xs">
                  Tap a day to view sessions and build your personal schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs
                  value={selectedDay}
                  onValueChange={(value) =>
                    setSelectedDay(value as "mon" | "tue" | "wed")
                  }
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-xs">
                    {days.map((d) => (
                      <TabsTrigger
                        key={d.id}
                        value={d.id}
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900"
                      >
                        {d.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value={selectedDay} />
                </Tabs>
              </CardContent>
            </Card>

            <FilterBar
              search={search}
              onSearch={setSearch}
              track={track}
              onTrackChange={setTrack}
              type={type}
              onTypeChange={setType}
              onlyFavorites={onlyFavorites}
              onToggleFavorites={setOnlyFavorites}
            />

            <Card className="border-slate-200/80 shadow-sm text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>★ Tap the star on a session to add it to your schedule.</p>
                <p>
                  Use the <span className="font-semibold">My Schedule Only</span>{" "}
                  toggle or “My Schedule” view to quickly review favorited
                  sessions.
                </p>
                <p>
                  Combine filters and search to find sessions by topic, track, or
                  presenter.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <section className="flex min-h-[420px] flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-sm font-semibold">
                  {days.find((d) => d.id === selectedDay)?.label} Schedule
                </h2>
                <p className="text-[11px] text-slate-500">
                  {filteredSessions.length} session
                  {filteredSessions.length === 1 ? "" : "s"} found
                  {onlyFavorites && ", showing favorites only"}.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-[11px]">
                <button
                  className={`px-2 py-1 rounded-full ${
                    !onlyFavorites
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600"
                  }`}
                  onClick={() => setOnlyFavorites(false)}
                >
                  All Sessions
                </button>
                <button
                  className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                    onlyFavorites
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600"
                  }`}
                  onClick={() => setOnlyFavorites(true)}
                >
                  <span>My Schedule</span>
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#28903b] text-[9px] text-white">
                    {favoriteCount}
                  </span>
                </button>
              </div>
            </div>

            <ScrollArea className="h-[520px] pr-2">
              {filteredSessions.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-slate-500">
                  <p className="font-medium">No sessions match your filters.</p>
                  <p className="text-xs mt-1">
                    Try adjusting the day, track, type, or search keywords—or add
                    sessions to your schedule with the star icon.
                  </p>
                </div>
              ) : (
                <div className="pt-1">
                  {filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isFavorite={favorites.has(session.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </section>
        </main>
      </div>
    </div>
  );
}
