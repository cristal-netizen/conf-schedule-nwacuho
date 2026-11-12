import Image from "next/image";
import {CalendarDays,MapPin,Ticket,Star,ArrowUpRight,ExternalLink,Compass,Users,Accessibility,MessageSquare} from "lucide-react";
import Link from "next/link";
import ScheduleExplorer from "./ScheduleExplorer";
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
      <div className="mx-auto grid max-w-6xl items-center gap-5 px-5 pb-14 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1fr_340px] lg:gap-6"> <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em]"><span className="h-2 w-2 rounded-full bg-[#C9E7D9]"/> NWACUHO 2027 Annual Conference</span>
        <h1 className="mt-8 max-w-4xl font-serif text-5xl font-semibold leading-[1.08] tracking-tight sm:text-7xl">Good things grow <em className="font-normal text-[#BDDED3]">together.</em></h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#E2EDE8]">Welcome to your Vancouver conference companion, a home for learning, community, and everything in between.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#schedule" className="inline-flex items-center gap-2 rounded-xl bg-[#F1E9DA] px-5 py-3 font-semibold text-[#1F443E] transition hover:bg-white"><CalendarDays size={18}/> Explore schedule</a>
          <a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"><Ticket size={18}/> Registration details <ArrowUpRight size={16}/></a>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#E7F2EC]"><span className="flex items-center gap-2"><CalendarDays size={17}/> February 8–10, 2027</span><span className="flex items-center gap-2"><MapPin size={17}/> Sheraton Vancouver Wall Centre</span><span className="flex items-center gap-2"><Users size={17}/> Northwest housing community</span></div>
      </div><div className="mx-auto flex w-full max-w-[300px] items-center justify-center lg:max-w-[340px]"><Image unoptimized priority src="/branding/nwacuho-2027-badge.svg" alt="NWACUHO 2027 Vancouver conference logo featuring the city skyline, mountains, and maple leaves" width={340} height={263} className="h-auto w-full drop-shadow-xl" /></div></div>
    </section>
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-10 sm:space-y-20 sm:py-16">
      <section aria-label="Conference quick links" className="grid gap-3 md:grid-cols-3">
        <a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><Ticket size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Register for conference</strong><span className="mt-1 block text-sm text-slate-600">Official registration and membership information</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></a>
        <a href={conferenceUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><MapPin size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Hotel & venue</strong><span className="mt-1 block text-sm text-slate-600">Sheraton Vancouver Wall Centre booking details</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></a>
        <a href="#schedule" className="group flex items-start gap-3 rounded-2xl border border-[#E0E8E1] bg-white p-5 shadow-sm hover:border-[#87ADA1]"><span className="rounded-xl bg-[#EDF3F0] p-3 text-[#1F443E]"><Star size={22}/></span><span className="flex-1"><strong className="block text-[#1F443E]">Build My Agenda</strong><span className="mt-1 block text-sm text-slate-600">Save activities privately on this device</span></span><ArrowUpRight size={17} className="text-[#4D746D]"/></a>
      </section>
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
