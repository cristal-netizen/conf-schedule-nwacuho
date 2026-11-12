"use client";

import {FormEvent,useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowLeft,Users,Handshake,MapPin,CalendarDays,UserRound,RefreshCw,ShieldCheck} from "lucide-react";

const endpoint=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const authKey="nwacuho-2027-attendee-auth-v1";
const conferenceId="657785cf-4ce8-405c-9a52-24268b9d37d7";
const AREA_OPTIONS=["Residential Education","Housing Operations","Facilities","Student Services","Assignments & Occupancy","Conference Services","Dining & Food Service","Marketing & Communications","Leadership & Supervision","Assessment & Research","Technology","Graduate Housing"];
type Session={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email:string}};
type Profile={user_id:string;display_name:string;institution:string|null;role_title:string|null;directory_opt_in:boolean};
type Preference={user_id:string;connection_type:"peer"|"mentor"|"mentee"|"both";first_time_attendee:boolean;functional_areas:string[];connection_goals:string};
type Meetup={id:string;organizer_id:string;title:string;details:string;location:string;starts_at:string;status:string};
type Interest={meetup_id:string};
function parseSession(x:unknown):Session|null{
 if(!x||typeof x!=="object")return null;
 const v=x as Record<string,unknown>,u=v.user as Record<string,unknown>|undefined;
 return typeof v.access_token==="string"&&typeof v.refresh_token==="string"&&typeof v.expires_at==="number"&&typeof u?.id==="string"&&typeof u.email==="string"?{access_token:v.access_token,refresh_token:v.refresh_token,expires_at:v.expires_at,user:{id:u.id,email:u.email}}:null;
}
function dateTime(iso:string){return new Date(iso).toLocaleString("en-CA",{timeZone:"America/Vancouver",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
const input="mt-1 w-full rounded-lg border border-[#D5DFDC] bg-white px-3 py-2.5 text-base";
const button="rounded-lg bg-[#1F443E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
export default function ConnectHub(){
 const [session,setSession]=useState<Session|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [own,setOwn]=useState<Profile|null>(null);
 const [profiles,setProfiles]=useState<Profile[]>([]);
 const [preferences,setPreferences]=useState<Preference[]>([]);
 const [connectionType,setConnectionType]=useState<Preference["connection_type"]>("peer");
 const [firstTime,setFirstTime]=useState(false);
 const [areas,setAreas]=useState<string[]>([]);
 const [goals,setGoals]=useState("");
 const [meetups,setMeetups]=useState<Meetup[]>([]);
 const [interests,setInterests]=useState<string[]>([]);
 const [name,setName]=useState("");
 const [details,setDetails]=useState("");
 const [location,setLocation]=useState("");
 const [starts,setStarts]=useState("");
 const [section,setSection]=useState<"mentorship"|"groups"|"meetups">("mentorship");
 const [areaFilter,setAreaFilter]=useState("all");
 const [firstOnly,setFirstOnly]=useState(false);
 const request=useCallback(async(path:string,s:Session,init?:RequestInit)=>{
  if(!endpoint||!key)throw new Error("Networking service is not configured.");
  const r=await fetch(endpoint+"/rest/v1/"+path,{...init,headers:{apikey:key,Authorization:"Bearer "+s.access_token,"Content-Type":"application/json",...(init?.headers||{})},cache:"no-store"});
  if(!r.ok){const v=await r.json().catch(()=>({}));throw new Error(v.message||`Request failed (${r.status}). Please sign in again if your session expired.`);}
  return r.status===204?null:r.json().catch(()=>null);
 },[]);
 const ensureSession=useCallback(async(s:Session)=>{
  if(s.expires_at>Date.now()/1000+90)return s;
  if(!endpoint||!key)throw new Error("Sign-in is not configured.");
  const r=await fetch(endpoint+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:s.refresh_token}),cache:"no-store"});
  const v=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("Sign-in expired. Return to Community to sign in again.");
  const next=parseSession({...v,expires_at:Math.floor(Date.now()/1000)+Number(v.expires_in||3600)});
  if(!next)throw new Error("Could not refresh the session.");
  localStorage.setItem(authKey,JSON.stringify(next));setSession(next);return next;
 },[]);
 const load=useCallback(async(s:Session)=>{
  const valid=await ensureSession(s);
  const [mine,directory,prefs,events,rsvps]=await Promise.all([
   request(`community_profiles?user_id=eq.${valid.user.id}&select=user_id,display_name,institution,role_title,directory_opt_in&limit=1`,valid),
   request(`community_profiles?conference_id=eq.${conferenceId}&directory_opt_in=eq.true&select=user_id,display_name,institution,role_title,directory_opt_in&limit=300`,valid),
   request(`community_networking_preferences?conference_id=eq.${conferenceId}&select=user_id,connection_type,first_time_attendee,functional_areas,connection_goals&limit=300`,valid),
   request(`community_meetups?conference_id=eq.${conferenceId}&select=id,organizer_id,title,details,location,starts_at,status&order=starts_at.asc&limit=100`,valid),
   request(`community_meetup_interests?user_id=eq.${valid.user.id}&select=meetup_id&limit=300`,valid)
  ]);
  const myProfile=Array.isArray(mine)?mine[0] as Profile|undefined:undefined;
  setOwn(myProfile||null);
  setProfiles(Array.isArray(directory)?directory:[]);
  const allPrefs=Array.isArray(prefs)?prefs as Preference[]:[];
  setPreferences(allPrefs);
  const p=allPrefs.find(row=>row.user_id===valid.user.id);
  if(p){setConnectionType(p.connection_type);setFirstTime(p.first_time_attendee);setAreas(p.functional_areas||[]);setGoals(p.connection_goals||"");}
  setMeetups(Array.isArray(events)?events:[]);
  setInterests(Array.isArray(rsvps)?(rsvps as Interest[]).map(x=>x.meetup_id):[]);
 },[ensureSession,request]);
 useEffect(()=>{
  let active=true;
  try{
   const s=parseSession(JSON.parse(localStorage.getItem(authKey)||"null"));
   if(s){setSession(s);void load(s).catch(e=>{if(active)setNotice(e instanceof Error?e.message:"Could not load networking.");}).finally(()=>{if(active)setLoading(false);});}
   else setLoading(false);
  }catch{setLoading(false);}
  return ()=>{active=false;};
 },[load]);
 async function savePreferences(e:FormEvent){
  e.preventDefault();if(!session||!own)return;
  setBusy(true);setNotice("");
  try{
   const s=await ensureSession(session);
   await request("community_networking_preferences?on_conflict=user_id",s,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:s.user.id,conference_id:conferenceId,connection_type:connectionType,first_time_attendee:firstTime,functional_areas:areas,connection_goals:goals.trim(),updated_at:new Date().toISOString()})});
   await load(s);setNotice("Networking preferences saved. Only directory participants can discover these details.");
  }catch(e){setNotice(e instanceof Error?e.message:"Could not save preferences.");}
  finally{setBusy(false);}
 }
 async function createMeetup(e:FormEvent){
  e.preventDefault();if(!session||!own)return;
  setBusy(true);setNotice("");
  try{
   if(!starts||Number.isNaN(new Date(starts+":00-08:00").getTime()))throw new Error("Choose a valid date and time.");
   const s=await ensureSession(session);
   await request("community_meetups",s,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({conference_id:conferenceId,organizer_id:s.user.id,title:name.trim(),details:details.trim(),location:location.trim(),starts_at:new Date(starts+":00-08:00").toISOString(),status:"active"})});
   setName("");setDetails("");setLocation("");setStarts("");await load(s);setNotice("Meetup created. Signed-in attendees can see the location and time.");
  }catch(e){setNotice(e instanceof Error?e.message:"Could not create meetup.");}
  finally{setBusy(false);}
 }
 async function toggleInterest(id:string){
  if(!session)return;
  setBusy(true);setNotice("");
  try{
   const s=await ensureSession(session);
   if(interests.includes(id))await request(`community_meetup_interests?meetup_id=eq.${id}&user_id=eq.${s.user.id}`,s,{method:"DELETE",headers:{Prefer:"return=minimal"}});
   else await request("community_meetup_interests",s,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({meetup_id:id,user_id:s.user.id})});
   await load(s);setNotice(interests.includes(id)?"Removed from your meetups.":"Added to your meetups. Your interest is private.");
  }catch(e){setNotice(e instanceof Error?e.message:"Could not update meetup interest.");}
  finally{setBusy(false);}
 }
 async function cancelMeetup(event:Meetup){
  if(!session||event.organizer_id!==session.user.id)return;
  setBusy(true);
  try{const s=await ensureSession(session);await request(`community_meetups?id=eq.${event.id}`,s,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:"cancelled"})});await load(s);setNotice("Meetup cancelled.");}
  catch(e){setNotice(e instanceof Error?e.message:"Unable to cancel meetup.");}
  finally{setBusy(false);}
 }
 const optInIds=useMemo(()=>new Set(profiles.map(p=>p.user_id)),[profiles]);
 const choices=useMemo(()=>preferences.filter(p=>p.user_id!==session?.user.id&&optInIds.has(p.user_id)&&
    (section!=="mentorship"||p.connection_type!=="peer"||p.first_time_attendee)&&
    (areaFilter==="all"||p.functional_areas?.includes(areaFilter))&&(!firstOnly||p.first_time_attendee)),[preferences,session,section,areaFilter,firstOnly,optInIds]);
 function overlap(pref:Preference){return (pref.functional_areas||[]).filter(a=>areas.includes(a)).length;}
 const matches=[...choices].sort((a,b)=>overlap(b)-overlap(a));
 const profile=(id:string)=>profiles.find(p=>p.user_id===id);
 return <div className="min-h-screen bg-[#F7F8F5]"><div className="mx-auto max-w-6xl space-y-7 px-4 py-9">
  <Link href="/2027/community" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E]"><ArrowLeft size={16}/> Back to Community</Link>
  <div className="rounded-2xl bg-[#1F443E] px-7 py-9 text-white sm:px-10"><p className="text-xs font-bold uppercase tracking-widest text-[#B8DCD0]">NWACUHO 2027</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Find your conference connections.</h1><p className="mt-3 max-w-2xl text-sm text-[#E1EBE6]">Meet mentors and new colleagues, discover functional-area peers, and coordinate informal gatherings in Vancouver.</p></div>
  {notice&&<p role="status" aria-live="polite" className="rounded-xl border bg-white p-4 text-sm">{notice}</p>}
  {loading?<p className="rounded-xl bg-white p-5 text-sm">Loading networking features…</p>:!session?<div className="rounded-xl border bg-white p-6"><p className="font-semibold">Sign in to participate.</p><p className="mt-2 text-sm text-slate-600">Use the same attendee account as My Agenda and Community.</p><Link className="mt-3 inline-block font-semibold text-[#1F443E] underline" href="/2027/community">Go to Community sign-in</Link></div>:<>
   <div className="flex flex-wrap gap-2" role="tablist" aria-label="Networking features">{([{id:"mentorship",name:"Mentorship & first-timers",Icon:Handshake},{id:"groups",name:"Functional-area connections",Icon:Users},{id:"meetups",name:"Meetups",Icon:CalendarDays}] as const).map(t=><button key={t.id} role="tab" aria-selected={section===t.id} onClick={()=>setSection(t.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${section===t.id?"bg-[#1F443E] text-white":"border bg-white text-[#1F443E]"}`}><t.Icon size={16}/>{t.name}</button>)}</div>
   {!own?<div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="font-semibold">Create your community profile first.</p><p className="mt-1 text-sm">Directory participation stays off until you opt in. A profile is required before joining networking activities.</p><Link href="/2027/community" className="mt-3 inline-block text-sm font-semibold text-[#1F443E] underline">Create your profile</Link></div>:<>
    {section!=="meetups"&&<div className="grid gap-5 lg:grid-cols-[340px_1fr]">
     <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold text-[#1F443E]">Your connection preferences</h2><p className="mt-2 text-xs text-slate-600">Only people who opt into the directory are discoverable. Your email address is not displayed.</p>
      <form onSubmit={savePreferences} className="mt-4 space-y-4">
       <label className="block text-sm font-medium">How would you like to connect?<select className={input} value={connectionType} onChange={e=>setConnectionType(e.target.value as Preference["connection_type"])}><option value="peer">Meet professional peers</option><option value="mentor">Offer mentorship</option><option value="mentee">Find a mentor</option><option value="both">Mentor and be mentored</option></select></label>
       <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={firstTime} onChange={e=>setFirstTime(e.target.checked)} className="mt-1"/><span>This is my first NWACUHO conference</span></label>
       <fieldset><legend className="text-sm font-medium">Functional areas (select up to 8)</legend><div className="mt-2 grid gap-2">{AREA_OPTIONS.map(area=><label key={area} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={areas.includes(area)} onChange={e=>setAreas(old=>e.target.checked?old.length<8?[...old,area]:old:old.filter(x=>x!==area))}/>{area}</label>)}</div></fieldset>
       <label className="block text-sm font-medium">What would you like to learn or share?<textarea className={input} rows={3} maxLength={400} value={goals} onChange={e=>setGoals(e.target.value)} placeholder="Professional interests, leadership goals, or conversation topics"/></label>
       <button disabled={busy} className={button}>Save connection preferences</button>
      </form>
     </section>
     <section className="space-y-3 rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold text-[#1F443E]">{section==="mentorship"?"Mentors & new connections":"Colleagues in your field"}</h2><p className="text-sm text-slate-600">Explore opted-in profiles. Common functional areas are shown first. Connections are suggestions, not assigned mentor matches.</p>
      <div className="flex flex-wrap gap-3"><label className="text-xs">Functional area<select className={input} value={areaFilter} onChange={e=>setAreaFilter(e.target.value)}><option value="all">All areas</option>{AREA_OPTIONS.map(a=><option key={a}>{a}</option>)}</select></label><label className="flex items-center gap-2 self-end pb-2 text-xs"><input type="checkbox" checked={firstOnly} onChange={e=>setFirstOnly(e.target.checked)}/> First-time attendees only</label></div>
      {matches.map(p=>{const person=profile(p.user_id);return <article key={p.user_id} className="rounded-xl border border-[#D9E7E0] p-4"><div className="flex items-start gap-3"><UserRound className="mt-1 text-[#4D746D]" size={21}/><div><h3 className="font-semibold text-[#1F443E]">{person?.display_name||"Community member"}</h3><p className="text-xs text-slate-600">{[person?.role_title,person?.institution].filter(Boolean).join(" · ")}</p><div className="mt-2 flex flex-wrap gap-1.5">{p.first_time_attendee&&<span className="rounded-full bg-[#EDF3F0] px-2 py-1 text-xs">First-timer</span>}{p.connection_type!=="peer"&&<span className="rounded-full bg-[#EDF3F0] px-2 py-1 text-xs">{p.connection_type==="mentor"?"Offering mentorship":p.connection_type==="mentee"?"Seeking mentorship":"Open to mentoring"}</span>}{(p.functional_areas||[]).map(a=><span key={a} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{a}</span>)}</div>{p.connection_goals&&<p className="mt-2 text-sm text-slate-700">{p.connection_goals}</p>}</div></div></article>})}
      {matches.length===0&&<p className="rounded-lg bg-[#F7F8F5] p-6 text-sm text-slate-600">No matching opted-in profiles yet. You can start a conversation on the Community message boards.</p>}
      <Link href="/2027/community" className="inline-block text-sm font-semibold text-[#1F443E] underline">Start a conversation in Community</Link>
     </section>
    </div>}
    {section==="meetups"&&<div className="grid gap-5 lg:grid-cols-[340px_1fr]">
     <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold text-[#1F443E]">Plan an informal meetup</h2><p className="mt-2 text-xs text-slate-600">Choose a public meeting point, such as a hotel lobby or café. Do not share room numbers, home addresses, or private contact information.</p>
      <form onSubmit={createMeetup} className="mt-4 space-y-3">
       <label className="block text-sm font-medium">Meetup title<input className={input} required minLength={4} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Coffee for first-time attendees"/></label>
       <label className="block text-sm font-medium">Public meeting point<input className={input} required minLength={3} maxLength={150} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Hotel main lobby"/></label>
       <label className="block text-sm font-medium">Date & time (Vancouver local)<input className={input} type="datetime-local" required min="2027-02-07T00:00" max="2027-02-11T23:59" value={starts} onChange={e=>setStarts(e.target.value)}/></label>
       <label className="block text-sm font-medium">Details<textarea className={input} rows={3} maxLength={600} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Who is this for? What should people expect?"/></label>
       <button disabled={busy} className={button}>Create meetup</button>
      </form>
     </section>
     <section className="space-y-3 rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="text-xl font-semibold text-[#1F443E]">Community meetups</h2><p className="mt-1 text-sm text-slate-600">Mark your interest to remember a meetup. Only you can see your interest list.</p></div><button onClick={()=>session&&void load(session).catch(e=>setNotice(e instanceof Error?e.message:"Refresh failed."))} className="flex items-center gap-1 text-xs font-semibold text-[#1F443E]"><RefreshCw size={14}/> Refresh</button></div>
      {meetups.filter(m=>m.status==="active").map(m=><article key={m.id} className="rounded-xl border border-[#D9E7E0] p-4"><h3 className="font-semibold text-[#1F443E]">{m.title}</h3><p className="mt-1 flex items-center gap-2 text-sm"><CalendarDays size={15}/> {dateTime(m.starts_at)} Pacific</p><p className="mt-1 flex items-center gap-2 text-sm"><MapPin size={15}/> {m.location}</p>{m.details&&<p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{m.details}</p>}<p className="mt-2 text-xs text-slate-500">Organized by {profile(m.organizer_id)?.display_name||(m.organizer_id===session.user.id?own.display_name:"Community member")}</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>void toggleInterest(m.id)} className={interests.includes(m.id)?button:"rounded-lg border border-[#BCD1C8] px-3 py-2 text-sm font-semibold text-[#1F443E]"}>{interests.includes(m.id)?"Interested ✓":"I'm interested"}</button>{m.organizer_id===session.user.id&&<button disabled={busy} onClick={()=>void cancelMeetup(m)} className="rounded-lg border px-3 py-2 text-sm text-[#8F4A42]">Cancel meetup</button>}</div></article>)}
      {!meetups.some(m=>m.status==="active")&&<p className="rounded-lg bg-[#F7F8F5] p-6 text-sm text-slate-600">No meetups yet. Create one to help attendees connect!</p>}
     </section>
    </div>}
   </>}
  </>}
  <p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16}/> Networking profiles require opt-in for discovery. Meetups are visible only to signed-in attendees; personal interest lists are private.</p>
 </div></div>;
}
