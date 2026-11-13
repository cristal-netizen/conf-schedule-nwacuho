"use client";

import {useMemo,useState} from "react";
import {Building2,ExternalLink,MapPin,Search,X} from "lucide-react";
import type {PublicExhibitor} from "./publicDirectory";

function safeUrl(value:string|null):string|null{
 if(!value)return null;
 try{const url=new URL(value);return ["https:","http:"].includes(url.protocol)?url.toString():null;}catch{return null;}
}
export default function ExhibitorDirectory({exhibitors}:{exhibitors:PublicExhibitor[]}){
 const [query,setQuery]=useState(""),[category,setCategory]=useState("All exhibitors");
 const categories=useMemo(()=>["All exhibitors",...new Set(exhibitors.map(e=>e.category).filter((c):c is string=>Boolean(c)))].sort((a,b)=>a==="All exhibitors"?-1:b==="All exhibitors"?1:a.localeCompare(b)),[exhibitors]);
 const filtered=useMemo(()=>exhibitors.filter(e=>(category==="All exhibitors"||e.category===category)&&(!query||[e.name,e.description,e.category,...e.booths.map(b=>b.booth_number)].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase()))),[exhibitors,query,category]);
 return <section className="space-y-5" aria-labelledby="exhibitor-list-heading">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="exhibitor-list-heading" className="font-serif text-2xl font-semibold text-[#1F443E]">Exhibitor directory</h2><span className="text-sm text-slate-600">{exhibitors.length? `${filtered.length} of ${exhibitors.length} exhibitors`:"Exhibitors to be announced"}</span></div>
  {exhibitors.length>0?<div className="flex flex-wrap gap-3 rounded-2xl border border-[#D9E5DE] bg-white p-4">
   <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search exhibitors</span><Search size={17} className="pointer-events-none absolute left-3 top-3 text-[#4D746D]"/><input className="w-full rounded-lg border border-[#D4E0DA] py-2.5 pl-10 pr-10 text-base" placeholder="Search companies, products, booths…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery("")} className="absolute right-3 top-3 text-slate-500"><X size={16}/></button>}</label>
   <label className="min-w-[180px]"><span className="sr-only">Filter exhibitor category</span><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-lg border border-[#D4E0DA] bg-white px-3 py-2.5 text-base">{categories.map(c=><option key={c}>{c}</option>)}</select></label>
  </div>:null}
  {filtered.length>0?<div className="grid gap-4 md:grid-cols-2">{filtered.map(e=>{
   const website=safeUrl(e.website_url),logo=safeUrl(e.logo_url);
   return <article key={e.id} id={`exhibitor-${e.id}`} className="scroll-mt-28 rounded-2xl border border-[#DAE6E0] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2EAE5] bg-[#F6F9F7]">{logo?
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt={`${e.name} logo`} className="h-full w-full object-contain p-1.5" loading="lazy" referrerPolicy="no-referrer"/>:<Building2 size={29} className="text-[#527B6D]"/>}</div><div className="min-w-0"><h3 className="text-lg font-bold leading-snug text-[#1F443E]">{e.name}</h3>{e.category&&<span className="mt-2 inline-block rounded-full bg-[#EAF3EE] px-2.5 py-1 text-xs font-medium text-[#34614D]">{e.category}</span>}</div></div>
    {e.description&&<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{e.description}</p>}
    {e.booths.length>0&&<p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#38594E]"><MapPin size={16}/>{e.booths.map(b=>`Booth ${b.booth_number}${b.location_description?` · ${b.location_description}`:""}`).join(" · ")}</p>}
    {website&&<a href={website} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#A9C5B6] px-4 py-2.5 text-sm font-semibold text-[#1F443E] hover:bg-[#F2F8F4]">Visit exhibitor website <ExternalLink size={15}/></a>}
   </article>;
  })}</div>:<div className="rounded-2xl border border-dashed border-[#B9CFC3] bg-white px-6 py-12 text-center"><Building2 size={34} className="mx-auto text-[#779F8B]"/><h3 className="mt-4 font-serif text-xl font-semibold text-[#1F443E]">{exhibitors.length?"No exhibitors match your search":"Exhibitor announcements are coming soon"}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">{exhibitors.length?"Try another keyword or category.":"As participating organizations are confirmed, this directory will feature company profiles, products and services, and exhibit booth locations."}</p></div>}
 </section>;
}
