import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import Link from "next/link";
import PwaRegister from "./PwaRegister";
import "./globals.css";

const notoSans = Noto_Sans({ variable: "--font-noto-sans", subsets: ["latin"], display: "swap" });
const notoSerif = Noto_Serif({ variable: "--font-noto-serif", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NWACUHO Conference",
  description: "NWACUHO conference schedule and attendee information.",
  applicationName: "NWACUHO Conference",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#1F443E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${notoSerif.variable} bg-neutral-900/5`}>
        <PwaRegister />
        <header className="w-full border-b border-slate-200 bg-white/90">
          <nav aria-label="Primary navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <Link href="/" className="font-bold text-[#1F443E]">NWACUHO</Link>
            <div className="flex flex-wrap gap-4">
              <Link href="/">2026 Schedule</Link>
              <Link href="/2027">2027 Preview</Link>
              <Link href="/info">Info</Link>
              <Link href="/speakers">Speakers</Link>
              <Link href="/venue">Venue Map</Link>
              <Link href="/accessibility">Accessibility</Link>
            </div>
          </nav>
        </header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
