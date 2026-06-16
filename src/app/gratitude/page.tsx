"use client";

import { useState } from "react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { useGratitudeNotes } from "@/lib/store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

const PROMPTS = [
  "오늘 누군가에게 받은 작은 친절",
  "오늘 먹은 음식 중 감사한 것",
  "오늘 웃게 해준 일",
  "오늘 도와준 사람",
  "오늘 하나님이 지켜주신 순간",
];

export default function GratitudePage() {
  const { notes, add, remove } = useGratitudeNotes();
  const [content, setContent] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    add(content);
    setContent("");
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="💛"
        title="감사노트"
        subtitle="하루 속 감사는 기록하지 않으면 쉽게 지나갑니다. 오늘의 감사를 남겨 은혜의 기억으로 만들어요."
      />

      <Card className="mb-4">
        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 감사한 일을 적어보세요…"
            rows={3}
            className="w-full resize-none rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-grace-400 focus:ring-2 focus:ring-grace-400/20"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-grace-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-grace-600"
            >
              감사 기록하기
            </button>
          </div>
        </form>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setContent((c) => (c ? c : p))}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-ink/60 transition hover:border-grace-400 hover:text-grace-600"
          >
            💡 {p}
          </button>
        ))}
      </div>

      {notes.length > 0 && (
        <p className="mb-3 text-sm text-ink/55">
          지금까지 {notes.length}개의 감사를 발견했어요.
        </p>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <EmptyState>아직 감사 기록이 없어요. 오늘의 첫 감사를 적어볼까요?</EmptyState>
        ) : (
          notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap">{n.content}</p>
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
