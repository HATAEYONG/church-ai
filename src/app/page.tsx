"use client";

import Link from "next/link";
import { Card, StatPill } from "@/components/ui";
import {
  useBadges,
  useGameResults,
  useGratitudeNotes,
  useMeditations,
  usePrayerNotes,
} from "@/lib/store";

const FEATURES = [
  {
    href: "/prayer",
    emoji: "🙏",
    title: "기도노트",
    desc: "오늘의 기도 제목을 남기고 신앙의 여정을 돌아보세요.",
  },
  {
    href: "/gratitude",
    emoji: "💛",
    title: "감사노트",
    desc: "하루의 감사를 기록하면 은혜의 기억이 됩니다.",
  },
  {
    href: "/meditation",
    emoji: "📖",
    title: "말씀 묵상",
    desc: "오늘의 말씀을 읽고 묵상 질문을 따라 마음을 정리해요.",
  },
  {
    href: "/games",
    emoji: "🎮",
    title: "게임형 신앙학습",
    desc: "성경퀴즈·기도 인물 맞추기·카드문장 연결하기로 말씀을 익혀요.",
  },
  {
    href: "/mentor",
    emoji: "🕊️",
    title: "AI 신앙 멘토",
    desc: "성경 인물과 대화하며 묵상 질문을 정리해 보세요.",
  },
];

function todayCount(items: { createdAt: string }[]) {
  const today = new Date().toDateString();
  return items.filter((i) => new Date(i.createdAt).toDateString() === today)
    .length;
}

export default function HomePage() {
  const { notes: prayers } = usePrayerNotes();
  const { notes: gratitude } = useGratitudeNotes();
  const { notes: meditations } = useMeditations();
  const results = useGameResults();
  const badges = useBadges();

  return (
    <div className="animate-fade-up space-y-8">
      {/* 히어로 */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amen-600 to-amen-700 p-7 text-white shadow-lg sm:p-10">
        <p className="text-sm font-medium text-amen-100">
          다음 세대 신앙교육을 위한 AI 기반 플랫폼
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          기도는 기록되고, 감사는 발견되며,
          <br />
          말씀은 삶으로 이어집니다.
        </h1>
        <p className="mt-3 max-w-xl text-amen-100">
          매일의 기도·감사·묵상을 기록하고, AI 신앙 멘토와 대화하며,
          게임처럼 말씀을 배우는 디지털 신앙 동행 앱입니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/prayer"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-amen-700 shadow-sm transition hover:bg-amen-50"
          >
            🙏 오늘의 기도 남기기
          </Link>
          <Link
            href="/games"
            className="rounded-full bg-amen-500/40 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition hover:bg-amen-500/60"
          >
            🎮 신앙학습 시작하기
          </Link>
        </div>
      </section>

      {/* 나의 신앙 기록 요약 */}
      <section>
        <h2 className="mb-3 text-lg font-bold">나의 신앙 기록</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatPill emoji="🙏" label="기도 기록" value={prayers.length} />
          <StatPill emoji="💛" label="감사 기록" value={gratitude.length} />
          <StatPill emoji="📖" label="말씀 묵상" value={meditations.length} />
          <StatPill emoji="🎯" label="게임 참여" value={results.length} />
          <StatPill emoji="🏅" label="획득 배지" value={badges.length} />
        </div>
        <div className="mt-3 rounded-2xl border border-black/5 bg-white p-4 text-sm text-ink/70 shadow-sm">
          오늘 기도 {todayCount(prayers)}개 · 감사 {todayCount(gratitude)}개 ·
          묵상 {todayCount(meditations)}개를 기록했어요.{" "}
          {todayCount(prayers) +
            todayCount(gratitude) +
            todayCount(meditations) ===
            0 && "오늘의 첫 기록을 남겨볼까요?"}
        </div>
      </section>

      {/* 획득 배지 */}
      {badges.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">획득한 성장 배지</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-grace-500/15 px-3 py-1.5 text-sm font-medium text-grace-600"
              >
                <span aria-hidden>{b.emoji}</span>
                {b.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 기능 카드 */}
      <section>
        <h2 className="mb-3 text-lg font-bold">신앙 동행 기능</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {f.emoji}
                  </span>
                  <div>
                    <h3 className="font-bold">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{f.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
