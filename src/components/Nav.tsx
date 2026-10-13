"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openCommandMenu } from "./CommandMenu";
import { Icon, Logo } from "./ui/icons";
import { useGame } from "@/lib/gamify";

const links: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: "/practice", label: "Problems", match: (p) => p.startsWith("/practice") },
  {
    href: "/learn",
    label: "Learn",
    match: (p) => p === "/learn" || p.startsWith("/learn/dsa") || p.startsWith("/learn/classroom"),
  },
  { href: "/learn/cpp", label: "C++", match: (p) => p.startsWith("/learn/cpp") },
  { href: "/tcs", label: "TCS", match: (p) => p.startsWith("/tcs") },
  { href: "/core", label: "Core CS", match: (p) => p.startsWith("/core") },
  { href: "/hr", label: "HR", match: (p) => p.startsWith("/hr") },
  { href: "/progress", label: "Progress", match: (p) => p.startsWith("/progress") },
];

export function Nav() {
  const pathname = usePathname() || "/";
  const game = useGame();
  const atRisk = game.ready && game.streak > 0 && game.today === 0;
  const lit = game.ready && game.streak > 0 && game.today > 0;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--line)] bg-[rgba(7,9,13,0.78)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1680px] items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 pr-1" aria-label="CodeMentor home">
          <span className="transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <Logo size={28} />
          </span>
          <span className="font-display hidden text-[15px] text-[var(--ink)] sm:block">
            CodeMentor<span className="text-[var(--accent)]">.</span>
          </span>
        </Link>

        <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" aria-label="Main">
          {links.map((l) => {
            const active = l.match(pathname);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--chip)] text-[var(--ink)] after:absolute after:inset-x-3 after:-bottom-[13px] after:h-px after:bg-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-white/[.04] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCommandMenu}
            className="btn btn-sm !h-8 !gap-2 !px-2.5 !text-[var(--muted)] sm:!px-3"
            aria-label="Search problems and pages"
          >
            <Icon name="search" size={14} />
            <span className="hidden lg:inline">Search</span>
            <span className="hidden items-center gap-1 xl:inline-flex">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>

          <div
            className={`flex items-center gap-1.5 transition-opacity duration-300 ${game.ready ? "opacity-100" : "opacity-0"}`}
          >
            <Link
              href="/progress"
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold tabular-nums transition-colors ${
                lit
                  ? "border-[rgba(255,122,69,0.4)] bg-[rgba(255,122,69,0.1)] text-[var(--ember)]"
                  : atRisk
                    ? "border-[rgba(255,122,69,0.35)] text-[var(--ember)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              title={
                atRisk
                  ? `Solve one problem today to keep your ${game.streak}-day streak`
                  : game.streak > 0
                    ? `${game.streak}-day streak · best ${game.best}`
                    : "Solve a problem to start a streak"
              }
            >
              <span className={lit ? "cm-flicker inline-flex" : atRisk ? "cm-pulse inline-flex" : "inline-flex"}>
                <Icon name="flame" size={15} fill={lit ? "currentColor" : "none"} />
              </span>
              {game.streak}
            </Link>

            <Link
              href="/progress"
              className="hidden h-8 items-center gap-2 rounded-lg border border-[var(--line)] px-2.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:inline-flex"
              title={`${game.xp} XP · ${game.rank}`}
            >
              <span className="font-semibold tabular-nums text-[var(--ink)]">Lv {game.level}</span>
              <span className="h-1.5 w-10 overflow-hidden rounded-full bg-[var(--line-strong)]">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,var(--gold),var(--accent))] transition-[width] duration-700"
                  style={{ width: `${game.levelPct}%` }}
                />
              </span>
            </Link>
          </div>

          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-white/[.05] hover:text-[var(--ink)]"
          >
            <Icon name="sliders" size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
