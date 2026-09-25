import type { Metadata } from "next";
import { Syne, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AutoSync } from "@/components/AutoSync";

const display = Syne({ subsets: ["latin"], variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CodeMentor C++",
  description: "Personal DSA + interview prep platform for 2027 placements",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
          <Nav />
          <AutoSync />
          <main className="px-3 py-3">{children}</main>
        </div>
      </body>
    </html>
  );
}
