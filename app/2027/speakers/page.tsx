import Link from "next/link";
import {ArrowLeft,ArrowUpRight,CalendarDays,Mic2,Users} from "lucide-react";
import SpeakerDirectory from "../SpeakerDirectory";
import {getPublicSpeakers} from "../publicDirectory";

export const metadata={
 title:"Speakers | NWACUHO 2027",
 description:"Meet the NWACUHO 2027 Vancouver conference speakers and learn about their sessions."
};

export default async function Speakers2027Page(){
 const speakers=await getPublicSpeakers();
 return <main className="min-h-screen bg-[#F7F8F5]"><div className="mx-auto max-w-6xl space-y-8 px-5 pb-16 pt-8 sm:pt-12">
  <Link href="/2027" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E] hover:underline"><ArrowLeft size={16}/> Back to conference</Link>
  <header className="relative overflow-hidden rounded-3xl bg-[#1F443E] p-7 text-white sm:p-10">
   <p className="text-xs font-bold uppercase tracking-[.18em] text-[#C1DFD2]">NWACUHO 2027 · Vancouver</p>
   <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Speakers & presenters</h1>
   <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#E2EEE9] sm:text-base">Get to know the voices and perspectives shaping the conference. Browse speaker profiles and explore sessions as the 2027 program is finalized.</p>
  </header>
  <section className="grid gap-4 sm:grid-cols-2" aria-label="Speaker information">
   <div className="rounded-2xl border border-[#DAE6E0] bg-white p-5"><Mic2 size={23} className="text-[#4D746D]"/><h2 className="mt-3 font-semibold text-[#1F443E]">Learn from peers</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Discover colleagues and presenters sharing their experiences across campus housing and student services.</p></div>
   <div className="rounded-2xl border border-[#DAE6E0] bg-white p-5"><CalendarDays size={23} className="text-[#4D746D]"/><h2 className="mt-3 font-semibold text-[#1F443E]">Build your agenda</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Save sessions that interest you once the educational program is announced.</p><Link href="/2027#schedule" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1F443E] underline">Explore schedule <ArrowUpRight size={15}/></Link></div>
  </section>
  <SpeakerDirectory speakers={speakers}/>
  <p className="flex items-start gap-2 rounded-xl border border-[#D2E1D8] bg-[#EDF3F0] p-5 text-sm leading-relaxed text-[#345B4E]"><Users size={19} className="mt-0.5 shrink-0"/>Only speakers approved for publication appear here. The existing Seattle 2026 speaker directory remains available in the 2026 archive.</p>
 </div></main>;
}
