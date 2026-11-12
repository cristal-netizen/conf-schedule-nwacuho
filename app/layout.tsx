import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import ConferenceNavigation from "./ConferenceNavigation";
import PwaRegister from "./PwaRegister";
import "./globals.css";

const notoSans = Noto_Sans({ variable: "--font-noto-sans", subsets: ["latin"], display: "swap" });
const notoSerif = Noto_Serif({ variable: "--font-noto-serif", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NWACUHO 2027 Conference Companion",
  description: "NWACUHO conference schedule and attendee information.",
  applicationName: "NWACUHO 2027",
  icons: { icon: [{ url: "/branding/nwacuho-app-icon.svg", type: "image/svg+xml", sizes: "any" }], apple: "/branding/nwacuho-app-icon.svg" },
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
