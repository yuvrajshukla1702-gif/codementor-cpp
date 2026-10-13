import type { ReactNode } from "react";
import type { Difficulty } from "@/lib/gamify";

const DIFF: Record<Difficulty, { color: string; pips: number }> = {
  Easy: { color: "var(--easy)", pips: 1 },
  Medium: { color: "var(--medium)", pips: 2 },
  Hard: { color: "var(--hard)", pips: 3 },
};

/** Three rising bars instead of a coloured word. Reads at a glance, never looks like a table cell. */
export function Pips({ difficulty, label = false }: { difficulty: Difficulty; label?: boolean }) {
  const d = DIFF[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5" title={difficulty}>
      <span className="inline-flex items-end gap-[3px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: 6 + i * 3,
              background: i < d.pips ? d.color : "var(--line-strong)",
            }}
          />
        ))}
      </span>
      {label ? (
        <span className="text-xs font-medium" style={{ color: d.color }}>
          {difficulty}
        </span>
      ) : (
        <span className="sr-only">{difficulty}</span>
      )}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** SVG progress ring; children render in the middle. */
export function Ring({
  value,
  size = 56,
  stroke = 5,
  color = "var(--accent)",
  track = "var(--line-strong)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

export function Bar({
  value,
  color = "var(--accent)",
  height = 6,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="overflow-hidden rounded-full bg-[var(--line-strong)]" style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: "width 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

export function TopicTag({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}

/** Shared page frame: centred column that matches Progress / Settings / Learn. */
export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl space-y-9 px-1 py-6 sm:px-3 sm:py-8">{children}</div>;
}

/** Eyebrow + display title (+ italic serif accent word) + one-line intro. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-1 font-display text-4xl tracking-[-0.04em]">
        {title}
        {accent && (
          <>
            {" "}
            <span className="font-serif-accent text-[1.05em] font-normal text-[var(--accent)]">{accent}</span>
          </>
        )}
      </h1>
      {children && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{children}</p>}
    </header>
  );
}

/** Section heading with a hairline that runs to the edge. */
export function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="font-display text-xl tracking-[-0.02em]">{children}</h2>
      {count != null && <span className="chip tabular-nums">{count}</span>}
      <span className="h-px flex-1 bg-[var(--line)]" aria-hidden />
    </div>
  );
}
