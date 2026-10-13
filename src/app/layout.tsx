import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AutoSync } from "@/components/AutoSync";
import { CommandMenu } from "@/components/CommandMenu";
import { RewardLayer } from "@/components/RewardLayer";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", preload: false });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "CodeMentor C++", template: "%s · CodeMentor" },
  description: "Understand DSA the way a teacher explains it — voice lessons, code walks and a local C++ judge.",
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
          <Nav />
          <AutoSync />
          <main className="px-3 py-3">{children}</main>
        </div>
        <CommandMenu />
        <RewardLayer />
      </body>
    </html>
  );
}
