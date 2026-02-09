"use client";

import Link from "next/link";
import { Download, ExternalLink, Info, MapPin, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WIFI_NETWORK = "Westin_CONFERENCE";
const WIFI_PASSWORD = "NWACUHO26";

// Put your PDF in /public and update this path.
// Example: /public/seattle-guide.pdf  -> href="/seattle-guide.pdf"
const SEATTLE_GUIDE_PDF_HREF = "/seattle-guide.pdf";

export default function Page() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: you can swap this for a toast if your app has one.
      alert("Copied!");
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900/5 py-6 px-3 md:px-6 font-[Calibri,_system-ui,_sans-serif]">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {/* Header */}
        <header className="rounded-3xl border border-neutral-900/80 bg-[#28903b] p-5 text-white shadow-lg">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">NWACUHO 2026</p>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl font-['Franklin_Gothic',_Calibri,_system-ui,_sans-serif]">
              Conference Info
            </h1>
            <p className="text-sm text-white/90">
              Wi-Fi access, Seattle guide, and local coffee & breakfast discounts.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/85">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Seattle, WA • The Westin
              </span>

              <Link
                href="/venue"
                className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 hover:bg-white/20"
              >
                View Venue Map <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </header>

        {/* Wi-Fi */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Wi-Fi Access
            </CardTitle>
            <CardDescription className="text-xs">Connect to the conference network.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  Network
                </Badge>
                <span className="font-semibold text-slate-800">{WIFI_NETWORK}</span>

                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 px-3 text-[11px]"
                  onClick={() => copyToClipboard(WIFI_NETWORK)}
                >
                  Copy
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  Password
                </Badge>
                <span className="font-semibold text-slate-800">{WIFI_PASSWORD}</span>

                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 px-3 text-[11px]"
                  onClick={() => copyToClipboard(WIFI_PASSWORD)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-600 flex items-start gap-2">
              <Info className="h-4 w-4 mt-[2px]" />
              If you have trouble connecting, forget the network and re-join, or restart Wi-Fi on your device.
            </p>
          </CardContent>
        </Card>

        {/* Seattle Guide PDF */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Places to Eat & Things to Do</CardTitle>
            <CardDescription className="text-xs">
              Looking for places to eat or visit while you're in town? Checkout the Westin Wanderer!
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 bg-white p-3">
              <div className="text-sm">
                <p className="font-semibold text-slate-800">Seattle Guide (PDF)</p>
                <p className="text-xs text-slate-600">Download and view on your phone.</p>
              </div>

              <div className="flex gap-2">
                <a href={SEATTLE_GUIDE_PDF_HREF} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-[11px]">
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </a>

                <a href={SEATTLE_GUIDE_PDF_HREF} download>
                  <Button variant="default" size="sm" className="h-8 px-3 text-[11px]">
                    Download <Download className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Optional simple embed preview (works in most browsers) */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <iframe
                title="Seattle Guide PDF"
                src={SEATTLE_GUIDE_PDF_HREF}
                className="w-full h-[70vh]"
              />
            </div>
          </CardContent>
        </Card>

      {/* Discounts */}
<Card className="border-slate-200/80 shadow-sm">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm">Local Coffee & Breakfast Discounts</CardTitle>
    <CardDescription className="text-xs">
      We’ll update this list as locations are confirmed.
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-2 text-sm">
    <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
      <p className="text-slate-800">
        <span className="font-semibold">Looking for a great deal on coffee or breakfast?</span>{" "}
        These local businesses have discounts available for NWACUHO attendees. Just show your
        conference badge for confirmation.
      </p>

      <div className="text-xs text-slate-600 space-y-2">
        <h3 className="font-semibold text-slate-700">February 9–11</h3>

        <p>
          <strong>Westin Hotel:</strong> Relish Bistro, Relish to Go, 1900 FIFTH Bar + Lounge  
          <br />
          NWACUHO attendees can receive a 10% discount at all on-property Westin locations.
          Just show your conference badge.
        </p>

        <p>
          <strong>Taz Matcha</strong> (410 Stewart St, Seattle, WA 98101)  
          <br />
          NWACUHO attendees can receive a 10% discount with promo code <strong>NWA</strong>.
        </p>

        <h3 className="font-semibold text-slate-700 pt-2">February 10</h3>

        <p>
          <strong>Moto Pizza</strong> (Belltown – 3131 Western Ave Ste. 302, Seattle, WA 98121)  
          <br />
          From 6:00–9:00 PM, NWACUHO attendees can enjoy Moto Pizza Happy Hour discounts,
          including a dinner-size pizza and two drinks for $20 (Crab Pizza excluded).
          A wide variety of beers, wines, canned cocktails, and sodas are available.
          Moto Pizza is located in the same building as Hourglass Escapes, our Tuesday Night
          on the Town location.  
          <br />
          Please order online ahead of time at{" "}
          <a
            href="https://www.motopizza.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            motopizza.com
          </a>.
        </p>
      </div>
    </div>
  </CardContent>
</Card>

        {/* Back to schedule */}
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              Back to Schedule
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
