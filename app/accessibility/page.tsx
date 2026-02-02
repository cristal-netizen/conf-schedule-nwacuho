// app/accessibility/page.tsx
import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Accessibility</h1>

      {/* Accessibility Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">
          Seattle 2026 Accessibility Guide
        </h2>

        <p className="mb-4">
          NWACUHO values participation in the Association and its events by all
          members. The Seattle 2026 Accessibility Guide provides detailed
          information about accessibility at the conference hotel, conference
          spaces, social event venues, and the surrounding Seattle area.
        </p>

        <p className="mb-4">
          This guide is a living resource and will continue to be updated as
          additional information becomes available.
        </p>

        <Link
          href="/documents/Seattle-2026-Accessibility-Guide.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg border px-5 py-3 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="View the Seattle 2026 Accessibility Guide PDF (opens in a new tab)"
        >
          View the Seattle 2026 Accessibility Guide (PDF)
        </Link>
      </section>

      {/* Sensory Recovery Room */}
      <section aria-labelledby="sensory-recovery-room">
        <h2 id="sensory-recovery-room" className="text-2xl font-semibold mb-3">
          Sensory Recovery Room
        </h2>

        <p className="mb-4">
          A Sensory Recovery Room will be available throughout the conference
          for attendees who may benefit from a quieter, low-stimulation
          environment. This space is intended to support rest, regulation, and
          well-being for individuals who may experience sensory overload,
          anxiety, fatigue, or stress during the conference.
        </p>

        <div className="rounded-xl border p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Details</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Location:</strong> St. Helens
            </li>
            <li>
              <strong>Hours:</strong> 08:00–23:00 (daily)
            </li>
          </ul>
        </div>

        <h3 className="text-lg font-semibold mb-2">About the space</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Open to <strong>all attendees</strong> — no diagnosis or explanation
            required
          </li>
          <li>
            A <strong>judgment-free</strong> space for decompression, grounding,
            or rest
          </li>
          <li>
            Designed with <strong>reduced lighting</strong>,{" "}
            <strong>minimal noise</strong>, and{" "}
            <strong>comfortable seating</strong>
          </li>
          <li>
            Supportive of a range of <strong>sensory</strong>,{" "}
            <strong>cognitive</strong>, and <strong>emotional</strong> needs
          </li>
        </ul>

        <p className="mt-4">
          This space is not intended for meetings, phone calls, or social
          gatherings. Conference staff may periodically check the space to
          ensure it remains welcoming and accessible for all.
        </p>

        <p className="mt-4">
          Attendees are welcome to use the space at any time during open hours,
          for as long or as briefly as needed. No reservation is required.
        </p>
      </section>
    </main>
  );
}
