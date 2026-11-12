"use client";
import {useCallback,useEffect,useRef,useState} from "react";

const GUEST_KEY="nwacuho-2027-saved-v1";
const AUTH_KEY="nwacuho-2027-attendee-auth-v1";
const QUEUE_PREFIX="nwacuho-2027-pending-v1:";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type Account={id:string;email:string};
type Session={access_token:string;refresh_token:string;expires_at:number;user:Account};
type Pending=Record<string,boolean>;
type CloudRow={item_key:string;is_saved:boolean};

function storedList():string[]{
 const result=JSON.parse(localStorage.getItem(GUEST_KEY)||"[]");
 if(!Array.isArray(result))throw new Error("Saved agenda has an unexpected format.");
 return [...new Set(result.filter((v:unknown):v is string=>typeof v==="string"))];
}
function saveGuest(ids:string[]){
 const serialized=JSON.stringify(ids);
 localStorage.setItem(GUEST_KEY,serialized);
 if(localStorage.getItem(GUEST_KEY)!==serialized)throw new Error("Guest storage did not save.");
}
function readPending(id:string):Pending{
 const data=JSON.parse(localStorage.getItem(QUEUE_PREFIX+id)||"{}");
 if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("Offline queue is unreadable.");
 return Object.fromEntries(Object.entries(data).filter(([k,v])=>k.length<=160&&typeof v==="boolean")) as Pending;
}
function savePending(id:string,items:Pending){
 const serialized=JSON.stringify(items);
 localStorage.setItem(QUEUE_PREFIX+id,serialized);
 if(localStorage.getItem(QUEUE_PREFIX+id)!==serialized)throw new Error("Offline changes could not be saved.");
}
function parseSession(value:unknown):Session|null{
 if(!value||typeof value!=="object")return null;
 const x=value as Record<string,unknown>,u=x.user as Record<string,unknown>|undefined;
 if(typeof x.access_token!=="string"||typeof x.refresh_token!=="string"||typeof x.expires_at!=="number"||typeof u?.id!=="string"||typeof u.email!=="string")return null;
 return {access_token:x.access_token,refresh_token:x.refresh_token,expires_at:x.expires_at,user:{id:u.id,email:u.email}};
}
function authHeaders(token?:string):HeadersInit {
 return {apikey:publicKey||"", "Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})};
}
async function authCall(path:string,body:unknown){
 if(!url||!publicKey)throw new Error("Account syncing is not configured.");
 const response=await fetch(url+"/auth/v1/"+path,{method:"POST",headers:authHeaders(),body:JSON.stringify(body),cache:"no-store"});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error_description||data.msg||data.message||data.error||"Authentication failed.");
 return data;
}
function authToSession(result:Record<string,unknown>):Session|null{
 const u=result.user as Record<string,unknown>|undefined;
 if(typeof result.access_token!=="string"||typeof result.refresh_token!=="string"||typeof u?.id!=="string"||typeof u.email!=="string")return null;
 return {access_token:result.access_token,refresh_token:result.refresh_token,expires_at:Math.floor(Date.now()/1000)+Number(result.expires_in||3600),user:{id:u.id,email:u.email}};
}
async function request(path:string,session:Session,init?:RequestInit){
 if(!url||!publicKey)throw new Error("Cloud syncing is not configured.");
 const response=await fetch(url+"/rest/v1/"+path,{...init,headers:{...authHeaders(session.access_token),...(init?.headers||{})},cache:"no-store"});
 if(!response.ok){
  const data=await response.json().catch(()=>({}));
  throw new Error(data.message||`Cloud request failed (${response.status}).`);
 }
 if(response.status===204)return null;
 return response.json().catch(()=>null);
}
export function useAgendaSync(validIds:string[]){
 const [saved,setSaved]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [session,setSession]=useState<Session|null>(null);
 const [status,setStatus]=useState<"loading"|"device"|"syncing"|"synced"|"offline"|"error">("loading");
 const [message,setMessage]=useState("");
 const [authBusy,setAuthBusy]=useState(false);
 const activeRef=useRef<Session|null>(null);
 const savedRef=useRef<string[]>([]);
 const remoteRef=useRef<string[]>([]);
 const inFlight=useRef(false);
 const authRevision=useRef(0);
 const setSavedNow=useCallback((ids:string[])=>{savedRef.current=ids;setSaved(ids);},[]);
 const setAccount=useCallback((s:Session|null)=>{
  activeRef.current=s;setSession(s);
  if(s){
   try{localStorage.setItem(AUTH_KEY,JSON.stringify(s));}
   catch{setMessage("This browser may not remember your sign-in. Your cloud agenda will still be available when you sign in again.");}
  }else{try{localStorage.removeItem(AUTH_KEY);}catch{}}
 },[]);
 const refresh=useCallback(async(s:Session)=>{
  if(s.expires_at>Date.now()/1000+90)return s;
  const result=await authCall("token?grant_type=refresh_token",{refresh_token:s.refresh_token});
  const next=authToSession(result);
  if(!next)throw new Error("Session expired. Please sign in again to sync.");
  if(activeRef.current?.user.id===s.user.id)setAccount(next);
  return next;
 },[setAccount]);
 const sync=useCallback(async()=>{
  const original=activeRef.current;
  if(!original||inFlight.current)return;
  if(typeof navigator!=="undefined"&&!navigator.onLine){setStatus("offline");setMessage("Offline: changes are queued on this device and will sync after reconnecting.");return;}
  inFlight.current=true;
  setStatus("syncing");
  const revision=authRevision.current;
  try{
   const current=await refresh(original);
   if(revision!==authRevision.current)return;
   const rows=await request(`attendee_agenda_items?user_id=eq.${encodeURIComponent(current.user.id)}&conference_year=eq.2027&select=item_key,is_saved&limit=2000`,current) as CloudRow[];
   const cloud=(Array.isArray(rows)?rows:[]).filter(row=>row.is_saved).map(row=>row.item_key);
   remoteRef.current=cloud;
   const pending=readPending(current.user.id);
   const union=new Set(cloud);
   for(const [id,add] of Object.entries(pending))add?union.add(id):union.delete(id);
   if(revision!==authRevision.current)return;
   setSavedNow([...union]);
   for(const [id,add] of Object.entries(pending)){
    if(revision!==authRevision.current)return;
    await request("attendee_agenda_items?on_conflict=user_id,conference_year,item_key",current,{
     method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
     body:JSON.stringify({user_id:current.user.id,conference_year:2027,item_key:id,is_saved:add})
    });
    const latest=readPending(current.user.id);
    if(latest[id]===add){delete latest[id];savePending(current.user.id,latest);}
    if(add)remoteRef.current=[...new Set([...remoteRef.current,id])];
    else remoteRef.current=remoteRef.current.filter(x=>x!==id);
   }
   if(revision===authRevision.current){
    const remaining=readPending(current.user.id);
    setStatus(Object.keys(remaining).length?"offline":"synced");
    setMessage(Object.keys(remaining).length?"Some changes remain queued. Tap Retry sync.":"Your agenda is securely synced to your account.");
   }
  }catch(e){
   if(revision===authRevision.current){
    setStatus("offline");
    setMessage((e instanceof Error?e.message:"Cloud sync unavailable.")+" Saved changes remain queued on this device. Retry when connected.");
   }
  }finally{inFlight.current=false;}
 },[refresh,setSavedNow]);
 const syncRef=useRef(sync);
 useEffect(()=>{syncRef.current=sync;},[sync]);
 useEffect(()=>{
  try{setSavedNow(storedList());setStatus("device");}
  catch{setStatus("error");setMessage("Browser storage is unavailable. Sign in when possible to use cloud agenda saving.");}
  let raw:unknown=null;
  try{raw=JSON.parse(localStorage.getItem(AUTH_KEY)||"null");}catch{}
  const old=parseSession(raw);
  if(old){
   activeRef.current=old;setSession(old);setStatus("syncing");
   void syncRef.current();
  }
  setLoaded(true);
  const onOnline=()=>{if(activeRef.current)void syncRef.current();};
  const onStorage=(event:StorageEvent)=>{
   if(event.key===GUEST_KEY&&!activeRef.current){
    try{setSavedNow(storedList());}catch{}
   }
   if(event.key?.startsWith(QUEUE_PREFIX)&&activeRef.current)void syncRef.current();
  };
  const onPageShow=()=>{if(activeRef.current)void syncRef.current();};
  window.addEventListener("online",onOnline);
  window.addEventListener("storage",onStorage);
  window.addEventListener("pageshow",onPageShow);
  return ()=>{window.removeEventListener("online",onOnline);window.removeEventListener("storage",onStorage);window.removeEventListener("pageshow",onPageShow);};
 },[setSavedNow]);
 function toggle(id:string){
  if(!loaded)return;
  const next=savedRef.current.includes(id)?savedRef.current.filter(x=>x!==id):[...savedRef.current,id];
  const account=activeRef.current;
  try{
   if(account){
    const pending=readPending(account.user.id);
    pending[id]=next.includes(id);
    savePending(account.user.id,pending);
    setSavedNow(next);
    setStatus("syncing");setMessage("Saved on this device. Syncing to your account…");
    void sync();
   }else{
    saveGuest(next);setSavedNow(next);setStatus("device");
    setMessage("Saved on this device only. Sign in to protect your agenda across devices.");
   }
  }catch{setStatus("error");setMessage("Unable to save this change. Your selection was not modified.");}
 }
 async function signIn(email:string,password:string){
  setAuthBusy(true);setMessage("");
  try{
   const result=await authCall("token?grant_type=password",{email:email.trim(),password});
   const next=authToSession(result);
   if(!next)throw new Error("Could not establish attendee session.");
   authRevision.current++;setAccount(next);remoteRef.current=[];setSavedNow([]);
   setStatus("syncing");await sync();
   return true;
  }catch(e){setMessage(e instanceof Error?e.message:"Sign-in failed.");return false;}
  finally{setAuthBusy(false);}
 }
 async function signUp(email:string,password:string){
  setAuthBusy(true);setMessage("");
  try{
   const result=await authCall("signup",{email:email.trim(),password});
   const next=authToSession(result);
   if(next){
    authRevision.current++;setAccount(next);setSavedNow([]);remoteRef.current=[];setStatus("syncing");
    await sync();
    return true;
   }
   setMessage("Account created. Check your email to confirm your address, then sign in to sync your agenda.");
   return false;
  }catch(e){setMessage(e instanceof Error?e.message:"Account creation failed.");return false;}
  finally{setAuthBusy(false);}
 }
 function signOut(){
  authRevision.current++;
  setAccount(null);remoteRef.current=[];
  try{setSavedNow(storedList());setStatus("device");setMessage("Signed out. Guest agenda is stored only on this device.");}
  catch{setSavedNow([]);setStatus("error");setMessage("Signed out; guest storage unavailable.");}
 }
 function importItems(ids:string[]){
  const allowed=new Set(validIds);
  const current=savedRef.current;
  const added=ids.filter(id=>allowed.has(id)&&!current.includes(id));
  if(!added.length)return 0;
  const account=activeRef.current;
  const next=[...new Set([...current,...added])];
  if(account){
   const pending=readPending(account.user.id);
   added.forEach(id=>{pending[id]=true;});
   savePending(account.user.id,pending);
   setSavedNow(next);setStatus("syncing");void sync();
  }else{
   saveGuest(next);setSavedNow(next);setStatus("device");
  }
  setMessage(`Restored ${added.length} activities. ${account?"Syncing to your account.":"Saved on this device."}`);
  return added.length;
 }
 function mergeGuest(){
  try{
   const ids=storedList();
   const count=importItems(ids);
   setMessage(count?`Imported ${count} guest selections. Syncing to your account.`:"No additional guest selections to import.");
  }catch{setMessage("Could not access guest selections on this device.");}
 }
 return {saved,loaded,session,status,message,setMessage,authBusy,toggle,signIn,signUp,signOut,importItems,mergeGuest,retry:sync};
}
