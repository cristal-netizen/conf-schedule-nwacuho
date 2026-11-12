import Link from "next/link";
import {ArrowLeft,ArrowUpRight,Building2,ExternalLink,MapPin,PanelsTopLeft,ScanEye,Hotel,Info} from "lucide-react";

const hotelOverview="https://www.marriott.com/en-us/hotels/yvrws-sheraton-vancouver-wall-centre/overview/";
const hotelEvents="https://www.marriott.com/en-us/hotels/yvrws-sheraton-vancouver-wall-centre/events/";
const hotelVirtualTour="https://visitingmedia.com/tt8/?ttid=sheraton-vancouver-wall-centre";

export const metadata={
  title:"Venue & Floor Plans | NWACUHO 2027",
  description:"Explore Sheraton Vancouver Wall Centre floor plans, event rooms and 360-degree virtual hotel tour for NWACUHO 2027."
};

export default function VenuePage(){
 return <div className="min-h-screen bg-[#F7F8F5]">
  <div className="mx-auto max-w-6xl space-y-7 px-5 pb-16 pt-8 sm:pt-12">
   <Link href="/2027" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E] hover:underline"><ArrowLeft size={16}/> Back to conference</Link>
   <header className="relative overflow-hidden rounded-3xl bg-[#1F443E] px-6 py-9 text-white sm:px-10 sm:py-12">
    <div className="absolute right-0 top-0 h-full w-1/2 opacity-25" style={{background:"radial-gradient(circle at top right,#9DC7B5,transparent 70%)"}}/>
    <div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#C0E0D3]">NWACUHO 2027 · Vancouver</p><h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Conference venue & maps</h1>
     <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#E4F0EB]">Explore Sheraton Vancouver Wall Centre before you arrive. Browse the hotel’s floor plans and take a virtual tour of its meeting rooms.</p>
     <div className="mt-6 flex items-center gap-2 text-sm text-[#E4F0EB]"><MapPin size={18}/> Sheraton Vancouver Wall Centre · Vancouver, BC</div>
    </div>
   </header>
   <section className="grid gap-4 md:grid-cols-2" aria-label="Venue planning resources">
    <article className="rounded-2xl border border-[#DAE4DE] bg-white p-6 shadow-sm">
     <div className="inline-flex rounded-xl bg-[#E8F2ED] p-3 text-[#1F443E]"><PanelsTopLeft size={25}/></div>
     <h2 className="mt-5 font-serif text-2xl font-semibold text-[#1F443E]">Venue floor plans</h2>
     <p className="mt-3 text-sm leading-relaxed text-slate-600">The hotel's official floor plans and room-capacity chart are available on Marriott's Events page. Marriott blocks direct floor-plan image loading from our app.</p>
     <a href={hotelEvents} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F443E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#315B52]">Explore floor plans <ExternalLink size={16}/></a>
    </article>
    <article className="rounded-2xl border border-[#DAE4DE] bg-white p-6 shadow-sm">
     <div className="inline-flex rounded-xl bg-[#E8F2ED] p-3 text-[#1F443E]"><ScanEye size={25}/></div>
     <h2 className="mt-5 font-serif text-2xl font-semibold text-[#1F443E]">360° virtual tour</h2>
     <p className="mt-3 text-sm leading-relaxed text-slate-600">Explore the hotel and its meeting facilities right here in the conference app. The interactive tour is below.</p>
     <a href="#virtual-tour" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F443E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#315B52]">Explore virtual tour <ArrowUpRight size={16}/></a>
    </article>
   </section>
   <section id="virtual-tour" aria-labelledby="virtual-tour-heading" className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#DAE4DE] bg-white shadow-sm">
     <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
       <div><p className="text-xs font-semibold uppercase tracking-wider text-[#4D746D]">Explore before you arrive</p><h2 id="virtual-tour-heading" className="mt-1 font-serif text-2xl font-semibold text-[#1F443E]">Interactive 360° hotel tour</h2><p className="mt-2 text-sm text-slate-600">Explore the spaces using the tour controls. If your browser blocks the embedded viewer, open it directly.</p></div>
       <a href={hotelVirtualTour} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#D5DFDC] px-3 py-2.5 text-sm font-semibold text-[#1F443E]">Open full-screen tour <ExternalLink size={15}/></a>
     </div>
     <div className="bg-[#E6EEEA]" style={{height:"min(72vh,720px)",minHeight:420}}>
       <iframe src={hotelVirtualTour} title="Sheraton Vancouver Wall Centre 360-degree hotel tour" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking" allowFullScreen className="h-full w-full border-0"/>
     </div>
     <p className="border-t border-[#DCE6E0] px-5 py-3 text-xs text-slate-600">Tour provided by the hotel through Visiting Media. Some mobile browsers may require opening it directly.</p>
   </section>
   <section className="rounded-2xl border border-[#DCE6E0] bg-[#E7EFEB] p-6 sm:p-8">
    <div className="flex items-start gap-3"><Building2 size={24} className="shrink-0 text-[#2D5A4B]"/><div><h2 className="text-xl font-semibold text-[#1F443E]">Hotel information</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#38564E]">Find the hotel overview, guest amenities and transportation information directly from Marriott. For any NWACUHO group rate or conference-specific booking instructions, use the official conference registration information rather than assuming Marriott's general rates apply.</p>
     <div className="mt-4 flex flex-wrap gap-4"><a className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E] underline underline-offset-4" href={hotelOverview} target="_blank" rel="noopener noreferrer"><Hotel size={16}/> Sheraton hotel overview <ArrowUpRight size={16}/></a><a className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F443E] underline underline-offset-4" href="https://nwacuho.org/page/AnnualConference" target="_blank" rel="noopener noreferrer">NWACUHO conference information <ArrowUpRight size={16}/></a></div>
    </div></div>
   </section>
   <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"><Info size={16} className="mt-0.5 shrink-0"/> Hotel-provided floor plans and virtual tours are general venue resources. Specific room assignments for NWACUHO 2027 will appear in the conference schedule after they are approved.</p>
  </div>
 </div>;
}
