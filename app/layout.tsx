import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import ConferenceNavigation from "./ConferenceNavigation";
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
        <ConferenceNavigation />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
