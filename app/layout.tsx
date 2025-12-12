import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NWACUHO Conference Schedule",
  description: "Conference schedule for NWACUHO Annual Conference",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-900/5`}
      >
        <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 text-xs md:text-sm">
            <div className="font-semibold text-slate-900">
              NWACUHO 2026 · Seattle
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-700 hover:text-[#28903b]">
                Schedule
              </Link>
              <Link
                href="/speakers"
                className="text-slate-700 hover:text-[#28903b]"
              >
                Speakers
              </Link>
              <Link
                href="/venue"
                className="text-slate-700 hover:text-[#28903b]"
              >
                Venue Map
              </Link>
            </div>
          </nav>
        </header>
        <div className="pt-2">{children}</div>
      </body>
    </html>
  );
}

