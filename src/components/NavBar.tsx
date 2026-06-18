"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth";

const LINKS = [
  { href: "/", label: "홈", emoji: "🏠" },
  { href: "/prayer", label: "기도노트", emoji: "🙏" },
  { href: "/gratitude", label: "감사노트", emoji: "💛" },
  { href: "/meditation", label: "말씀묵상", emoji: "📖" },
  { href: "/games", label: "게임학습", emoji: "🎮" },
  { href: "/mentor", label: "AI 멘토", emoji: "🕊️" },
];

const DASH_LINKS = [
  { href: "/sermon", label: "설교준비", emoji: "📝" },
  { href: "/family", label: "가정", emoji: "👪" },
  { href: "/teacher", label: "교사", emoji: "📊" },
  { href: "/admin", label: "관리자", emoji: "⚙️" },
  { href: "/settings", label: "설정", emoji: "🔧" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user, configured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // 경로가 바뀌면 모바일 메뉴를 닫습니다.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:gap-2">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amen-600 text-lg text-white shadow-sm">
            ✝
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

        {/* 데스크톱: 운영 메뉴 인라인 */}
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

        {/* 데스크톱: 로그인/계정 */}
        {configured && (
          <Link
            href="/login"
            title={user ? user.email ?? "내 계정" : "로그인"}
            className={`ml-1 hidden shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition md:flex ${
              isActive("/login")
                ? "bg-amen-600 text-white"
                : "text-ink/60 hover:bg-black/5"
            }`}
          >
            <span aria-hidden>{user ? "🙆" : "🔑"}</span>
            <span className="hidden sm:inline">{user ? "내 계정" : "로그인"}</span>
          </Link>
        )}

        {/* 모바일: 햄버거 버튼 */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
          className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-ink/70 transition hover:bg-black/5 md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* 모바일: 드롭다운 메뉴 (운영 메뉴 + 로그인) */}
      {menuOpen && (
        <div className="border-t border-black/5 bg-cream/95 px-4 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {DASH_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive(l.href)
                    ? "bg-ink text-white"
                    : "bg-white text-ink/70 hover:bg-black/5"
                }`}
              >
                <span aria-hidden>{l.emoji}</span>
                <span>{l.label}</span>
              </Link>
            ))}
            {configured && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive("/login")
                    ? "bg-amen-600 text-white"
                    : "bg-white text-ink/70 hover:bg-black/5"
                }`}
              >
                <span aria-hidden>{user ? "🙆" : "🔑"}</span>
                <span>{user ? "내 계정" : "로그인"}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
