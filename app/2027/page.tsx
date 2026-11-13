import Image from "next/image";
import {CalendarDays,MapPin,Ticket,Star,ArrowUpRight,ExternalLink,Compass,Users,Accessibility,MessageSquare,Building2,Mic2} from "lucide-react";
import Link from "next/link";
import ScheduleExplorer from "./ScheduleExplorer";
import {getPublicExhibitors} from "./publicDirectory";
import {officialOutline,type ProgramItem,type ProgramDay} from "./officialOutline";

type Row = Record<string, unknown>;
const conferenceUrl = "https://nwacuho.org/page/AnnualConference";
async function fetchPublic(table:string,query:string):Promise<Row[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return [];
  try{
    const r=await fetch(`${url}/rest/v1/${table}?${query}`,{headers:{apikey:key},next:{revalidate:60}});
    if(!r.ok)return [];
    const result=await r.json();
    return Array.isArray(result)?result:[];
  }catch{return [];}
}
function vancouverDay(date:string){return new Date(date).toLocaleDateString("en-CA",{timeZone:"America/Vancouver",year:"numeric",month:"2-digit",day:"2-digit"});}
function vancouverTime(date:string){return new Date(date).toLocaleTimeString("en-GB",{timeZone:"America/Vancouver",hour:"2-digit",minute:"2-digit",hour12:false});}
function category(value:string):ProgramItem["category"]{
  if(value==="education"||value==="keynote")return "program";
  if(value==="networking"||value==="social")return "networking";
  if(value==="exhibit")return "exhibitors";
  if(value==="meal")return "meal";
  return "general";
}
export default async function Conference2027(){
  const spotlightExhibitors=await getPublicExhibitors();
  const conf=await fetchPublic("conferences","select=id,status&year=eq.2027&status=eq.published&limit=1");
  const conferenceId=typeof conf[0]?.id==="string"?conf[0].id:null;
  const [rows,announcements]=conferenceId?await Promise.all([
    fetchPublic("sessions",`select=id,title,starts_at,ends_at,session_type&conference_id=eq.${conferenceId}&status=eq.published&visibility=eq.attendee&review_state=eq.ready&is_placeholder=eq.false&order=starts_at.asc&limit=300`),
    fetchPublic("announcements",`select=id,title,body&conference_id=eq.${conferenceId}&status=eq.published&order=published_at.desc&limit=5`)
  ]):[[],[]];
  const published:ProgramItem[]=rows.flatMap(row=>{
    if(typeof row.title!=="string"||typeof row.starts_at!=="string"||typeof row.ends_at!=="string")return [];
    const day=vancouverDay(row.starts_at);
    if(day!=="2027-02-08"&&day!=="2027-02-09"&&day!=="2027-02-10")return [];
    return [{id:String(row.id),title:row.title,day:day as ProgramDay,start:vancouverTime(row.starts_at),end:vancouverTime(row.ends_at),category:category(String(row.session_type||"general"))}];
  });
  const showPublished=Boolean(conferenceId&&published.length);
  return <div className="min-h-screen bg-[#F7F8F5]">
    <section className="relative isolate overflow-hidden bg-[#1F443E] text-white">
      <div className="absolute inset-0 -z-10" style={{background:"radial-gradient(ellipse at 85% 25%,#547D71 0%,transparent 48%),linear-gradient(110deg,#15382F,#1F443E 65%,#315B52)"}}/>
      <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 -z-10 h-64 w-full opacity-25" viewBox="0 0 1200 300" preserveAspectRatio="none"><path d="M0 240L90 195L150 215L290 60L380 160L470 95L550 166L650 35L775 170L870 95L990 190L1100 110L1200 200V300H0Z" fill="#C7E2D8"/><path d="M0 280L135 235L240 265L360 175L470 245L610 160L715 240L820 185L1020 245L1200 210V300H0Z" fill="#86B8A8"/></svg>
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-14 pt-12 sm:gap-10 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em]"><span className="h-2 w-2 rounded-full bg-[#C9E7D9]"/> NWACUHO 2027 Annual Conference</span>
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-[1.08] tracking-tight sm:text-7xl">Good things grow <em className="font-normal text-[#BDDED3]">together.</em></h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#E2EDE8]">Welcome to your Vancouver conference companion, a home for learning, community, and everything in between.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#schedule" className="inline-flex items-center gap-2 rounded-xl bg-[#F1E9DA] px-5 py-3 font-semibold text-[#1F443E] transition hover:bg-white"><CalendarDays size={18}/> Explore schedule</a>
          <a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"><Ticket size={18}/> Registration details <ArrowUpRight size={16}/></a>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#E7F2EC]"><span className="flex items-center gap-2"><CalendarDays size={17}/> February 8–10, 2027</span><span className="flex items-center gap-2"><MapPin size={17}/> Sheraton Vancouver Wall Centre</span><span className="flex items-center gap-2"><Users size={17}/> Northwest housing community</span></div>
        </div>
        <div className="mx-auto flex w-full max-w-[230px] items-center justify-center sm:max-w-[280px] lg:max-w-[340px]">
          <Image
            priority
            unoptimized
            src="/branding/nwacuho-2027-hq.png"
            alt="NWACUHO 2027 Vancouver conference badge showing the Vancouver skyline and Canadian maple leaves"
            width={520}
            height={601}
            sizes="(min-width: 1024px) 340px, (min-width: 640px) 280px, 230px"
            className="h-auto w-full object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:space-y-20 sm:py-16">
      <section aria-label="Conference quick links" className="grid gap-3 md:grid-cols-3">
        <a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><Ticket size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Register for conference</strong><span className="mt-1 block text-sm text-slate-600">Official registration and membership information</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></a>
        <Link href="/2027/venue" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><MapPin size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Hotel & venue</strong><span className="mt-1 block text-sm text-slate-600">Hotel floor plans, virtual tour & amenities</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></Link>
        <a href="#schedule" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><Star size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Build My Agenda</strong><span className="mt-1 block text-sm text-slate-600">Save an agenda with optional account sync</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></a>
      </section>
      <section aria-label="Exhibitor spotlight" className="overflow-hidden rounded-3xl border border-[#D2E1D8] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E1E9E4] bg-[#EAF2ED] p-6 sm:p-8">
          <div className="max-w-2xl"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#436B58]"><Building2 size={16}/> Exhibitor spotlight</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#1F443E]">Discover our exhibit hall.</h2><p className="mt-2 text-sm leading-relaxed text-[#49675B]">Meet organizations and partners bringing ideas, services, and solutions to the campus housing community.</p></div>
          <Link href="/2027/exhibitors" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1F443E] px-5 py-3 text-sm font-semibold text-white">Explore exhibitors <ArrowUpRight size={16}/></Link>
        </div>
        {spotlightExhibitors.length>0?<div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">{spotlightExhibitors.slice(0,3).map(exhibitor=><Link key={exhibitor.id} href={`/2027/exhibitors#exhibitor-${exhibitor.id}`} className="group rounded-xl border border-[#E0E8E1] bg-[#FCFDFC] p-5 transition hover:border-[#8AAE9C]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7F0EB] text-[#406953]"><Building2 size={23}/></div><h3 className="mt-4 font-bold text-[#1F443E]">{exhibitor.name}</h3>{exhibitor.category&&<p className="mt-1 text-xs font-medium text-[#547768]">{exhibitor.category}</p>}{exhibitor.description&&<p className="mt-2 line-clamp-2 text-sm text-slate-600">{exhibitor.description}</p>}</Link>)}</div>:
        <div className="flex flex-wrap items-center gap-4 p-6 sm:p-8"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F2EC] text-[#527C68]"><Building2 size={28}/></div><div className="flex-1"><h3 className="font-semibold text-[#1F443E]">Exhibitor announcements coming soon</h3><p className="mt-1 text-sm text-slate-600">Confirmed participating organizations and their booth information will appear here once approved.</p></div></div>}
      </section>
      <section aria-label="2027 speakers" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DAE6E0] bg-white p-6 sm:p-7"><div className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2ED] text-[#4D746D]"><Mic2 size={23}/></span><div><h2 className="font-serif text-xl font-semibold text-[#1F443E]">Meet the 2027 speakers</h2><p className="mt-1 text-sm text-slate-600">Speaker profiles and presentation details will be added as the program is confirmed.</p></div></div><Link href="/2027/speakers" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#A8C4B6] px-4 py-2 text-sm font-semibold text-[#1F443E] hover:bg-[#EDF3F0]">Explore speakers <ArrowUpRight size={16}/></Link></section>
      {announcements.length>0&&<section className="rounded-2xl border border-[#BCD2C8] bg-[#EDF3F0] p-6"><h2 className="font-serif text-2xl text-[#1F443E]">Conference updates</h2><div className="mt-4 space-y-4">{announcements.map(item=><article key={String(item.id)}><h3 className="font-semibold text-[#1F443E]">{String(item.title)}</h3><p className="mt-1 whitespace-pre-line text-sm text-slate-700">{String(item.body)}</p></article>)}</div></section>}
      <section aria-label="Community and networking" className="grid gap-4 rounded-3xl border border-[#D3E2DB] bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
  <div><p className="text-xs font-bold uppercase tracking-widest text-[#4D746D]">Meet your people</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#1F443E]">Conversations beyond the sessions.</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Join message boards, arrange informal meetups, ask colleagues questions, and build your network. Create a profile and choose whether to appear in the attendee directory.</p></div>
  <Link href="/2027/community" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F443E] px-5 py-3 text-sm font-semibold text-white"><MessageSquare size={17}/> Explore community <ArrowUpRight size={16}/></Link>
</section>
<ScheduleExplorer items={showPublished?published:officialOutline} source={showPublished?"live":"outline"}/>
      <section className="grid gap-7 rounded-3xl bg-[#E6EEEA] p-6 sm:grid-cols-2 sm:p-10">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#4D746D]">Beyond the sessions</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#1F443E]">Make Vancouver yours.</h2><p className="mt-4 text-sm leading-relaxed text-[#38564E]">Explore the venue, local neighborhoods, and travel resources. More recommendations will be added as the Local Arrangements Committee confirms them.</p><a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#1F443E] underline underline-offset-4">Official conference information <ExternalLink size={15}/></a></div>
        <div className="grid grid-cols-2 gap-3">{[{title:"Venue",subtitle:"Hotel & meeting spaces",Icon:MapPin},{title:"Explore",subtitle:"Vancouver city guide",Icon:Compass},{title:"Community",subtitle:"Boards & opt-in directory",Icon:Users},{title:"Access",subtitle:"Attendee accessibility",Icon:Accessibility}].map(item=><div key={item.title} className="rounded-xl border border-[#D1DED6] bg-white/80 p-4"><item.Icon size={22} className="text-[#4D746D]"/><h3 className="mt-3 font-semibold text-[#1F443E]">{item.title}</h3><p className="mt-1 text-xs text-slate-600">{item.subtitle}</p></div>)}</div>
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DCE6E0] pt-7 text-sm text-slate-600"><p>NWACUHO Conference Companion · 2027 Vancouver</p><a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1F443E]">NWACUHO official website <ArrowUpRight size={15}/></a></footer>
    </div>
  </div>;
}
