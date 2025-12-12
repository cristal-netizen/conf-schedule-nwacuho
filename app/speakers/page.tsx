import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Speaker = {
  id: string;
  name: string;
  title: string;
  institution: string;
  bio: string;
  trackFocus?: string;
};

const speakers: Speaker[] = [
  {
    id: "sp-1",
    name: "TBD Speaker One",
    title: "Residence Life Professional",
    institution: "NWACUHO Region",
    bio: "Speaker bio coming soon. This presenter brings experience in residence education, student leadership, and community development.",
    trackFocus: "Residence Education & Programming",
  },
  {
    id: "sp-2",
    name: "TBD Speaker Two",
    title: "Housing Operations Leader",
    institution: "NWACUHO Region",
    bio: "Speaker bio coming soon. This presenter focuses on housing operations, assignments, and occupancy management.",
    trackFocus: "Operations & Facilities",
  },
  {
    id: "sp-3",
    name: "TBD Speaker Three",
    title: "Equity & Inclusion Practitioner",
    institution: "NWACUHO Region",
    bio: "Speaker bio coming soon. This presenter centers equity, inclusion, and belonging in their work with students and staff.",
    trackFocus: "Equity, Diversity & Inclusion",
  },
];

export default function SpeakersPage() {
  return (
    <main className="min-h-screen bg-neutral-900/5 py-6 px-3 md:px-6 font-[Calibri,_system-ui,_sans-serif]">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg">
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            Speaker Profiles
          </h1>
          <p className="mt-1 text-sm md:text-base text-white/90">
            Learn more about the presenters sharing their expertise at the
            NWACUHO Annual Conference.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {speakers.map((speaker) => (
            <Card
              key={speaker.id}
              className="border-slate-200/80 shadow-sm bg-white/95"
            >
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {speaker.name}
                </CardTitle>
                <p className="text-xs text-slate-600">
                  {speaker.title} • {speaker.institution}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>{speaker.bio}</p>
                {speaker.trackFocus && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Primary Track: </span>
                    {speaker.trackFocus}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <p className="text-xs text-slate-500 text-center mt-2">
          Final speaker list and bios will be updated as conference programming
          is confirmed.
        </p>
      </div>
    </main>
  );
}
