"use client";

import { PageHeader } from "@/components/ui";
import QuizRunner, { type QuizItem } from "@/components/QuizRunner";
import { bibleQuizzes } from "@/lib/data/games";

const items: QuizItem[] = bibleQuizzes.map((q) => ({
  id: q.id,
  prompt: q.question,
  options: q.options,
  answerIndex: q.answerIndex,
  explanation: q.explanation,
  reflection: q.reflection,
  reference: q.reference,
}));

export default function QuizPage() {
  return (
    <div>
      <PageHeader
        emoji="📖"
        title="성경퀴즈"
        subtitle="배운 성경 이야기를 퀴즈로 풀며 핵심 내용을 다시 기억해요."
      />
      <QuizRunner gameType="bible-quiz" promptLabel="문제" items={items} />
    </div>
  );
}
