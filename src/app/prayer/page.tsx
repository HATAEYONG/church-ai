"use client";

import { useState } from "react";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { usePrayerNotes } from "@/lib/store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function PrayerPage() {
  const { notes, add, toggleAnswered, remove } = usePrayerNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    add(title || "오늘의 기도", content);
    setTitle("");
    setContent("");
  };

  const answered = notes.filter((n) => n.answered).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="🙏"
        title="기도노트"
        subtitle="기도 제목을 마음에만 두지 말고 기록해 보세요. 시간이 지나면 한 사람의 신앙 여정이 됩니다."
      />

      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기도 제목 (예: 가족의 건강을 위해)"
            className="w-full rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하나님께 드리는 기도를 적어보세요…"
            rows={3}
            className="w-full resize-none rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
            >
              기도 기록하기
            </button>
          </div>
        </form>
      </Card>

      {notes.length > 0 && (
        <p className="mb-3 text-sm text-ink/55">
          총 {notes.length}개의 기도 · 응답받은 기도 {answered}개 🙌
        </p>
      )}

      <div className="space-y-3">
        {notes.length === 0 ? (
          <EmptyState>
            아직 기록된 기도가 없어요. 오늘의 첫 기도 제목을 남겨볼까요?
          </EmptyState>
        ) : (
          notes.map((n) => (
            <Card key={n.id} className={n.answered ? "bg-grace-500/5" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{n.title}</h3>
                    {n.answered && (
                      <span className="shrink-0 rounded-full bg-grace-500/15 px-2 py-0.5 text-xs font-medium text-grace-600">
                        응답됨
                      </span>
                    )}
                  </div>
                  {n.content && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink/70">
                      {n.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-ink/40">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button
                    onClick={() => toggleAnswered(n.id)}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink/60 transition hover:bg-black/5"
                  >
                    {n.answered ? "응답 취소" : "응답됨 표시"}
                  </button>
                  <button
                    onClick={() => remove(n.id)}
                    className="rounded-full px-3 py-1 text-xs text-ink/35 transition hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
