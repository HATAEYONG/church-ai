"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { useRecordGameResult } from "@/lib/store";
import type { GameType } from "@/lib/types";

export interface QuizItem {
  id: string;
  prompt: string; // 문제 또는 기도문
  options: string[];
  answerIndex: number;
  explanation: string;
  reflection: string;
  reference: string;
}

export default function QuizRunner({
  gameType,
  promptLabel,
  items,
}: {
  gameType: GameType;
  promptLabel: string; // 예: "문제" / "이 기도를 드린 인물은?"
  items: QuizItem[];
}) {
  // 매 세션마다 문제 순서를 섞어 반복 학습 효과를 줍니다.
  const deck = useMemo(
    () => [...items].sort(() => Math.random() - 0.5),
    [items],
  );

  const recordResult = useRecordGameResult();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];
  const isLast = index === deck.length - 1;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.answerIndex) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (isLast) {
      void recordResult(gameType, correct, deck.length);
      setDone(true);
    } else {
      setIndex((n) => n + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    const perfect = correct === deck.length;
    return (
      <Card className="animate-fade-up text-center">
        <div className="text-5xl" aria-hidden>
          {perfect ? "🏆" : correct >= deck.length / 2 ? "🎉" : "🌱"}
        </div>
        <h2 className="mt-3 text-2xl font-bold">
          {deck.length}문제 중 {correct}문제 정답!
        </h2>
        <p className="mt-2 text-ink/60">
          {perfect
            ? "완벽해요! 말씀을 정말 잘 기억하고 있네요."
            : "잘했어요! 다시 도전하면 더 깊이 기억할 수 있어요."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={restart}
            className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
          >
            다시 도전하기
          </button>
          <Link
            href="/games"
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-black/5"
          >
            다른 게임 하기
          </Link>
        </div>
      </Card>
    );
  }

  const answered = selected !== null;

  return (
    <div className="animate-fade-up space-y-4">
      {/* 진행 표시 */}
      <div className="flex items-center justify-between text-sm text-ink/55">
        <span>
          {index + 1} / {deck.length}
        </span>
        <span>정답 {correct}개</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-amen-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / deck.length) * 100}%` }}
        />
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-amen-600">
          {promptLabel}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-relaxed">
          {current.prompt}
        </p>

        <div className="mt-4 grid gap-2">
          {current.options.map((opt, i) => {
            const isAnswer = i === current.answerIndex;
            const isPicked = i === selected;
            let cls =
              "border-black/10 bg-cream/40 hover:border-amen-300 hover:bg-amen-50";
            if (answered) {
              if (isAnswer)
                cls = "border-emerald-400 bg-emerald-50 text-emerald-800";
              else if (isPicked)
                cls = "border-red-300 bg-red-50 text-red-700";
              else cls = "border-black/10 bg-cream/40 opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-medium transition ${cls}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-ink/60 ring-1 ring-black/10">
                  {["①", "②", "③", "④"][i] ?? i + 1}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && isAnswer && <span aria-hidden>✅</span>}
                {answered && isPicked && !isAnswer && <span aria-hidden>❌</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {answered && (
        <Card className="animate-fade-up bg-amen-50/60">
          <p className="text-sm font-semibold text-amen-700">
            📖 {current.reference}
          </p>
          <p className="mt-1.5 text-sm text-ink/80">{current.explanation}</p>
          <div className="mt-3 rounded-xl border border-amen-200 bg-white/70 p-3">
            <p className="text-sm font-semibold">🪞 오늘의 묵상</p>
            <p className="mt-1 text-sm text-ink/75">{current.reflection}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={next}
              className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
            >
              {isLast ? "결과 보기" : "다음 문제 →"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
