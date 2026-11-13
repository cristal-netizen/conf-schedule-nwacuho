import Link from "next/link";
import {ArrowLeft,Building2,CalendarDays,MapPin,Store,ArrowUpRight} from "lucide-react";
import ExhibitorDirectory from "../ExhibitorDirectory";
import {getPublicExhibitors} from "../publicDirectory";

export const metadata={
 title:"Exhibitors | NWACUHO 2027",
 description:"Discover the organizations, products and services featured at the NWACUHO 2027 Vancouver conference exhibit hall."
};

export default async function ExhibitorsPage(){
 const exhibitors=await getPublicExhibitors();
 return <main className="min-h-screen bg-[#F7F8F5]">
 <div className="mx-auto max-w-6xl space-y-8 px-5 pb-16 pt-8 sm:pt-12">
  <Link href="/2027" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E] hover:underline"><ArrowLeft size={16}/> Back to conference</Link>
  <header className="relative overflow-hidden rounded-3xl bg-[#1F443E] p-7 text-white sm:p-10">
   <div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#C2E2D4]">NWACUHO 2027 · Vancouver</p>
    <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Exhibitor showcase</h1>
    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#E2EEE9] sm:text-base">Explore solutions, meet industry partners, and discover organizations supporting the campus housing community. Exhibitor profiles will appear here as they are confirmed.</p>
   </div>
  </header>
  <div className="grid gap-4 sm:grid-cols-3" aria-label="Exhibit hall highlights">
   <div className="rounded-2xl border border-[#D9E5DE] bg-white p-5"><Building2 size={22} className="text-[#4D746D]"/><h2 className="mt-3 font-semibold text-[#1F443E]">Meet exhibitors</h2><p className="mt-2 text-sm text-slate-600">Discover vendors and organizations supporting housing and student life.</p></div>
   <div className="rounded-2xl border border-[#D9E5DE] bg-white p-5"><Store size={22} className="text-[#4D746D]"/><h2 className="mt-3 font-semibold text-[#1F443E]">Explore the hall</h2><p className="mt-2 text-sm text-slate-600">Booth assignments and locations will be posted once finalized.</p></div>
   <div className="rounded-2xl border border-[#D9E5DE] bg-white p-5"><CalendarDays size={22} className="text-[#4D746D]"/><h2 className="mt-3 font-semibold text-[#1F443E]">Plan your visit</h2><p className="mt-2 text-sm text-slate-600">Find exhibitor hall activities in your conference schedule.</p><Link href="/2027#schedule" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1F443E] underline">See schedule <ArrowUpRight size={14}/></Link></div>
  </div>
  <ExhibitorDirectory exhibitors={exhibitors}/>
  <aside className="rounded-xl border border-[#D2E1D8] bg-[#EDF3F0] p-5 text-sm leading-relaxed text-[#345B4E]"><div className="flex items-start gap-3"><MapPin size={20} className="mt-0.5 shrink-0"/>Information about exhibitor booth assignments, hours, and participating organizations will be updated as plans are approved. No unconfirmed organization has been listed as a participating exhibitor.</div></aside>
 </div>
 </main>;
}
