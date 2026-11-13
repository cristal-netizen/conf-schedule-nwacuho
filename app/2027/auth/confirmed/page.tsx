"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {CheckCircle2,AlertCircle,MailCheck} from "lucide-react";

const AUTH_KEY="nwacuho-2027-attendee-auth-v1";
const api=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export default function ConfirmationPage(){
 const [status,setStatus]=useState<"checking"|"success"|"error">("checking");
 const [detail,setDetail]=useState("Checking your email confirmation…");
 useEffect(()=>{
  let active=true;
  async function handle(){
   const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
   // Confirmation URLs can carry access tokens in URL fragments. Never keep them in browser history.
   window.history.replaceState(null,"",window.location.pathname);
   if(hash.get("error")){
    if(active){setStatus("error");setDetail(hash.get("error_description")||"The confirmation link has expired or is invalid. Request a new confirmation email from the sign-in page.");}
    return;
   }
   const access=hash.get("access_token"),refresh=hash.get("refresh_token"),expires=Number(hash.get("expires_in")||3600);
   if(!access||!refresh){
    if(active){setStatus("success");setDetail("Your confirmation link has opened the conference app. If your email was confirmed, sign in with the password you created.");}
    return;
   }
   if(!api||!publishableKey){
    if(active){setStatus("error");setDetail("Account verification is temporarily unavailable. Return to the app and sign in.");}
    return;
   }
   try{
    const response=await fetch(api+"/auth/v1/user",{headers:{apikey:publishableKey,Authorization:"Bearer "+access},cache:"no-store"});
    if(!response.ok)throw Error("Unable to validate the confirmed session.");
    const user=await response.json() as {id?:string;email?:string};
    if(!user.id||!user.email)throw Error("Account details were missing.");
    localStorage.setItem(AUTH_KEY,JSON.stringify({access_token:access,refresh_token:refresh,expires_at:Math.floor(Date.now()/1000)+Math.max(1,expires),user:{id:user.id,email:user.email}}));
    if(active){setStatus("success");setDetail("Your email is confirmed and you're signed in. Your conference agenda and Community can now sync to this account.");}
   }catch{
    if(active){setStatus("error");setDetail("We couldn't finish signing in automatically. Your email may still be confirmed. Return to the app and sign in with your email and password.");}
   }
  }
  void handle();
  return()=>{active=false;};
 },[]);
 return <main className="min-h-screen bg-[#F7F8F5] px-5 py-16">
  <section className="mx-auto max-w-xl rounded-2xl border border-[#D9E5DE] bg-white p-8 shadow-sm">
   <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF2ED] text-[#1F443E]">{status==="success"?<CheckCircle2 size={29}/>:status==="error"?<AlertCircle size={29}/>:<MailCheck size={29}/>}</div>
   <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-[#527C68]">NWACUHO 2027</p>
   <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1F443E]">{status==="checking"?"Confirming email":status==="success"?"You're ready to connect":"Confirmation needs attention"}</h1>
   <p role="status" aria-live="polite" className="mt-4 text-sm leading-relaxed text-slate-700">{detail}</p>
   <div className="mt-7 flex flex-wrap gap-3"><Link href="/2027" className="rounded-lg bg-[#1F443E] px-4 py-2.5 text-sm font-semibold text-white">Go to My Agenda</Link><Link href="/2027/community" className="rounded-lg border border-[#BCD0C3] px-4 py-2.5 text-sm font-semibold text-[#1F443E]">Community sign-in</Link></div>
   {status==="error"&&<p className="mt-5 text-xs text-slate-600">If you already clicked a link that opened localhost, your email may have been confirmed despite the browser error. Try signing in before requesting another email.</p>}
  </section>
 </main>;
}
