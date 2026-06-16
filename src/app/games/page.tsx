"use client";

import Link from "next/link";
import { Card, PageHeader, StatPill } from "@/components/ui";
import { useGameResults } from "@/lib/store";

const GAMES = [
  {
    href: "/games/quiz",
    emoji: "📖",
    title: "성경퀴즈",
    desc: "주일학교에서 배운 성경 이야기를 퀴즈로 복습해요.",
    color: "from-amen-500 to-amen-700",
  },
  {
    href: "/games/prayer-person",
    emoji: "🙇",
    title: "기도 인물 맞추기",
    desc: "기도문을 보고 누가 드린 기도인지 맞혀요. 기도의 마음까지 배워요.",
    color: "from-grace-400 to-grace-600",
  },
  {
    href: "/games/card-sentence",
    emoji: "🧩",
    title: "카드문장 연결하기",
    desc: "흩어진 말씀 카드를 올바른 순서로 연결해 구절을 완성해요.",
    color: "from-emerald-500 to-emerald-700",
  },
];

export default function GamesPage() {
  const results = useGameResults();
  const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
  const totalQ = results.reduce((s, r) => s + r.total, 0);
  const accuracy = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="🎮"
        title="게임형 신앙학습"
        subtitle="직접 풀고, 맞히고, 연결하며 말씀을 재미있고 깊이 있게 배워요."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatPill emoji="🎯" label="참여 횟수" value={results.length} />
        <StatPill emoji="✅" label="맞힌 문제" value={totalCorrect} />
        <StatPill emoji="📈" label="정답률" value={`${accuracy}%`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {GAMES.map((g) => (
          <Link key={g.href} href={g.href}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div
                className={`mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${g.color} text-2xl text-white shadow-sm`}
                aria-hidden
              >
                {g.emoji}
              </div>
              <h3 className="font-bold">{g.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{g.desc}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-amen-600">
                시작하기 →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
