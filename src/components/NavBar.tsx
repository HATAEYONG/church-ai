"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "홈", emoji: "🏠" },
  { href: "/prayer", label: "기도노트", emoji: "🙏" },
  { href: "/gratitude", label: "감사노트", emoji: "💛" },
  { href: "/meditation", label: "말씀묵상", emoji: "📖" },
  { href: "/games", label: "게임학습", emoji: "🎮" },
  { href: "/mentor", label: "AI 멘토", emoji: "🕊️" },
];

const DASH_LINKS = [
  { href: "/teacher", label: "교사", emoji: "📊" },
  { href: "/admin", label: "관리자", emoji: "⚙️" },
];

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:gap-2">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amen-600 text-lg text-white shadow-sm">
            ✝
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            에이맨
          </span>
        </Link>

        <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-amen-600 text-white shadow-sm"
                  : "text-ink/70 hover:bg-black/5"
              }`}
            >
              <span aria-hidden>{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="ml-1 hidden items-center gap-1 border-l border-black/10 pl-2 md:flex">
          {DASH_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-ink text-white"
                  : "text-ink/60 hover:bg-black/5"
              }`}
            >
              <span aria-hidden>{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
