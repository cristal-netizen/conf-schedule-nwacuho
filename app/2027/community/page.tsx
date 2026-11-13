"use client";

import {FormEvent,useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowLeft,Users,MessageSquare,Flag,Send,ShieldCheck,RefreshCw,UserRound,EyeOff} from "lucide-react";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const apiKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const AUTH_KEY="nwacuho-2027-attendee-auth-v1";
const CONFIRM_URL="https://nwacuho.app/2027/auth/confirmed";
const CONFERENCE_ID="657785cf-4ce8-405c-9a52-24268b9d37d7";
type Auth={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email:string}};
type Profile={user_id:string;display_name:string;institution:string|null;role_title:string|null;interests:string|null;directory_opt_in:boolean};
type Post={id:string;author_id:string;category:string;title:string;body:string;parent_id:string|null;status:string;created_at:string};
type Report={id:string;post_id:string;reporter_id:string;reason:string};
const categories=[{key:"general",name:"General discussion",description:"Conference questions, ideas, and conversations"},{key:"introductions",name:"Introductions",description:"Meet colleagues from across the region"},{key:"meetups",name:"Meetups & connections",description:"Organize coffee chats and group activities"},{key:"rideshare",name:"Travel & ride sharing",description:"Coordinate public meetups and transit plans"},{key:"questions",name:"Ask the community",description:"Share your questions and experience"}];
function parseAuth(raw:unknown):Auth|null {
 if(!raw||typeof raw!=="object")return null;
 const x=raw as Record<string,unknown>,user=x.user as Record<string,unknown>|undefined;
 if(typeof x.access_token!=="string"||typeof x.refresh_token!=="string"||typeof x.expires_at!=="number"||typeof user?.id!=="string"||typeof user.email!=="string")return null;
 return {access_token:x.access_token,refresh_token:x.refresh_token,expires_at:x.expires_at,user:{id:user.id,email:user.email}};
}
function displayDate(date:string){return new Date(date).toLocaleString("en-CA",{timeZone:"America/Vancouver",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}
export default function CommunityPage(){
 const [auth,setAuth]=useState<Auth|null>(null);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [mode,setMode]=useState<"signin"|"signup">("signin");
 const [conferenceId,setConferenceId]=useState("");
 const [profile,setProfile]=useState<Profile|null>(null);
 const [profiles,setProfiles]=useState<Profile[]>([]);
 const [posts,setPosts]=useState<Post[]>([]);
 const [reports,setReports]=useState<Report[]>([]);
 const [moderator,setModerator]=useState(false);
 const [tab,setTab]=useState<"boards"|"directory">("boards");
 const [category,setCategory]=useState("general");
 const [selected,setSelected]=useState<string|null>(null);
 const [title,setTitle]=useState("");
 const [body,setBody]=useState("");
 const [reply,setReply]=useState("");
 const [name,setName]=useState("");
 const [institution,setInstitution]=useState("");
 const [roleTitle,setRoleTitle]=useState("");
 const [interests,setInterests]=useState("");
 const [optIn,setOptIn]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 const [search,setSearch]=useState("");
 const request=useCallback(async(path:string,session:Auth|null,init?:RequestInit)=>{
  if(!url||!apiKey)throw new Error("Community service is not configured.");
  const response=await fetch(url+path,{...init,headers:{"apikey":apiKey,"Content-Type":"application/json",...(session?{"Authorization":"Bearer "+session.access_token}:{}),...(init?.headers||{})},cache:"no-store"});
  const value=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(value?.message||value?.error_description||value?.msg||value?.error||"Could not complete request.");
  return value;
 },[]);
 const ensureAuth=useCallback(async(current:Auth):Promise<Auth>=>{
  if(current.expires_at>Date.now()/1000+90)return current;
  const data=await request("/auth/v1/token?grant_type=refresh_token",null,{method:"POST",body:JSON.stringify({refresh_token:current.refresh_token})});
  const result=parseAuth({...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)});
  if(!result)throw new Error("Session expired. Please sign in again.");
  localStorage.setItem(AUTH_KEY,JSON.stringify(result));setAuth(result);
  return result;
 },[request]);
 const load=useCallback(async(session:Auth)=>{
  const s=await ensureAuth(session);
  const id=CONFERENCE_ID;
  setConferenceId(id);
  const [mine,allPosts,directory,memberships]=await Promise.all([
   request("/rest/v1/community_profiles?user_id=eq."+encodeURIComponent(s.user.id)+"&select=user_id,display_name,institution,role_title,interests,directory_opt_in&limit=1",s),
   request("/rest/v1/community_posts?conference_id=eq."+id+"&select=id,author_id,category,title,body,parent_id,status,created_at&order=created_at.desc&limit=300",s),
   request("/rest/v1/community_profiles?conference_id=eq."+id+"&directory_opt_in=eq.true&select=user_id,display_name,institution,role_title,interests,directory_opt_in&order=display_name.asc&limit=200",s),
   request("/rest/v1/conference_memberships?conference_id=eq."+id+"&user_id=eq."+encodeURIComponent(s.user.id)+"&select=role",s)
  ]);
  const p=mine?.[0] as Profile|undefined;
  setProfile(p||null);
  if(p){setName(p.display_name);setInstitution(p.institution||"");setRoleTitle(p.role_title||"");setInterests(p.interests||"");setOptIn(p.directory_opt_in);}
  setPosts(Array.isArray(allPosts)?allPosts:[]);
  setProfiles(Array.isArray(directory)?directory:[]);
  const canModerate=Array.isArray(memberships)&&memberships.some((m:{role:string})=>["admin","editor"].includes(m.role));
  setModerator(canModerate);
  if(canModerate){
   const flags=await request("/rest/v1/community_reports?select=id,post_id,reporter_id,reason&order=created_at.desc&limit=100",s);
   setReports(Array.isArray(flags)?flags:[]);
  }else setReports([]);
 },[ensureAuth,request]);
 useEffect(()=>{
  let active=true;
  try{
   const session=parseAuth(JSON.parse(localStorage.getItem(AUTH_KEY)||"null"));
   if(session){setAuth(session);void load(session).catch((e:Error)=>{if(active)setMessage(e.message);}).finally(()=>{if(active)setLoading(false);});}
   else setLoading(false);
  }catch{setLoading(false);}
  return()=>{active=false;};
 },[load]);
 async function submitAuth(e:FormEvent){
  e.preventDefault();setBusy(true);setMessage("");
  try{
   const path=mode==="signin"?"token?grant_type=password":"signup?redirect_to="+encodeURIComponent(CONFIRM_URL);
   const data=await request("/auth/v1/"+path,null,{method:"POST",body:JSON.stringify({email:email.trim(),password})});
   const session=parseAuth({...data,expires_at:Math.floor(Date.now()/1000)+Number(data.expires_in||3600)});
   setPassword("");
   if(session){
    localStorage.setItem(AUTH_KEY,JSON.stringify(session));setAuth(session);await load(session);
    setMessage("Signed in to the NWACUHO community.");
   }else setMessage("Check your email for confirmation, then sign in.");
  }catch(e){setMessage(e instanceof Error?e.message:"Sign-in failed.");}
  finally{setBusy(false);}
 }
 async function resendConfirmation(){
  if(!email.trim()){setMessage("Enter your email address to resend confirmation.");return;}
  setBusy(true);setMessage("");
  try{await request("/auth/v1/resend?redirect_to="+encodeURIComponent(CONFIRM_URL),null,{method:"POST",body:JSON.stringify({type:"signup",email:email.trim()})});setMessage("If this account is awaiting confirmation, a fresh email has been sent. Open the newest link.");}
  catch(e){setMessage(e instanceof Error?e.message:"Could not resend email.");}
  finally{setBusy(false);}
 }
 async function saveProfile(e:FormEvent){
  e.preventDefault();if(!auth||!conferenceId)return;
  setBusy(true);setMessage("");
  try{
   const session=await ensureAuth(auth);
   const payload={user_id:session.user.id,conference_id:conferenceId,display_name:name.trim(),institution:institution.trim()||null,role_title:roleTitle.trim()||null,interests:interests.trim()||null,directory_opt_in:optIn};
   await request("/rest/v1/community_profiles?on_conflict=user_id",session,{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});
   await load(session);setMessage(optIn?"Profile saved. You appear in the opt-in attendee directory.":"Profile saved. You are not listed in the attendee directory.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not save profile.");}
  finally{setBusy(false);}
 }
 async function createPost(e:FormEvent){
  e.preventDefault();if(!auth||!profile)return;
  setBusy(true);setMessage("");
  try{
   const session=await ensureAuth(auth);
   await request("/rest/v1/community_posts",session,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({conference_id:conferenceId,author_id:session.user.id,category,title:title.trim(),body:body.trim(),status:"visible"})});
   setTitle("");setBody("");await load(session);setMessage("Discussion posted.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not post discussion.");}
  finally{setBusy(false);}
 }
 async function createReply(e:FormEvent){
  e.preventDefault();if(!auth||!profile||!currentThread)return;
  setBusy(true);setMessage("");
  try{
   const session=await ensureAuth(auth);
   await request("/rest/v1/community_posts",session,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({conference_id:conferenceId,author_id:session.user.id,category:currentThread.category,parent_id:currentThread.id,title:"",body:reply.trim(),status:"visible"})});
   setReply("");await load(session);setMessage("Reply posted.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not post reply.");}
  finally{setBusy(false);}
 }
 async function reportPost(postId:string){
  if(!auth)return;
  const reason=window.prompt("Report reason: spam, harassment, privacy, or other","spam");
  if(!reason)return;
  if(!["spam","harassment","privacy","other"].includes(reason)){setMessage("Choose spam, harassment, privacy or other.");return;}
  setBusy(true);
  try{
   const s=await ensureAuth(auth);
   await request("/rest/v1/community_reports",s,{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({post_id:postId,reporter_id:s.user.id,reason})});
   setMessage("Report submitted to conference moderators.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not submit report.");}
  finally{setBusy(false);}
 }
 async function hidePost(post:Post){
  if(!auth||!moderator)return;
  setBusy(true);
  try{
   const s=await ensureAuth(auth);
   await request("/rest/v1/community_posts?id=eq."+post.id,s,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:post.status==="hidden"?"visible":"hidden"})});
   await load(s);setMessage(post.status==="hidden"?"Post restored.":"Post hidden from community members.");
  }catch(e){setMessage(e instanceof Error?e.message:"Moderation failed.");}
  finally{setBusy(false);}
 }
 function signOut(){try{localStorage.removeItem(AUTH_KEY);}catch{}setAuth(null);setProfile(null);setPosts([]);setProfiles([]);setReports([]);setMessage("Signed out.");}
 const currentThread=posts.find(p=>p.id===selected&&p.parent_id===null);
 const replies=posts.filter(p=>p.parent_id===selected);
 const threads=posts.filter(p=>p.parent_id===null&&p.category===category&&(moderator||p.status==="visible")&&(!search.trim()||p.title.toLowerCase().includes(search.toLowerCase())||p.body.toLowerCase().includes(search.toLowerCase())));
 const displayName=(id:string)=>id===auth?.user.id?profile?.display_name||"You":profiles.find(p=>p.user_id===id)?.display_name||"Community member";
 return <main className="min-h-screen bg-[#F7F8F5]"><div className="mx-auto max-w-6xl space-y-7 px-4 py-9">
  <Link href="/2027" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E]"><ArrowLeft size={16}/> Back to conference</Link>
  <div className="rounded-2xl bg-[#1F443E] p-7 text-white sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#B8DCD0]">NWACUHO 2027 · Vancouver</p><h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Community & connections</h1><p className="mt-3 max-w-2xl text-sm text-[#E1EBE6]">Meet housing colleagues, ask questions, and arrange conversations. Profiles are private unless you choose to join the attendee directory.</p></div>
  <section className="grid gap-4 rounded-2xl border border-[#D1DED6] bg-[#E6EEEA] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-xs font-bold uppercase tracking-widest text-[#4D746D]">Networking opportunities</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#1F443E]">Find mentors, colleagues & meetups</h2><p className="mt-2 max-w-xl text-sm text-[#38564E]">Explore first-time attendee connections, functional-area networks, and informal Vancouver gatherings. Participation is optional.</p></div><Link href="/2027/community/connect" className="inline-flex items-center justify-center rounded-xl bg-[#1F443E] px-4 py-3 text-sm font-semibold text-white">Explore networking</Link></section>
  {message&&<p role="status" aria-live="polite" className="rounded-xl border bg-white p-3 text-sm text-[#1F443E]">{message}</p>}
  {loading?<p className="rounded-xl bg-white p-6">Loading community…</p>:!auth?
   <section className="max-w-lg rounded-2xl border bg-white p-6"><h2 className="text-2xl font-semibold text-[#1F443E]">Sign in to participate</h2><p className="mt-2 text-sm text-slate-600">Use the same attendee account you use for My Agenda. Guest browsing is available on the conference homepage, but community discussions require sign-in.</p>
    <form onSubmit={submitAuth} className="mt-5 space-y-3">
     <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" className="mt-1 w-full rounded-lg border p-3 text-base" value={email} onChange={e=>setEmail(e.target.value)}/></label>
     <label className="block text-sm font-medium">Password<input required minLength={6} type="password" autoComplete={mode==="signin"?"current-password":"new-password"} className="mt-1 w-full rounded-lg border p-3 text-base" value={password} onChange={e=>setPassword(e.target.value)}/></label>
     <div className="flex flex-wrap items-center gap-3"><button disabled={busy} className="rounded-lg bg-[#1F443E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy?"Connecting…":mode==="signin"?"Sign in":"Create account"}</button><button type="button" onClick={()=>setMode(mode==="signin"?"signup":"signin")} className="text-sm font-medium text-[#1F443E] underline">{mode==="signin"?"Create an account":"Already have an account?"}</button><button type="button" disabled={busy} onClick={()=>void resendConfirmation()} className="text-sm font-medium text-[#1F443E] underline disabled:opacity-50">Resend confirmation email</button></div>
    </form>
   </section>:
   <>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Signed in as <strong>{auth.user.email}</strong></p><button onClick={signOut} className="rounded-lg border bg-white px-3 py-2 text-sm">Sign out</button></div>
    <div className="flex gap-2" role="tablist" aria-label="Community sections"><button role="tab" aria-selected={tab==="boards"} onClick={()=>setTab("boards")} className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${tab==="boards"?"bg-[#1F443E] text-white":"border bg-white text-[#1F443E]"}`}><MessageSquare size={16} className="mr-1 inline"/> Message boards</button><button role="tab" aria-selected={tab==="directory"} onClick={()=>setTab("directory")} className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${tab==="directory"?"bg-[#1F443E] text-white":"border bg-white text-[#1F443E]"}`}><Users size={16} className="mr-1 inline"/> Networking</button></div>
    {!profile&&<p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Create a community profile below before posting. Directory visibility is optional.</p>}
    {tab==="directory"?<div className="grid gap-5 lg:grid-cols-[330px_1fr]">
     <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold text-[#1F443E]">Your networking profile</h2><p className="mt-1 text-xs text-slate-600">Only you can see your profile until you opt into the directory.</p>
      <form className="mt-4 space-y-3" onSubmit={saveProfile}>
       <label className="block text-sm font-medium">Display name<input required minLength={2} maxLength={80} className="mt-1 w-full rounded-lg border p-2.5 text-base" value={name} onChange={e=>setName(e.target.value)}/></label>
       <label className="block text-sm font-medium">Institution (optional)<input maxLength={120} className="mt-1 w-full rounded-lg border p-2.5 text-base" value={institution} onChange={e=>setInstitution(e.target.value)}/></label>
       <label className="block text-sm font-medium">Role (optional)<input maxLength={120} className="mt-1 w-full rounded-lg border p-2.5 text-base" value={roleTitle} onChange={e=>setRoleTitle(e.target.value)}/></label>
       <label className="block text-sm font-medium">Professional interests (optional)<textarea rows={3} maxLength={400} className="mt-1 w-full rounded-lg border p-2.5 text-base" value={interests} onChange={e=>setInterests(e.target.value)}/></label>
       <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={optIn} onChange={e=>setOptIn(e.target.checked)} className="mt-1"/> <span>Show my profile to signed-in attendees in the networking directory. I can turn this off later.</span></label>
       <button disabled={busy} className="rounded-lg bg-[#1F443E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save profile</button>
      </form>
     </section>
     <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-semibold text-[#1F443E]">Attendee directory</h2><p className="mt-1 text-sm text-slate-600">Only attendees who chose to be listed appear here. No email addresses are published.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{profiles.map(p=><article key={p.user_id} className="rounded-xl border border-[#D7E3DD] p-4"><UserRound className="text-[#4D746D]" size={22}/><h3 className="mt-2 font-semibold text-[#1F443E]">{p.display_name}</h3>{p.role_title&&<p className="text-sm text-slate-700">{p.role_title}</p>}{p.institution&&<p className="text-xs text-slate-500">{p.institution}</p>}{p.interests&&<p className="mt-2 text-xs text-slate-600">Interests: {p.interests}</p>}</article>)}{profiles.length===0&&<p className="text-sm text-slate-500">No one has opted into the directory yet.</p>}</div>
     </section>
    </div>:<div className="grid gap-5 lg:grid-cols-[245px_1fr]">
     <aside className="space-y-2">{categories.map(c=><button key={c.key} onClick={()=>{setCategory(c.key);setSelected(null);}} className={`block w-full rounded-xl border px-4 py-3 text-left ${category===c.key?"border-[#1F443E] bg-[#E4EEE9]":"bg-white"}`}><strong className="block text-sm text-[#1F443E]">{c.name}</strong><span className="mt-1 block text-xs text-slate-600">{c.description}</span></button>)}</aside>
     <div className="space-y-4">
      {!profile&&<section className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-700">Create your profile in the Networking tab to join the conversation.</p><button onClick={()=>setTab("directory")} className="mt-2 text-sm font-semibold text-[#1F443E] underline">Create profile</button></section>}
      {selected&&currentThread?<section className="space-y-3 rounded-2xl border bg-white p-5">
       <button className="text-sm font-semibold text-[#1F443E] underline" onClick={()=>setSelected(null)}>All discussions</button><h2 className="text-2xl font-semibold text-[#1F443E]">{currentThread.title}</h2><p className="text-xs text-slate-500">By {displayName(currentThread.author_id)} · {displayDate(currentThread.created_at)}</p><p className="whitespace-pre-wrap text-sm text-slate-800">{currentThread.status==="hidden"?"This discussion was hidden by moderators.":currentThread.body}</p>
       {auth.user.id!==currentThread.author_id&&currentThread.status==="visible"&&<button onClick={()=>void reportPost(currentThread.id)} className="flex items-center gap-1 text-xs text-slate-600"><Flag size={13}/> Report</button>}
       <h3 className="border-t pt-4 font-semibold">Replies ({replies.length})</h3>{replies.map(p=><article key={p.id} className="rounded-lg border bg-[#F8FAF8] p-3"><p className="text-xs text-slate-500">{displayName(p.author_id)} · {displayDate(p.created_at)}</p><p className="mt-2 whitespace-pre-wrap text-sm">{p.status==="hidden"?"Reply hidden by moderators.":p.body}</p><div className="mt-2 flex gap-3">{auth.user.id!==p.author_id&&p.status==="visible"&&<button onClick={()=>void reportPost(p.id)} className="text-xs underline">Report</button>}{moderator&&<button onClick={()=>void hidePost(p)} className="text-xs underline">{p.status==="hidden"?"Restore":"Hide"}</button>}</div></article>)}
       {profile&&currentThread.status==="visible"&&<form onSubmit={createReply} className="space-y-2"><label className="block text-sm font-medium">Write a reply<textarea required rows={3} maxLength={3000} value={reply} onChange={e=>setReply(e.target.value)} className="mt-1 w-full rounded-lg border p-3 text-base"/></label><button disabled={busy||!reply.trim()} className="flex items-center gap-2 rounded-lg bg-[#1F443E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send size={14}/> Reply</button></form>}
      </section>:<>
       <section className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-[#1F443E]">{categories.find(c=>c.key===category)?.name}</h2><p className="text-xs text-slate-600">Share respectfully. Do not post personal contact details, room numbers, or sensitive information.</p></div><button onClick={()=>{if(auth)void load(auth).catch((e:Error)=>setMessage(e.message));}} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"><RefreshCw size={14}/> Refresh</button></div>
        {profile&&<form onSubmit={createPost} className="mt-4 space-y-3"><input required maxLength={140} minLength={3} placeholder="Start a discussion…" className="w-full rounded-lg border p-3 text-base" value={title} onChange={e=>setTitle(e.target.value)}/><textarea required maxLength={3000} rows={3} placeholder="Your message" className="w-full rounded-lg border p-3 text-base" value={body} onChange={e=>setBody(e.target.value)}/><button disabled={busy||!title.trim()||!body.trim()} className="flex items-center gap-2 rounded-lg bg-[#1F443E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send size={15}/> Post discussion</button></form>}
       </section>
       <label className="block rounded-xl border bg-white px-3 py-2 text-sm">Search conversations<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles and posts" className="ml-3 w-2/3 bg-transparent text-base outline-none"/></label>
       {threads.map(p=><article key={p.id} className="rounded-xl border bg-white p-4"><button className="block w-full text-left" onClick={()=>setSelected(p.id)}><h3 className="font-semibold text-[#1F443E]">{p.title}</h3><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-slate-700">{p.status==="hidden"?"Hidden by moderator":p.body}</p><p className="mt-2 text-xs text-slate-500">{displayName(p.author_id)} · {displayDate(p.created_at)} · {posts.filter(x=>x.parent_id===p.id).length} replies</p></button><div className="mt-2 flex flex-wrap gap-3">{moderator&&<button onClick={()=>void hidePost(p)} className="flex items-center gap-1 text-xs text-[#8F4A42]"><EyeOff size={13}/>{p.status==="hidden"?"Restore":"Hide discussion"}</button>}{auth.user.id!==p.author_id&&p.status==="visible"&&<button onClick={()=>void reportPost(p.id)} className="flex items-center gap-1 text-xs text-slate-600"><Flag size={13}/> Report</button>}</div></article>)}{threads.length===0&&<div className="rounded-xl border bg-white p-6 text-sm text-slate-600">No conversations here yet. Start the first one!</div>}
      </>}
      {moderator&&<section className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="flex items-center gap-2 font-semibold text-amber-900"><ShieldCheck size={18}/> Moderator queue</h3><p className="mt-1 text-xs text-amber-800">{reports.length} reports submitted. Use Hide on a flagged discussion or reply to remove it from attendee view.</p>{reports.slice(0,25).map(flag=><p key={flag.id} className="mt-2 text-xs text-amber-900">{flag.reason}: {posts.find(p=>p.id===flag.post_id)?.title||"Reply"} · <button className="underline" onClick={()=>{const root=posts.find(p=>p.id===flag.post_id);if(root){setCategory(root.category);setSelected(root.parent_id||root.id);}}}>Open</button></p>)}</section>}
     </div>
    </div>}
   </>}
  <p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16}/> Preview community: signed-in participation, opt-in directory, reporting, and moderator controls. No private direct messages yet.</p>
 </div></main>;
}
