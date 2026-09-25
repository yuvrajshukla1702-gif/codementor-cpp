"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/practice", label: "Problems" },
  { href: "/learn", label: "Learn" },
  { href: "/learn/cpp", label: "C++" },
  { href: "/tcs", label: "TCS" },
  { href: "/core", label: "Core CS" },
  { href: "/hr", label: "HR" },
  { href: "/progress", label: "Progress" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 h-12 border-b border-[var(--line)] bg-[#282828]">
      <div className="flex h-full items-center gap-1 px-3">
        <Link href="/" className="mr-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <span className="grid h-6 w-6 place-items-center rounded bg-[var(--accent)] text-xs font-bold text-black">C</span>
          CodeMentor
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto text-sm">
          {links.map((l) => {
            const on =
              l.href === "/learn"
                ? path === "/learn" || path.startsWith("/learn/dsa") || path.startsWith("/learn/classroom")
                : path === l.href || path.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded px-2.5 py-1 ${
                  on ? "bg-[var(--chip)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/settings" className="ml-auto text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Settings
        </Link>
      </div>
    </header>
  );
}
