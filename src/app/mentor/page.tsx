"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { MENTOR_PERSONAS } from "@/lib/mentor-prompt";
import { useMentorChat } from "@/lib/store";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "기도가 잘 안 될 때 어떻게 해야 할까요?",
  "오늘 읽은 말씀을 어떻게 삶에 적용할 수 있을까요?",
  "감사한 마음이 잘 생기지 않아요.",
];

export default function MentorPage() {
  const { history, loaded, save, clear, cloud } = useMentorChat();
  const [personaId, setPersonaId] = useState("default");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const persona = MENTOR_PERSONAS.find((p) => p.id === personaId)!;

  // 로그인 사용자는 지난 대화를 불러와 이어갑니다.
  useEffect(() => {
    if (loaded && !seeded && history.length > 0) {
      setMessages(history);
      setSeeded(true);
    }
  }, [loaded, seeded, history]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();
    void save(personaId, "user", content);

    // 멘토 응답 자리를 먼저 만들어 스트리밍으로 채웁니다.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    let assistantContent = "";
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, personaId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "멘토 응답을 불러오지 못했어요.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + chunk,
            };
            return copy;
          });
          scrollToBottom();
        }
      }
      if (assistantContent.trim()) {
        void save(personaId, "assistant", assistantContent);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${message}` };
        return copy;
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="🕊️"
        title="AI 신앙 멘토"
        subtitle="성경 인물과 대화하며 묵상 질문을 정리해 보세요. AI는 성경을 대체하지 않는 보조 도구예요."
      />

      {/* 페르소나 선택 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {MENTOR_PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersonaId(p.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              personaId === p.id
                ? "bg-amen-600 text-white shadow-sm"
                : "border border-black/10 bg-white text-ink/70 hover:bg-black/5"
            }`}
            title={p.blurb}
          >
            <span aria-hidden>{p.emoji}</span> {p.name}
          </button>
        ))}
      </div>

      {/* 저장 상태 */}
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-ink/50">
        {cloud ? (
          <>
            <span>💾 대화가 내 계정에 저장돼 다음에 이어서 볼 수 있어요.</span>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  clear();
                  setMessages([]);
                }}
                className="shrink-0 rounded-full border border-black/10 px-3 py-1 font-medium text-ink/55 transition hover:bg-black/5"
              >
                기록 지우기
              </button>
            )}
          </>
        ) : (
          <span>
            대화를 저장하려면{" "}
            <Link href="/login" className="text-amen-600 underline">
              로그인
            </Link>
            하세요. (현재는 이 세션에서만 유지됩니다)
          </span>
        )}
      </div>

      {/* 대화 영역 */}
      <div
        ref={scrollRef}
        className="no-scrollbar mb-4 h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
      >
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="text-4xl" aria-hidden>
                {persona.emoji}
              </div>
              <p className="mt-2 font-semibold">{persona.name}와 대화해요</p>
              <p className="mt-1 text-sm text-ink/55">{persona.blurb}</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-amen-600 text-white"
                    : "bg-cream text-ink"
                }`}
              >
                {m.content || (
                  <span className="inline-flex gap-1 text-ink/40">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:150ms]">
                      ●
                    </span>
                    <span className="animate-pulse [animation-delay:300ms]">
                      ●
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 추천 질문 */}
      {messages.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-ink/60 transition hover:border-amen-300 hover:text-amen-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 입력 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="묵상하고 싶은 것이나 신앙적 고민을 적어보세요…"
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-2xl bg-amen-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-amen-700 disabled:opacity-40"
        >
          보내기
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-ink/40">
        AI 멘토는 성경 묵상과 기도 습관 형성을 돕는 보조 도구입니다. 교리적 판단이나
        깊은 고민은 목회자·부모님과 나누어요.
      </p>
    </div>
  );
}
