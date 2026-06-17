import type { ReactNode } from "react";

export function PageHeader({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <span aria-hidden>{emoji}</span>
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-ink/60">{subtitle}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatPill({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-ink/55">{label}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-8 text-center text-ink/50">
      {children}
    </div>
  );
}
