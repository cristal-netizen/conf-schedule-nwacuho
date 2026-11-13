"use client";
import {useMemo,useState} from "react";
import {Search,UserRound,CalendarDays,Building2,X} from "lucide-react";
import type {PublicSpeaker} from "./publicDirectory";

function safePhoto(value:string|null){if(!value)return null;try{const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.toString():null;}catch{return null;}}
function dateLabel(value:string|null){if(!value)return null;const date=new Date(value);if(Number.isNaN(date.getTime()))return null;return date.toLocaleString("en-CA",{timeZone:"America/Vancouver",weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
export default function SpeakerDirectory({speakers}:{speakers:PublicSpeaker[]}){
 const [query,setQuery]=useState("");
 const filtered=useMemo(()=>speakers.filter(s=>!query||[s.display_name,s.title,s.organization,s.biography,...s.sessions.map(x=>x.title)].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())),[query,speakers]);
 return <section aria-labelledby="speaker-list-heading" className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="speaker-list-heading" className="font-serif text-2xl font-semibold text-[#1F443E]">2027 speaker directory</h2><p className="text-sm text-slate-600">{speakers.length?`${filtered.length} of ${speakers.length} speakers`:"Speaker announcements coming soon"}</p></div>
  {speakers.length>0&&<label className="relative block rounded-xl border border-[#D8E5DE] bg-white p-3"><span className="sr-only">Search speakers</span><Search size={19} className="pointer-events-none absolute left-6 top-6 text-[#537565]"/><input type="search" placeholder="Search speakers, institutions, or topics…" className="w-full rounded-lg border border-[#D8E5DE] py-2.5 pl-10 pr-4 text-base" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery("")} className="absolute right-7 top-6 text-[#4D746D]"><X size={17}/></button>}</label>}
  {filtered.length>0?<div className="grid gap-5 md:grid-cols-2">{filtered.map(s=>{
    const img=safePhoto(s.photo_url);
    return <article key={s.id} id={`speaker-${s.id}`} className="scroll-mt-28 rounded-2xl border border-[#D9E5DE] bg-white p-5 shadow-sm sm:p-6">
     <div className="flex items-start gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#EAF3EE]">{img?
      // eslint-disable-next-line @next/next/no-img-element
      <img src={img} alt={s.display_name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover"/>:<UserRound size={35} className="text-[#628E77]"/>}</div><div className="min-w-0"><h3 className="text-xl font-bold text-[#1F443E]">{s.display_name}</h3>{s.title&&<p className="mt-1 text-sm font-medium text-slate-700">{s.title}</p>}{s.organization&&<p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><Building2 size={14}/>{s.organization}</p>}</div></div>
     {s.biography&&<p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{s.biography}</p>}
     {s.sessions.length>0&&<div className="mt-5 border-t border-[#E6ECE8] pt-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#436B58]"><CalendarDays size={16}/> Conference sessions</p><ul className="mt-2 space-y-2">{s.sessions.map((session,i)=><li key={i} className="text-sm text-slate-700">{session.title}{dateLabel(session.starts_at)&&<span className="block text-xs text-slate-500">{dateLabel(session.starts_at)} PST</span>}</li>)}</ul></div>}
    </article>;
   })}</div>:<div className="rounded-2xl border border-dashed border-[#B9CFC3] bg-white px-6 py-12 text-center"><UserRound size={36} className="mx-auto text-[#779F8B]"/><h3 className="mt-4 font-serif text-xl font-semibold text-[#1F443E]">{speakers.length?"No speakers match your search":"Meet your 2027 presenters"}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{speakers.length?"Try another name, institution or topic.":"Speaker biographies, photos, and approved presentation details will appear here as the conference program is confirmed."}</p></div>}
 </section>;
}
