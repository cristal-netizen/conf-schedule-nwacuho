"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {CalendarDays,MessageSquare,Users,Settings} from "lucide-react";

const legacy=[
 {href:"/2026",label:"2026 Schedule"},
 {href:"/info",label:"Info"},
 {href:"/speakers",label:"Speakers"},
 {href:"/venue",label:"Venue"},
 {href:"/accessibility",label:"Accessibility"}
];
const modern=[
 {href:"/2027",label:"2027 Home",Icon:CalendarDays},
 {href:"/2027/community",label:"Message Boards",Icon:MessageSquare},
 {href:"/2027/community/connect",label:"Networking",Icon:Users}
];

export default function ConferenceNavigation(){
 const path=usePathname();
 const isLegacy=path.startsWith("/2026")||["/info","/speakers","/venue","/accessibility"].includes(path);
 const is2027=!isLegacy;
 return <header className="w-full border-b border-[#DDE8E1] bg-white/95 backdrop-blur-sm">
  <nav aria-label="Conference navigation" className="mx-auto max-w-6xl space-y-3 px-4 py-3">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <Link href="/2027" className="font-bold tracking-wide text-[#1F443E]">NWACUHO <span className="font-normal text-slate-500">Conference Companion</span></Link>
    <div role="group" aria-label="Choose a conference year" className="flex rounded-xl border border-[#CADBD2] bg-[#F3F7F5] p-1 text-sm font-semibold">
     <Link href="/2026" aria-current={!is2027?"page":undefined} className={`rounded-lg px-3 py-2 ${!is2027?"bg-[#1F443E] text-white":"text-[#365C4E] hover:bg-white"}`}>2026 · Seattle (archive)</Link>
     <Link href="/2027" aria-current={is2027?"page":undefined} className={`rounded-lg px-3 py-2 ${is2027?"bg-[#1F443E] text-white":"text-[#365C4E] hover:bg-white"}`}>2027 · Vancouver</Link>
    </div>
   </div>
   <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
    {is2027?<>{modern.map(({href,label,Icon})=><Link key={href} href={href} aria-current={path===href?"page":undefined} className={`inline-flex items-center gap-1.5 py-1 hover:text-[#2E6B57] ${path===href?"font-bold text-[#1F443E]":"text-slate-600"}`}><Icon size={15}/>{label}</Link>)}<Link href="/admin" className="ml-auto inline-flex items-center gap-1.5 py-1 text-xs text-slate-500 hover:text-[#1F443E]"><Settings size={13}/> Committee</Link></>:legacy.map(({href,label})=><Link key={href} href={href} aria-current={path===href?"page":undefined} className={`py-1 hover:text-[#2E6B57] ${path===href?"font-bold text-[#1F443E]":"text-slate-600"}`}>{label}</Link>)}
   </div>
  </nav>
 </header>;
}
