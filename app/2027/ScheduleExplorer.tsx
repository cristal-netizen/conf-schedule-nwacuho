"use client";

import {useEffect,useMemo,useState} from "react";
import {CalendarDays,Search,Star,Clock3,SlidersHorizontal,MapPin} from "lucide-react";
import {officialOutline,type ProgramDay,type ProgramItem} from "./officialOutline";

const days:{id:ProgramDay;short:string;label:string}[]=[
 {id:"2027-02-08",short:"Mon 8",label:"Monday, February 8"},
 {id:"2027-02-09",short:"Tue 9",label:"Tuesday, February 9"},
 {id:"2027-02-10",short:"Wed 10",label:"Wednesday, February 10"}
];
const filters=[["all","All activities"],["program","Education"],["networking","Networking"],["exhibitors","Exhibitors"],["general","General"],["meal","Meals"]] as const;
function time(value:string){const [h,m]=value.split(":").map(Number);return `${(h+11)%12+1}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;}
const categoryName:Record<ProgramItem["category"],string>={program:"Education",networking:"Networking",exhibitors:"Exhibitors",general:"General",meal:"Meals"};

export default function ScheduleExplorer({items=officialOutline,source="outline"}:{items?:ProgramItem[];source?:"outline"|"live"}) {
  const [day,setDay]=useState<ProgramDay>("2027-02-08");
  const [category,setCategory]=useState("all");
  const [query,setQuery]=useState("");
  const [saved,setSaved]=useState<string[]>([]);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem("nwacuho-2027-saved-v1")||"[]");if(Array.isArray(value))setSaved(value.filter(x=>typeof x==="string"));}catch{}setLoaded(true);},[]);
  function toggle(id:string){setSaved(previous=>{const next=previous.includes(id)?previous.filter(x=>x!==id):[...previous,id];try{localStorage.setItem("nwacuho-2027-saved-v1",JSON.stringify(next));}catch{}return next;});}
  const [onlySaved,setOnlySaved]=useState(false);
  const visible=useMemo(()=>items.filter(x=>x.day===day&&(category==="all"||x.category===category)&&(!onlySaved||saved.includes(x.id))&&(!query.trim()||x.title.toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title)),[items,day,category,query,onlySaved,saved]);
  return <section id="schedule" className="scroll-mt-20 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4D746D]">Explore the program</p><h2 className="mt-1 font-serif text-3xl font-semibold text-[#1F443E]">Find your next great conversation.</h2></div>
      <div className="flex items-center gap-2 rounded-full bg-[#EDF3F0] px-3 py-1.5 text-xs font-semibold text-[#1F443E]"><CalendarDays size={14}/>{source==="outline"?"Official preliminary outline":"Published sessions"}</div>
    </div>
    <div className="rounded-2xl border border-[#D7E4E0] bg-white p-4 shadow-sm sm:p-6">
      <div role="tablist" aria-label="Conference day" className="grid grid-cols-3 gap-2 rounded-xl bg-[#F1F5F3] p-1.5">
        {days.map(d=><button key={d.id} type="button" role="tab" aria-selected={day===d.id} onClick={()=>setDay(d.id)} className={`rounded-lg px-2 py-3 text-sm font-semibold transition ${day===d.id?"bg-[#1F443E] text-white shadow-sm":"text-[#3A5750] hover:bg-white"}`}>{d.short}</button>)}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#D5DFDC] px-3 py-2.5"><Search size={18} className="shrink-0 text-[#4D746D]"/><span className="sr-only">Search activities</span><input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Search activities and topics" value={query} onChange={e=>setQuery(e.target.value)}/></label>
        <label className="flex items-center gap-2 rounded-xl border border-[#D5DFDC] px-3 py-2.5 text-sm text-slate-700"><SlidersHorizontal size={17} className="text-[#4D746D]"/><span className="sr-only">Filter by category</span><select className="w-full bg-transparent outline-none" value={category} onChange={e=>setCategory(e.target.value)}>{filters.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#1F443E]">{days.find(d=>d.id===day)?.label} <span className="ml-1 font-normal text-slate-500">· {visible.length} activities</span></p>
        <button type="button" aria-pressed={onlySaved} onClick={()=>setOnlySaved(!onlySaved)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${onlySaved?"border-[#1F443E] bg-[#E7F0EC] text-[#1F443E]":"border-[#D5DFDC] text-slate-600"}`}><Star size={14} fill={onlySaved?"currentColor":"none"}/> My saved ({loaded?saved.length:0})</button>
      </div>
      <div className="mt-4 space-y-2">
        {visible.length===0&&<div className="rounded-xl bg-[#F6F8F7] p-8 text-center text-sm text-slate-600">No matching activities. Try another day or clear the filters.</div>}
        {visible.map(item=><article key={item.id} className="group flex gap-3 rounded-xl border border-[#E5EBE8] bg-white p-3 transition hover:border-[#A8C4BA] sm:gap-5 sm:p-4">
          <div className="w-[84px] shrink-0 pt-0.5 text-xs font-semibold text-[#8F6B53] sm:w-[112px]"><Clock3 size={15} className="mb-1"/>{time(item.start)}<span className="mt-1 block font-normal text-slate-500">to {time(item.end)}</span></div>
          <div className="min-w-0 flex-1 border-l-2 border-[#81A99C] pl-3 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#4D746D]">{categoryName[item.category]}</span>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-[#1F443E] sm:text-base">{item.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{source==="outline"?"Details and room assignment to be confirmed":"Conference schedule"}</p>
          </div>
          <button title={saved.includes(item.id)?"Remove from saved":"Save to My Agenda"} aria-label={saved.includes(item.id)?`Remove ${item.title} from saved`:`Save ${item.title}`} aria-pressed={saved.includes(item.id)} onClick={()=>toggle(item.id)} className="h-9 w-9 shrink-0 rounded-full border border-[#D5DFDC] text-[#4D746D] hover:bg-[#EDF3F0]"><Star size={17} className="mx-auto" fill={saved.includes(item.id)?"#4D746D":"none"}/></button>
        </article>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">All times are Vancouver local time (Pacific). {source==="outline"?"This is the preliminary schedule published by NWACUHO and may change. Individual presentation titles, room assignments, and speakers are not yet confirmed.":"Only approved, published attendee sessions are shown."} Saved items are stored on this device, not synchronized across devices.</p>
    </div>
  </section>;
}
