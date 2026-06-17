"use client";

import { useMemo, useState } from "react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { qtPassages, todaysPassage, type QtPassage } from "@/lib/data/meditations";
import { useMeditations } from "@/lib/store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function MeditationPage() {
  const { notes, add, remove } = useMeditations();
  const today = useMemo(() => todaysPassage(), []);
  const [selectedId, setSelectedId] = useState(today.id);
  const [reflection, setReflection] = useState("");

  const passage: QtPassage =
    qtPassages.find((p) => p.id === selectedId) ?? today;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    add(passage.id, passage.reference, reflection);
    setReflection("");
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="📖"
        title="말씀 묵상"
        subtitle="오늘의 말씀을 천천히 읽고, 묵상 질문을 따라 마음을 정리해 기록해요. 주일에 배운 말씀이 주중의 삶으로 이어집니다."
      />

      {/* 본문 선택 */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {qtPassages.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              p.id === selectedId
                ? "bg-amen-600 text-white shadow-sm"
                : "border border-black/10 bg-white text-ink/70 hover:bg-black/5"
            }`}
          >
            {p.id === today.id && <span aria-hidden>⭐ </span>}
            {p.reference}
          </button>
        ))}
      </div>

      {/* 오늘의 말씀 */}
      <Card className="mb-4 bg-gradient-to-br from-amen-600 to-amen-700 text-white">
        {passage.id === today.id && (
          <p className="text-xs font-semibold text-amen-100">오늘의 말씀</p>
        )}
        <h2 className="mt-1 text-lg font-bold">{passage.theme}</h2>
        <p className="mt-3 leading-relaxed text-amen-50">{passage.verse}</p>
        <p className="mt-3 text-sm font-semibold text-amen-100">
            — {passage.reference}
        </p>
      </Card>

      {/* 묵상 가이드 */}
      <Card className="mb-4">
        <h3 className="flex items-center gap-2 font-bold">🪞 묵상 질문</h3>
        <ul className="mt-3 space-y-2">
          {passage.questions.map((q, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink/80">
              <span className="font-semibold text-amen-600">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-cream/60 p-3">
          <p className="text-sm font-semibold">🙏 기도로 마무리</p>
          <p className="mt-1 text-sm text-ink/75">{passage.prayer}</p>
        </div>
      </Card>

      {/* 나의 묵상 작성 */}
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-3">
          <label className="text-sm font-semibold">
            오늘 이 말씀을 통해 받은 은혜를 적어보세요
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="이 말씀이 내 마음에 어떻게 다가왔는지, 오늘 어떻게 적용할지 적어보세요…"
            rows={4}
            className="w-full resize-none rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
            >
              묵상 기록하기
            </button>
          </div>
        </form>
      </Card>

      {/* 지난 묵상 */}
      <h2 className="mb-3 text-lg font-bold">지난 묵상 기록</h2>
      {notes.length > 0 && (
        <p className="mb-3 text-sm text-ink/55">
          지금까지 {notes.length}번의 말씀 묵상을 기록했어요. 🌿
        </p>
      )}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <EmptyState>
            아직 묵상 기록이 없어요. 오늘의 말씀으로 첫 묵상을 남겨볼까요?
          </EmptyState>
        ) : (
          notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amen-600">
                    📖 {n.reference}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-ink/80">
                    {n.reflection}
                  </p>
                  <p className="mt-2 text-xs text-ink/40">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => remove(n.id)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs text-ink/35 transition hover:text-red-500"
                >
                  삭제
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
