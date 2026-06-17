"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { cardSentences } from "@/lib/data/games";
import { useRecordGameResult } from "@/lib/store";

function shuffleWithIndex(fragments: string[]) {
  return fragments
    .map((text, originalIndex) => ({ text, originalIndex }))
    .sort(() => Math.random() - 0.5);
}

export default function CardSentencePage() {
  const deck = useMemo(
    () => [...cardSentences].sort(() => Math.random() - 0.5),
    [],
  );
  const recordResult = useRecordGameResult();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // originalIndex 순서
  const [correct, setCorrect] = useState(0);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  const current = deck[index];
  const shuffled = useMemo(
    () => shuffleWithIndex(current.fragments),
    [current],
  );
  const isLast = index === deck.length - 1;

  const isComplete = picked.length === current.fragments.length;
  const isOrderCorrect =
    isComplete && picked.every((orig, i) => orig === i);

  const pick = (originalIndex: number) => {
    if (checked || picked.includes(originalIndex)) return;
    setPicked((p) => [...p, originalIndex]);
  };

  const undo = () => {
    if (checked) return;
    setPicked((p) => p.slice(0, -1));
  };

  const check = () => {
    setChecked(true);
    if (isOrderCorrect) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (isLast) {
      void recordResult("card-sentence", correct, deck.length);
      setDone(true);
    } else {
      setIndex((n) => n + 1);
      setPicked([]);
      setChecked(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked([]);
    setCorrect(0);
    setChecked(false);
    setDone(false);
  };

  if (done) {
    return (
      <div>
        <PageHeader emoji="🧩" title="카드문장 연결하기" />
        <Card className="animate-fade-up text-center">
          <div className="text-5xl" aria-hidden>
            {correct === deck.length ? "🏆" : "🌱"}
          </div>
          <h2 className="mt-3 text-2xl font-bold">
            {deck.length}구절 중 {correct}구절 완성!
          </h2>
          <p className="mt-2 text-ink/60">
            말씀의 구조와 의미가 조금씩 더 익숙해지고 있어요.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={restart}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        emoji="🧩"
        title="카드문장 연결하기"
        subtitle="흩어진 말씀 카드를 올바른 순서로 연결해 구절을 완성해요."
      />

      <div className="animate-fade-up space-y-4">
        <div className="flex items-center justify-between text-sm text-ink/55">
          <span>
            {index + 1} / {deck.length}
          </span>
          <span>완성 {correct}구절</span>
        </div>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {current.reference}
          </p>
          <p className="mt-1 text-sm text-ink/55">💡 {current.hint}</p>

          {/* 완성 중인 문장 */}
          <div className="mt-4 min-h-[3.5rem] rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3">
            {picked.length === 0 ? (
              <span className="text-sm text-ink/40">
                아래 카드를 순서대로 눌러 말씀을 완성해 보세요.
              </span>
            ) : (
              <p className="leading-relaxed">
                {picked
                  .map((orig) => current.fragments[orig])
                  .join(" ")}
              </p>
            )}
          </div>

          {/* 카드 선택지 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {shuffled.map(({ text, originalIndex }) => {
              const used = picked.includes(originalIndex);
              return (
                <button
                  key={originalIndex}
                  onClick={() => pick(originalIndex)}
                  disabled={used || checked}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    used
                      ? "border-black/5 bg-black/5 text-ink/30"
                      : "border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {text}
                </button>
              );
            })}
          </div>

          {/* 결과 / 액션 */}
          {checked ? (
            <div className="mt-4">
              {isOrderCorrect ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  ✅ 정확해요! &ldquo;
                  {current.fragments.join(" ")}&rdquo;
                </p>
              ) : (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  💛 아쉬워요. 올바른 순서는: &ldquo;
                  {current.fragments.join(" ")}&rdquo;
                </p>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={next}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {isLast ? "결과 보기" : "다음 구절 →"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-between">
              <button
                onClick={undo}
                disabled={picked.length === 0}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink/60 transition enabled:hover:bg-black/5 disabled:opacity-40"
              >
                ← 되돌리기
              </button>
              <button
                onClick={check}
                disabled={!isComplete}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-700 disabled:opacity-40"
              >
                정답 확인
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
