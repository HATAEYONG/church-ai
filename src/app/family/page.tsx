"use client";

import Link from "next/link";
import { Card, EmptyState, PageHeader, StatPill } from "@/components/ui";
import { familyTalkCards, familyWorshipTips } from "@/lib/data/family";
import {
  useBadges,
  useGameResults,
  useGratitudeNotes,
  useMeditations,
  usePrayerNotes,
} from "@/lib/store";

function thisWeek(items: { createdAt: string }[]) {
  const weekAgo = Date.now() - 7 * 86400000;
  return items.filter((i) => new Date(i.createdAt).getTime() >= weekAgo).length;
}

export default function FamilyPage() {
  const { notes: prayers } = usePrayerNotes();
  const { notes: gratitude } = useGratitudeNotes();
  const { notes: meditations } = useMeditations();
  const results = useGameResults();
  const badges = useBadges();

  // 자녀의 최근 활동에서 가정 대화 거리를 만들어 줍니다.
  const recentGratitude = gratitude[0];
  const recentMeditation = meditations[0];
  const recentPrayer = prayers[0];

  const dynamicPrompts: { emoji: string; text: string }[] = [];
  if (recentMeditation)
    dynamicPrompts.push({
      emoji: "📖",
      text: `오늘 자녀가 「${recentMeditation.reference}」 말씀을 묵상했어요. "이 말씀에서 어떤 마음이 들었어?"라고 물어봐 주세요.`,
    });
  if (recentGratitude)
    dynamicPrompts.push({
      emoji: "💛",
      text: `자녀의 최근 감사: "${recentGratitude.content}" — 가족도 각자 오늘의 감사를 한 가지씩 나눠볼까요?`,
    });
  if (recentPrayer)
    dynamicPrompts.push({
      emoji: "🙏",
      text: `자녀의 기도 제목 "${recentPrayer.title}"을(를) 오늘 가족이 함께 기도해 주세요.`,
    });

  const hasActivity =
    prayers.length + gratitude.length + meditations.length + results.length > 0;

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="👪"
        title="가정 연결"
        subtitle="교회학교에서 배운 말씀이 가정의 신앙 대화로 이어집니다. 부모와 교사가 함께 아이의 신앙 성장을 응원해요."
      />

      <div className="mb-4 text-sm text-ink/55">
        이 화면은 자녀(이 기기)의 활동을 부모가 함께 보도록 돕습니다.
      </div>

      {/* 자녀의 이번 주 신앙 활동 */}
      <h2 className="mb-3 text-lg font-bold">자녀의 이번 주 신앙 활동</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatPill emoji="🙏" label="기도" value={thisWeek(prayers)} />
        <StatPill emoji="💛" label="감사" value={thisWeek(gratitude)} />
        <StatPill emoji="📖" label="묵상" value={thisWeek(meditations)} />
        <StatPill emoji="🎮" label="게임" value={thisWeek(results)} />
        <StatPill emoji="🏅" label="배지" value={badges.length} />
      </div>

      {/* 오늘의 가정 신앙 대화 */}
      <h2 className="mb-3 text-lg font-bold">오늘의 가정 신앙 대화</h2>
      {dynamicPrompts.length > 0 ? (
        <div className="mb-6 space-y-3">
          {dynamicPrompts.map((p, i) => (
            <Card key={i} className="border-amen-200 bg-amen-50/50">
              <div className="flex gap-3">
                <span className="text-xl" aria-hidden>
                  {p.emoji}
                </span>
                <p className="text-sm text-ink/80">{p.text}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <EmptyState>
            자녀가 기도·감사·묵상을 기록하면, 그 내용으로 가정 대화 거리를
            만들어 드려요.{" "}
            {!hasActivity && (
              <Link href="/prayer" className="text-amen-600 underline">
                먼저 기록을 시작해 볼까요?
              </Link>
            )}
          </EmptyState>
        </div>
      )}

      {/* 성경 인물로 나누는 가정 대화 */}
      <h2 className="mb-3 text-lg font-bold">성경 인물로 나누는 가정 대화</h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {familyTalkCards.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {c.emoji}
              </span>
              <h3 className="font-bold">{c.person}</h3>
              <span className="text-xs text-ink/45">· {c.reference}</span>
            </div>
            <p className="mt-1 text-xs text-ink/55">배운 점: {c.learned}</p>
            <p className="mt-2 rounded-xl bg-cream/60 px-3 py-2 text-sm text-ink/80">
              {c.starter}
            </p>
          </Card>
        ))}
      </div>

      {/* 가정 예배 가이드 */}
      <Card className="bg-grace-500/5">
        <h2 className="flex items-center gap-2 font-bold">🏠 가정 예배 가이드</h2>
        <ul className="mt-3 space-y-2">
          {familyWorshipTips.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink/75">
              <span className="text-grace-500">✦</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
