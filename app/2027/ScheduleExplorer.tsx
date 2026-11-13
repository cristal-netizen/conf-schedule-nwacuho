"use client";

import {useEffect,useMemo,useState} from "react";
import {CalendarDays,Search,Star,Clock3,SlidersHorizontal,Download,Upload,AlertTriangle,CheckCircle2,Cloud,CloudOff,LogIn,LogOut,RefreshCw} from "lucide-react";
import {useAgendaSync} from "./useAgendaSync";
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
  const agenda=useAgendaSync(items.map(item=>item.id));
  const {saved,loaded,session,status,message,setMessage,authBusy,toggle,signIn,signUp,resendConfirmation,signOut,importItems,mergeGuest,retry}=agenda;
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [authMode,setAuthMode]=useState<"sign-in"|"sign-up">("sign-in");
  const [showAccount,setShowAccount]=useState(false);
  async function submitAuth(e:React.FormEvent){
    e.preventDefault();
    const ok=authMode==="sign-in"?await signIn(email,password):await signUp(email,password);
    setPassword("");
    if(ok)setShowAccount(false);
  }
  function exportAgenda(){
    if(!loaded)return;
    const chosen=items.filter(item=>saved.includes(item.id)).map(({id,day,start,end,title,category})=>({id,day,start,end,title,category}));
    const payload=JSON.stringify({format:"nwacuho-2027-agenda",version:1,exportedAt:new Date().toISOString(),items:chosen},null,2);
    const blob=new Blob([payload],{type:"application/json"});
    const link=document.createElement("a");
    const objectUrl=URL.createObjectURL(blob);
    link.href=objectUrl;link.download="nwacuho-2027-my-agenda.json";
    document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    setMessage("Agenda backup downloaded. Keep it as an additional recovery option.");
  }
  async function importAgenda(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      if(file.size>100000)throw new Error("Backup too large.");
      const value=JSON.parse(await file.text());
      if(value?.format!=="nwacuho-2027-agenda"||value?.version!==1||!Array.isArray(value.items))throw new Error("Not an NWACUHO agenda backup.");
      const ids:string[]=value.items.map((item:unknown)=>typeof item==="object"&&item!==null&&"id" in item?(item as {id:string}).id:null).filter((id:unknown):id is string=>typeof id==="string");
      importItems(ids);
    }catch{setMessage("Unable to restore this backup. Check the file and try again.");}
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
      <div className="mt-4 rounded-xl border border-[#D1DED6] bg-[#F8FBF9] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            {status==="synced"?<Cloud size={20} className="mt-0.5 text-[#2F7156]"/>:status==="offline"||status==="error"?<CloudOff size={20} className="mt-0.5 text-amber-700"/>:<Cloud size={20} className="mt-0.5 text-[#4D746D]"/>}
            <div><p className="text-sm font-semibold text-[#1F443E]">{session?`Signed in: ${session.user.email}`:"Guest agenda"}</p>
            <p className="mt-0.5 text-xs text-slate-600">{status==="synced"?"Saved to your account":status==="syncing"?"Syncing to your account…":status==="offline"?"Not yet synced. Changes remain queued on this device.":status==="error"?"Saving needs attention":session?"Account connection ready":"Saved on this device only"}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {session?<><button type="button" onClick={()=>void retry()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D9D1] px-3 py-2 text-xs font-semibold text-[#1F443E]"><RefreshCw size={14}/> Retry sync</button><button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D9D1] px-3 py-2 text-xs font-semibold text-[#1F443E]"><LogOut size={14}/> Sign out</button></>:<button type="button" onClick={()=>setShowAccount(!showAccount)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F443E] px-3 py-2 text-xs font-semibold text-white"><LogIn size={14}/> {showAccount?"Hide sign-in":"Sign in / Create account"}</button>}
          </div>
        </div>
        {message&&<p role="status" aria-live="polite" className={`mt-3 rounded-lg p-2 text-xs ${status==="error"||status==="offline"?"bg-amber-50 text-amber-900":"bg-[#E8F2ED] text-[#284E41]"}`}>{message}</p>}
        {session&&<button type="button" onClick={mergeGuest} className="mt-2 text-xs font-semibold text-[#1F443E] underline underline-offset-2">Import selections previously saved as a guest on this device</button>}
        {!session&&showAccount&&<form onSubmit={submitAuth} className="mt-4 grid gap-3 border-t border-[#D1DED6] pt-4 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-semibold text-[#1F443E]">{authMode==="sign-in"?"Sign in to your saved agenda":"Create an attendee account"}</p>
          <label className="text-xs font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D9D1] bg-white px-3 py-2 text-base"/></label>
          <label className="text-xs font-medium text-slate-700">Password<input required minLength={6} type="password" autoComplete={authMode==="sign-in"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-[#C9D9D1] bg-white px-3 py-2 text-base"/></label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button disabled={authBusy} className="rounded-lg bg-[#1F443E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{authBusy?"Connecting…":authMode==="sign-in"?"Sign in":"Create account"}</button><button type="button" onClick={()=>setAuthMode(authMode==="sign-in"?"sign-up":"sign-in")} className="text-xs font-semibold text-[#1F443E] underline">{authMode==="sign-in"?"Need an account? Sign up":"Already registered? Sign in"}</button><button type="button" disabled={authBusy||!email.trim()} onClick={()=>void resendConfirmation(email)} className="text-xs font-semibold text-[#1F443E] underline disabled:opacity-50">Resend confirmation email</button></div>
          <p className="text-xs leading-relaxed text-slate-600 sm:col-span-2">Accounts sync your approved conference sessions across browsers and devices once online. Email confirmation may be required. Guests can still browse and save locally.</p>
        </form>}
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
      <p className="mt-4 text-xs leading-relaxed text-slate-500">All times are Vancouver local time (Pacific). {source==="outline"?"This is a working planning outline. Times and activities are subject to confirmation against the official NWACUHO website. Individual presentation titles, rooms, and speakers are not yet confirmed.":"Only approved, published attendee sessions are shown."} Guest selections stay in this browser only. Sign in to sync across devices. Offline account changes remain queued locally until you reconnect and sync; export a backup for additional protection.</p>
    </div>
  </section>;
}
