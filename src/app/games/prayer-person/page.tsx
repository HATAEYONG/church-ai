"use client";

import { PageHeader } from "@/components/ui";
import QuizRunner, { type QuizItem } from "@/components/QuizRunner";
import { prayerPersonCards } from "@/lib/data/games";

const items: QuizItem[] = prayerPersonCards.map((c) => ({
  id: c.id,
  prompt: c.prayer,
  options: c.options,
  answerIndex: c.answerIndex,
  explanation: c.explanation,
  reflection: c.reflection,
  reference: c.reference,
}));

export default function PrayerPersonPage() {
  return (
    <div>
      <PageHeader
        emoji="🙇"
        title="기도 인물 맞추기"
        subtitle="기도문을 먼저 읽고, 누가 드린 기도인지 맞혀요. 기도의 내용·상황·믿음의 태도를 함께 배웁니다."
      />
      <QuizRunner
        gameType="prayer-person"
        promptLabel="이 기도를 드린 성경 인물은 누구일까요?"
        items={items}
      />
    </div>
  );
}
