import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component (reads localStorage), so the title lives here.
export const metadata: Metadata = { title: "Progress" };

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return children;
}
