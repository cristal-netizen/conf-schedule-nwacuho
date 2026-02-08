"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  Filter,
  Info,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";

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

  presenters: string[] | string;
  presenterIds?: string[] | string;
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
  // Hydration-safe: called only in lazy init
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(FAVORITES_KEY) : null;
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
// Attendance logging (to Google Sheet via Apps Script)
// =======================
const ANON_KEY = "nwacuho:anonId:v1";
const QUEUE_KEY = "nwacuho:attendanceQueue:v1";

type AttendanceEvent = {
  ts: number;
  anonId: string;
  sessionId: string;
  action: "add" | "remove";
  sessionTitle: string;
  day: Session["day"];
  start: string;
  end: string;
  room: string;
  userAgent?: string;
};

function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function readQueue(): AttendanceEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const arr = raw ? (JSON.parse(raw) as AttendanceEvent[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: AttendanceEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

function queueAttendanceEvent(evt: AttendanceEvent) {
  const q = readQueue();
  q.push(evt);
  writeQueue(q);
}

function trySendBeacon(url: string, payload: object): boolean {
  try {
    if (!("sendBeacon" in navigator)) return false;
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}

async function postAttendanceEvent(url: string, evt: AttendanceEvent) {
  const payload = {
    anonId: evt.anonId,
    sessionId: evt.sessionId,
    action: evt.action,
    sessionTitle: evt.sessionTitle,
    day: evt.day,
    start: evt.start,
    end: evt.end,
    room: evt.room,
    userAgent: evt.userAgent || "",
  };

  // Best effort: avoids CORS issues and works during unload
  if (trySendBeacon(url, payload)) return;

  // Fallback: opaque response is fine; we only need it to reach Apps Script
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "no-cors",
    keepalive: true,
  });
}

async function flushAttendanceQueue(url: string) {
  if (!url) return;
  if (typeof window === "undefined") return;
  if (!navigator.onLine) return;

  const queue = readQueue();
  if (!queue.length) return;

  const remaining: AttendanceEvent[] = [];
  for (const evt of queue) {
    try {
      await postAttendanceEvent(url, evt);
    } catch {
      remaining.push(evt);
    }
  }
  writeQueue(remaining);
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

// --------- Room normalization (UX: consistent labels + map link) ---------
const ROOM_NORMALIZE: Array<[RegExp, string]> = [
  [/^cascade ballroom(\s*(1|2|i|ii|iii|i-a|i-b|i-c))?$/i, "Cascade Ballroom"],
  [/^cascade foyer.*$/i, "Cascade Foyer"],
  [/^grand ballroom.*$/i, "Grand Ballroom"],
  [/^san juan foyer.*$/i, "San Juan Foyer"],
  [/^registration area$/i, "Registration"],
  [/^hotel lobby$/i, "Hotel Lobby"],
];

const ROOM_META: Record<
  string,
  { floor: string; mapHref: string; badge?: string }
> = {
  "Cascade Ballroom": {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Main Events",
  },
  "Cascade Foyer": {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Registration / Pre-function",
  },
  Adams: {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Sessions",
  },
  Olympic: {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Sessions",
  },
  Stuart: {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Meetings / Work Space",
  },
  Baker: {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Lactation",
  },
  "St. Helens": {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Sensory Space",
  },
  Registration: {
    floor: "Mezzanine Level (2nd Floor)",
    mapHref: "/venue",
    badge: "Info Desk",
  },
  "Hotel Lobby": {
    floor: "Lobby Level (1st Floor)",
    mapHref: "/venue",
    badge: "Meet-up Point",
  },
  Whidbey: {
    floor: "San Juan Level (3rd Floor)",
    mapHref: "/venue",
    badge: "Sessions",
  },
  Orcas: {
    floor: "San Juan Level (3rd Floor)",
    mapHref: "/venue",
    badge: "Sessions",
  },
  Blakely: {
    floor: "San Juan Level (3rd Floor)",
    mapHref: "/venue",
    badge: "Sessions",
  },
  "Puget Sound": {
    floor: "Lobby Level (1st Floor)",
    mapHref: "/venue",
    badge: "Social / Events",
  },
  "Mahlum Seattle Home Office": {
    floor: "Off-site",
    mapHref: "/venue",
    badge: "Off-site",
  },
  "UW Campus – Lander Hall": {
    floor: "Off-site",
    mapHref: "/venue",
    badge: "Off-site",
  },
};

function normalizeRoom(room: string): string {
  const r = (room || "").trim();
  if (!r) return "TBD";
  for (const [re, repl] of ROOM_NORMALIZE) {
    if (re.test(r)) return repl;
  }
  return r;
}

function getRoomMeta(room: string): { floor?: string; mapHref?: string; badge?: string } {
  const key = normalizeRoom(room);
  const meta = ROOM_META[key];
  if (!meta) return {};
  return { floor: meta.floor, mapHref: meta.mapHref, badge: meta.badge };
}

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
// Default fallback sessions (keep your existing list)
// =======================
const mockSessions: Session[] = [
  // Keep YOUR existing mockSessions here exactly.
  // Leaving this empty will break fallback behavior.
] as unknown as Session[];

// =======================
// Components
// =======================
type SessionCardProps = {
  session: Session;
  isFavorite: boolean;
  onToggleFavorite: (session: Session) => void;
};

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isFavorite,
  onToggleFavorite,
}) => {
  const roomLabel = normalizeRoom(session.room);
  const meta = getRoomMeta(session.room);

  return (
    <Card className="mb-3 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="min-w-0">
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
              <span className="font-medium text-slate-700">{roomLabel}</span>
            </span>

            {meta.floor ? (
              <Badge variant="outline" className="border-slate-200 bg-white">
                {meta.floor}
              </Badge>
            ) : null}

            {meta.badge ? (
              <Badge variant="secondary" className="text-[11px]">
                {meta.badge}
              </Badge>
            ) : null}

            {meta.mapHref ? (
              <Link
                href={meta.mapHref}
                className="inline-flex items-center gap-1 text-[#1f7a2f] font-semibold hover:underline underline-offset-4"
                aria-label="Open venue map"
              >
                View venue map <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
          </CardDescription>
        </div>

        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={() => onToggleFavorite(session)}
          aria-label={isFavorite ? "Remove from My Schedule" : "Add to My Schedule"}
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

        <PresentersLine presenters={session.presenters} presenterIds={session.presenterIds} />
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
  onClear: () => void;
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
  onClear,
}) => {
  const hasActiveFilters =
    !!search.trim() ||
    track !== "All Tracks" ||
    type !== "All Types" ||
    onlyFavorites;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filters
          {hasActiveFilters ? (
            <Badge variant="secondary" className="text-[11px]">
              Active
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 px-2 text-xs"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          ) : null}

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
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search title, description, presenter, or room"
            className="pl-8 text-xs"
            aria-label="Search sessions"
          />
        </div>

        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          value={track}
          onChange={(e) => onTrackChange(e.target.value)}
          aria-label="Filter by track"
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
          aria-label="Filter by type"
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
  const [mounted, setMounted] = useState(false); // hydration-safe time rendering
  const [selectedDay, setSelectedDay] = useState<"mon" | "tue" | "wed">("mon");

  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [type, setType] = useState("All Types");

  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

const handleToggleFavorite = (session: Session) => {
  const id = session.id;

  setFavorites((prev) => {
    const next = new Set(prev);

    const willAdd = !next.has(id);
    if (willAdd) next.add(id);
    else next.delete(id);

    const evt: AttendanceEvent = {
      ts: Date.now(),
      anonId: getAnonId(),
      sessionId: id,
      action: willAdd ? "add" : "remove",
      sessionTitle: session.title,
      day: session.day,
      start: session.start,
      end: session.end,
      room: normalizeRoom(session.room),
      userAgent: navigator.userAgent,
    };

    if (!navigator.onLine) {
      queueAttendanceEvent(evt);
    } else {
      postAttendanceEvent(APPS_SCRIPT_URL, evt).catch(() => queueAttendanceEvent(evt));
    }

    return next;
  });
};

  const clearFilters = () => {
    setSearch("");
    setTrack("All Tracks");
    setType("All Types");
    setOnlyFavorites(false);
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

// =======================
// Load schedule from Apps Script (JSONP to avoid CORS)
// =======================
useEffect(() => {
  const url = APPS_SCRIPT_URL?.trim();
  if (!url) return;

  setLoading(true);
  setLoadError(null);

  fetchJsonp(url)
    .then((data) => {
      if (Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        setLastUpdated(data.lastUpdated ?? null);
      } else {
        throw new Error("Unexpected API response (missing sessions[])");
      }
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

  useEffect(() => {
  flushAttendanceQueue(APPS_SCRIPT_URL);

  const onOnline = () => flushAttendanceQueue(APPS_SCRIPT_URL);
  window.addEventListener("online", onOnline);
  return () => window.removeEventListener("online", onOnline);
}, []);

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
          (s.description ?? "").toLowerCase().includes(q) ||
          presentersArr.some((p) => p.toLowerCase().includes(q)) ||
          normalizeRoom(s.room).toLowerCase().includes(q)
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
        <header className="rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                {conferenceMeta.year} NWACUHO Annual Conference
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl font-['Franklin_Gothic',_Calibri,_system-ui,_sans-serif]">
                {conferenceMeta.name}
              </h1>
              <p className="mt-1 text-sm md:text-base">{conferenceMeta.theme}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/85">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {conferenceMeta.dates}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {conferenceMeta.location}
                </span>

                <Link
                  href="/venue"
                  className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 hover:bg-white/20"
                >
                  View Venue Map <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-2 text-[11px] text-white/80">
                {loading ? (
                  <span>Updating schedule…</span>
                ) : loadError ? (
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {loadError}
                  </span>
                ) : lastUpdated ? (
                  <span>
                    Last updated: {mounted ? new Date(lastUpdated).toLocaleString() : "—"}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-slate-900/40 px-3 py-1 text-[11px]">
                <Star className="h-3 w-3" />
                <span>
                  My Schedule: {favoriteCount} session{favoriteCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="inline-flex items-center rounded-full bg-white/10 p-1 text-[11px]">
                <button
                  className={`px-2 py-1 rounded-full ${
                    !onlyFavorites ? "bg-white text-slate-900 shadow-sm" : "text-white/90"
                  }`}
                  onClick={() => setOnlyFavorites(false)}
                >
                  All Sessions
                </button>
                <button
                  className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                    onlyFavorites ? "bg-white text-slate-900 shadow-sm" : "text-white/90"
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
          </div>
        </header>

        {/* Layout */}
        <main className="grid gap-4 md:grid-cols-[280px,1fr]">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Browse by Day</CardTitle>
                <CardDescription className="text-xs">
                  Choose a day, then filter and star sessions to build your schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs
                  value={selectedDay}
                  onValueChange={(value) => setSelectedDay(value as "mon" | "tue" | "wed")}
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
              onClear={clearFilters}
            />

            <Card className="border-slate-200/80 shadow-sm text-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  ★ Star a session to add it to <span className="font-semibold">My Schedule</span>.
                </p>
                <p>
                  Search can match room names (try “Cascade”, “Adams”, “Whidbey”).
                </p>
                <p>
                  Use <span className="font-semibold">View Venue Map</span> to find session rooms fast.
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
                  {filteredSessions.length} session{filteredSessions.length === 1 ? "" : "s"} found
                  {onlyFavorites && ", favorites only"}.
                </p>
              </div>

              <Link
                href="/venue"
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
              >
                <MapPin className="h-3 w-3" />
                Venue Map
              </Link>
            </div>

            <ScrollArea className="h-[60vh] min-h-[420px] pr-2">
              {filteredSessions.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-slate-500">
                  <p className="font-medium text-slate-700">No sessions match your filters.</p>
                  <p className="text-xs mt-1 max-w-sm">
                    Try clearing filters, switching days, or searching by room (like “Cascade”).
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear filters
                    </Button>
                    <Link href="/venue">
                      <Button variant="default" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        View venue map
                      </Button>
                    </Link>
                  </div>
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
