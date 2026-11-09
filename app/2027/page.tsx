import Link from "next/link";

type Row = Record<string, unknown>;
const sections = [
  { title: "Plan your conference", items: ["Schedule & My Agenda", "Speakers", "Announcements", "Venue Maps", "Awards & Recognition"] },
  { title: "Explore Vancouver", items: ["Travel Information & Tips", "Vancouver Local Guide", "Accessibility Guide", "Help Desk & FAQ"] },
  { title: "Connect & participate", items: ["Exhibitors", "Community Partners", "Networking Directory", "Volunteer Center", "Photo Gallery", "Conference Evaluations", "Engagement Challenges"] },
];
async function readPublished(table: string, select = "*"): Promise<Row[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const response = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=created_at.desc&limit=30`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];
  return (await response.json()) as Row[];
}
export default async function Conference2027() {
  const [conferences, announcements] = await Promise.all([
    readPublished("conferences", "id,name,city,year,status"),
    readPublished("announcements", "id,title,body,severity,published_at"),
  ]);
  const conference = conferences.find((row) => row.year === 2027 && row.status === "published");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#4D746D]">NWACUHO · Vancouver, BC</p>
      <h1 className="mt-2 text-4xl font-semibold text-[#1F443E]">2027 Conference Companion</h1>
      <p className="mt-3 max-w-2xl text-slate-700">Your home for sessions, travel, accessibility, exhibitors, community partners, volunteering, and conference updates.</p>
      {!conference && (
        <div role="status" className="mt-6 rounded-xl border border-[#8F6B53]/40 bg-white p-5 text-slate-700">
          <strong className="text-[#1F443E]">Preview in progress.</strong> The Vancouver conference is not published yet. This page shows the planned sections without exposing draft records.
        </div>
      )}
      {conference && announcements.length > 0 && (
        <section aria-label="Conference announcements" className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-[#1F443E]">Latest announcements</h2>
          {announcements.map((notice) => (
            <article key={String(notice.id)} className="rounded-xl border bg-white p-4">
              <h3 className="font-semibold">{String(notice.title)}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{String(notice.body)}</p>
            </article>
          ))}
        </section>
      )}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F443E]">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => <li key={item} className="border-b border-slate-100 pb-2 text-sm text-slate-700">{item}</li>)}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">More interactive features will become available as the conference team publishes verified information.</p>
      <Link className="mt-4 inline-block text-sm font-semibold text-[#1F443E] underline" href="/">Return to current schedule</Link>
    </div>
  );
}
