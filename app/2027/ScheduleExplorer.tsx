"use client";

import {useEffect,useMemo,useState} from "react";
import {CalendarDays,Search,Star,Clock3,SlidersHorizontal,Download,Upload,AlertTriangle,CheckCircle2} from "lucide-react";
import {officialOutline,type ProgramDay,type ProgramItem} from "./officialOutline";

const days:{id:ProgramDay;short:string;label:string}[]=[
 {id:"2027-02-08",short:"Mon 8",label:"Monday, February 8"},
 {id:"2027-02-09",short:"Tue 9",label:"Tuesday, February 9"},
 {id:"2027-02-10",short:"Wed 10",label:"Wednesday, February 10"}
];
const filters=[["all","All activities"],["program","Education"],["networking","Networking"],["exhibitors","Exhibitors"],["general","General"],["meal","Meals"]] as const;
function time(value:string){const [h,m]=value.split(":").map(Number);return `${(h+11)%12+1}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;}
const STORAGE_KEY="nwacuho-2027-saved-v1";
function readSaved():string[] {
  const value=JSON.parse(window.localStorage.getItem(STORAGE_KEY)||"[]");
  if(!Array.isArray(value))throw new Error("Saved agenda has an unexpected format.");
  return [...new Set(value.filter((id):id is string=>typeof id==="string"))];
}
function writeSaved(items:string[]) {
  window.localStorage.setItem(STORAGE_KEY,JSON.stringify(items));
  if(window.localStorage.getItem(STORAGE_KEY)!==JSON.stringify(items))throw new Error("Storage did not confirm the change.");
}
const categoryName:Record<ProgramItem["category"],string>={program:"Education",networking:"Networking",exhibitors:"Exhibitors",general:"General",meal:"Meals"};

export default function ScheduleExplorer({items=officialOutline,source="outline"}:{items?:ProgramItem[];source?:"outline"|"live"}) {
  const [day,setDay]=useState<ProgramDay>("2027-02-08");
  const [category,setCategory]=useState("all");
  const [query,setQuery]=useState("");
  const [saved,setSaved]=useState<string[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [saveStatus,setSaveStatus]=useState<"loading"|"ready"|"error">("loading");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    function reload(){
      try{setSaved(readSaved());setSaveStatus("ready");setMessage("");}
      catch{setSaveStatus("error");setMessage("This browser cannot access your saved agenda. Changes will not be saved until storage is available. You can still browse the program.");}
      setLoaded(true);
    }
    reload();
    const onStorage=(event:StorageEvent)=>{if(event.key===STORAGE_KEY||event.key===null)reload();};
    window.addEventListener("storage",onStorage);
    window.addEventListener("pageshow",reload);
    return ()=>{window.removeEventListener("storage",onStorage);window.removeEventListener("pageshow",reload);};
  },[]);
  function toggle(id:string){
    if(!loaded){setMessage("Your agenda is still loading. Please try again.");return;}
    try{
      const current=readSaved();
      const next=current.includes(id)?current.filter(value=>value!==id):[...current,id];
      writeSaved(next);
      setSaved(next);
      setSaveStatus("ready");
      setMessage(next.includes(id)?"Saved to My Agenda on this device.":"Removed from My Agenda.");
    }catch{
      setSaveStatus("error");
      setMessage("Unable to save on this device. Your selection was not changed. Check Safari settings or use Export Agenda if you already have saved activities.");
    }
  }
  function exportAgenda(){
    if(!loaded)return;
    const chosen=items.filter(item=>saved.includes(item.id)).map(({id,day,start,end,title,category})=>({id,day,start,end,title,category}));
    const payload=JSON.stringify({format:"nwacuho-2027-agenda",version:1,exportedAt:new Date().toISOString(),items:chosen},null,2);
    const blob=new Blob([payload],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="nwacuho-2027-my-agenda.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage("Agenda backup downloaded. Keep this file if you change devices or clear browser data.");
  }
  async function importAgenda(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      if(file.size>100000)throw new Error("File is too large.");
      const value=JSON.parse(await file.text());
      if(value?.format!=="nwacuho-2027-agenda"||value?.version!==1||!Array.isArray(value.items))throw new Error("Not a valid 2027 agenda backup.");
      const valid=new Set(items.map(item=>item.id));
      const requested:(string|null)[]=value.items.map((item:unknown):string|null=>typeof item==="object"&&item!==null&&"id" in item&&typeof (item as {id:unknown}).id==="string"?(item as {id:string}).id:null);
      const ids=[...new Set(requested.filter((id:string|null):id is string=>typeof id==="string"&&valid.has(id)))];
      const next=[...new Set([...readSaved(),...ids])];
      writeSaved(next);
      setSaved(next);
      setSaveStatus("ready");
      setMessage(`Restored ${ids.length} matching activities to My Agenda on this device. Existing saved items were kept.`);
    }catch{setSaveStatus("error");setMessage("Could not restore the backup. Check that it is a NWACUHO 2027 agenda export and storage is enabled.");}
    finally{event.target.value="";}
  }
  const [onlySaved,setOnlySaved]=useState(false);
  const visible=useMemo(()=>items.filter(x=>x.day===day&&(category==="all"||x.category===category)&&(!onlySaved||saved.includes(x.id))&&(!query.trim()||x.title.toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title)),[items,day,category,query,onlySaved,saved]);
  return <section id="schedule" className="scroll-mt-20 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4D746D]">Explore the program</p><h2 className="mt-1 font-serif text-3xl font-semibold text-[#1F443E]">Find your next great conversation.</h2></div>
      <div className="flex items-center gap-2 rounded-full bg-[#EDF3F0] px-3 py-1.5 text-xs font-semibold text-[#1F443E]"><CalendarDays size={14}/>{source==="outline"?"Preliminary planning outline":"Published sessions"}</div>
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
      <div aria-live="polite" role="status" className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${saveStatus==="error"?"bg-amber-50 text-amber-900":"bg-[#F1F7F3] text-[#31564A]"}`}>
        {saveStatus==="error"?<AlertTriangle size={16} className="shrink-0"/>:<CheckCircle2 size={16} className="shrink-0"/>}
        <span>{message||(loaded?"Agenda storage is available on this device. Your saved selections remain here unless its browser data is cleared.":"Checking browser storage…")}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={exportAgenda} disabled={!loaded||saved.length===0} className="inline-flex items-center gap-2 rounded-lg border border-[#D5DFDC] px-3 py-2 text-xs font-semibold text-[#1F443E] disabled:opacity-50"><Download size={15}/> Export agenda backup</button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#D5DFDC] px-3 py-2 text-xs font-semibold text-[#1F443E]"><Upload size={15}/> Restore backup<input aria-label="Select a saved NWACUHO agenda backup" type="file" accept=".json,application/json" className="sr-only" onChange={importAgenda}/></label>
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
          <button title={saved.includes(item.id)?"Remove from saved":"Save to My Agenda"} aria-label={saved.includes(item.id)?`Remove ${item.title} from saved`:`Save ${item.title}`} aria-pressed={saved.includes(item.id)} disabled={!loaded} onClick={()=>toggle(item.id)} className="h-9 w-9 shrink-0 rounded-full border border-[#D5DFDC] text-[#4D746D] hover:bg-[#EDF3F0]"><Star size={17} className="mx-auto" fill={saved.includes(item.id)?"#4D746D":"none"}/></button>
        </article>)}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">All times are Vancouver local time (Pacific). {source==="outline"?"This is a working planning outline. Times and activities are subject to confirmation against the official NWACUHO website. Individual presentation titles, rooms, and speakers are not yet confirmed.":"Only approved, published attendee sessions are shown."} Saved items are stored in this browser, not synchronized across devices or Safari home-screen installations. Export a backup before switching devices or clearing website data.</p>
    </div>
  </section>;
}
