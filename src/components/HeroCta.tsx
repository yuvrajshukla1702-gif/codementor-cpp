"use client";

import Link from "next/link";
import { openCommandMenu } from "./CommandMenu";
import { Icon } from "./ui/icons";
import { useGame } from "@/lib/gamify";
import { nextPathItems } from "@/lib/learning-path";

export function HeroCta() {
  const game = useGame();
  const next = nextPathItems(game.done, 1)[0];
  const started = game.ready && game.solved > 0;
  const href = started && next ? `/practice/${next.id}` : "/practice/two-sum";
  const label = started && next ? `Continue · ${next.title}` : "Start with Two Sum";

  return (
    <div className="home-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
      <Link href={href} className="btn btn-primary !h-12 !px-6 !text-[15px]">
        <span className="max-w-[16rem] truncate">{label}</span>
        <Icon name="arrowRight" size={16} />
      </Link>
      <Link href="/practice" className="btn !h-12 !px-5 !text-[15px]">
        Browse problems
      </Link>
      <button type="button" onClick={openCommandMenu} className="btn btn-quiet !h-12 hidden! !px-3 sm:inline-flex!">
        <Icon name="search" size={15} />
        <kbd className="kbd">Ctrl</kbd>
        <kbd className="kbd">K</kbd>
      </button>
    </div>
  );
}
