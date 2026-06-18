"use client";

import { useRef, useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { SERMON_STAGE_META, type SermonStageId } from "@/lib/sermon-stages";
import { aiKeyHeaders } from "@/lib/ai-config";

type Stages = Record<SermonStageId, string>;
const EMPTY: Stages = {
  theme: "",
  structure: "",
  draft: "",
  critique: "",
  revision: "",
};

const SAMPLE = "빌립보서 4:6-7";
const TOTAL = SERMON_STAGE_META.length;

export default function SermonPage() {
  const [passage, setPassage] = useState("");
  const [stages, setStages] = useState<Stages>(EMPTY);
  const [current, setCurrent] = useState<SermonStageId | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 누적 스트림을 단계별로 분해
  const parse = (raw: string): SermonStageId | null => {
    const parts = raw.split(/\[\[SERMON_STAGE:(\w+)\]\]/);
    const next: Stages = { ...EMPTY };
    let last: SermonStageId | null = null;
    for (let i = 1; i < parts.length; i += 2) {
      const id = parts[i];
      const content = (parts[i + 1] ?? "").replace(/^\n/, "");
      if (id === "done") continue;
      if (id === "error") {
        setError(content.trim());
        continue;
      }
      if (id in next) {
        next[id as SermonStageId] = content;
        last = id as SermonStageId;
      }
    }
    setStages(next);
    return last;
  };

  const run = async () => {
    const p = passage.trim();
    if (!p || running) return;
    setRunning(true);
    setError(null);
    setStages(EMPTY);
    setCurrent("theme");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiKeyHeaders() },
        body: JSON.stringify({ passage: p }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "설교 생성을 시작하지 못했어요.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          const last = parse(raw);
          setCurrent(raw.includes("[[SERMON_STAGE:done]]") ? null : last);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // 사용자가 중단함 — 조용히 종료
      } else {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
      }
    } finally {
      setRunning(false);
      setCurrent(null);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const revision = stages.revision.trim();
  const completed = SERMON_STAGE_META.filter((m) => stages[m.id].trim()).length;
  const hasAny = completed > 0;

  const fullMarkdown = () =>
    `# 설교 준비 결과\n\n> 본문: ${passage.trim()}\n\n` +
    SERMON_STAGE_META.map(
      (m) => `## ${m.emoji} ${m.title}\n\n${stages[m.id].trim() || "(없음)"}`,
    ).join("\n\n");

  const finalMarkdown = () => revision || fullMarkdown();

  const flashCopied = (tag: string) => {
    setCopied(tag);
    setTimeout(() => setCopied((c) => (c === tag ? null : c)), 2000);
  };

  const copyText = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(tag);
    } catch {
      setError("복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
    }
  };

  const download = (content: string, suffix: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sermon${suffix}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusOf = (id: SermonStageId): "대기" | "진행중" | "완료" => {
    if (current === id) return "진행중";
    if (stages[id].trim()) return "완료";
    return "대기";
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="📝"
        title="설교 준비 자동화"
        subtitle="본문을 입력하면 주제 설정 → 구조 분석 → 초안 → 다각적 비평 → 수정본까지 단계별로 자동 진행됩니다. 결과는 강단에 서기 전 반드시 직접 검토하세요."
      />

      {/* 입력 */}
      <Card className="mb-6">
        <label className="text-sm font-semibold">설교 본문</label>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="예: 빌립보서 4:6-7  /  또는 본문 전문을 붙여넣어도 됩니다."
          rows={3}
          disabled={running}
          className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100 disabled:opacity-60"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setPassage(SAMPLE)}
            disabled={running}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-ink/60 transition hover:border-amen-300 hover:text-amen-600 disabled:opacity-50"
          >
            예시 본문 넣기
          </button>
          <div className="flex items-center gap-2">
            {running && (
              <button
                onClick={stop}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                중단
              </button>
            )}
            <button
              onClick={run}
              disabled={running || !passage.trim()}
              className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-amen-700 disabled:opacity-40"
            >
              {running ? "생성 중…" : hasAny ? "다시 생성" : "설교 준비 시작"}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            ⚠️ {error}
          </p>
        )}
      </Card>

      {/* 진행률 */}
      {(running || hasAny) && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-ink/55">
            <span>{running ? "진행 중…" : "완료"}</span>
            <span className="tabular-nums">
              {completed} / {TOTAL} 단계
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-amen-500 transition-all"
              style={{ width: `${(completed / TOTAL) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 단계 패널 */}
      <div className="space-y-3">
        {SERMON_STAGE_META.map((m, i) => {
          const status = statusOf(m.id);
          const content = stages[m.id];
          const hasContent = content.trim().length > 0;
          return (
            <Card
              key={m.id}
              className={status === "진행중" ? "border-amen-300 ring-2 ring-amen-100" : ""}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-bold">
                  <span aria-hidden>{m.emoji}</span>
                  <span className="text-ink/40">{i + 1}.</span>
                  {m.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  {hasContent && !running && (
                    <button
                      onClick={() => copyText(content.trim(), m.id)}
                      className="rounded-full px-2 py-0.5 text-xs text-ink/45 transition hover:bg-black/5 hover:text-ink/70"
                      title="이 단계 복사"
                    >
                      {copied === m.id ? "복사됨" : "복사"}
                    </button>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      status === "완료"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "진행중"
                          ? "bg-amen-600 text-white"
                          : "bg-black/5 text-ink/45"
                    }`}
                  >
                    {status === "진행중" ? "진행중…" : status}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink/45">{m.desc}</p>

              {hasContent ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
                  {content}
                  {status === "진행중" && (
                    <span className="ml-0.5 inline-block animate-pulse">▋</span>
                  )}
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink/35">
                  {status === "진행중" ? "작성하고 있어요…" : "대기 중"}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* 결과 액션 */}
      {hasAny && !running && (
        <Card className="mt-6 bg-amen-50/60">
          <p className="text-sm font-semibold text-amen-700">
            {revision
              ? "📜 최종 수정본이 준비됐어요. 복사하거나 마크다운으로 내려받으세요."
              : "결과를 복사하거나 마크다운으로 내려받을 수 있어요."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => copyText(finalMarkdown(), "final")}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-black/5"
            >
              {copied === "final" ? "복사됨!" : "수정본 복사"}
            </button>
            <button
              onClick={() => download(finalMarkdown(), "")}
              className="rounded-full bg-amen-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
            >
              수정본 .md
            </button>
            <button
              onClick={() => download(fullMarkdown(), "_full")}
              className="rounded-full border border-amen-200 bg-white px-4 py-2 text-sm font-medium text-amen-700 transition hover:bg-amen-50"
            >
              전체 과정 .md
            </button>
          </div>
        </Card>
      )}

      <p className="mt-4 text-center text-xs text-ink/40">
        AI가 생성한 설교 초안은 보조 자료입니다. 본문 해석과 교리적 판단은 반드시
        목회자 본인의 묵상과 검토를 거쳐 주세요.
      </p>
    </div>
  );
}
