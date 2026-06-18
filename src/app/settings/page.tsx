"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import {
  getStoredAnthropicKey,
  setStoredAnthropicKey,
  clearStoredAnthropicKey,
} from "@/lib/ai-config";
import {
  getStoredElevenLabsKey,
  setStoredElevenLabsKey,
  clearStoredElevenLabsKey,
} from "@/lib/elevenlabs";

interface KeyFieldProps {
  title: string;
  emoji: string;
  usedFor: string;
  link: string;
  read: () => string;
  write: (v: string) => void;
  clear: () => void;
}

function KeyField({
  title,
  emoji,
  usedFor,
  link,
  read,
  write,
  clear,
}: KeyFieldProps) {
  const [value, setValue] = useState("");
  const [connected, setConnected] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const v = read();
    setValue(v);
    setConnected(v.length > 0);
    setMounted(true);
  }, [read]);

  const save = () => {
    write(value);
    setConnected(value.trim().length > 0);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = () => {
    clear();
    setValue("");
    setConnected(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold">
          <span aria-hidden>{emoji}</span>
          {title}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            mounted && connected
              ? "bg-emerald-50 text-emerald-700"
              : "bg-black/5 text-ink/50"
          }`}
        >
          {mounted && connected ? "✅ 연결됨" : "🧪 목업 모드"}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/50">{usedFor}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="API Key 붙여넣기"
          className="flex-1 rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
        />
        <button
          onClick={save}
          className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
        >
          저장
        </button>
        <button
          onClick={remove}
          className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-black/5"
        >
          삭제
        </button>
      </div>
      {saved && <p className="mt-2 text-sm text-emerald-600">저장되었습니다!</p>}
      <p className="mt-2 text-xs text-ink/40">
        키는 이 브라우저에만 저장됩니다. {link && (
          <Link href={link} className="text-amen-600 underline">
            관련 설정 →
          </Link>
        )}
      </p>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="🔧"
        title="설정 — AI 연결"
        subtitle="API 키를 연결하면 실제 AI 기능이 작동합니다. 키가 없으면 모든 기능이 데모(목업) 모드로 동작해 그대로 체험할 수 있어요."
      />

      <div className="space-y-3">
        <KeyField
          emoji="🕊️"
          title="Anthropic (Claude) 키"
          usedFor="AI 신앙 멘토 · 설교 준비 자동화에 사용됩니다. console.anthropic.com 에서 발급."
          link="/mentor"
          read={getStoredAnthropicKey}
          write={setStoredAnthropicKey}
          clear={clearStoredAnthropicKey}
        />
        <KeyField
          emoji="🎙️"
          title="ElevenLabs 키"
          usedFor="음성 듣기 · 보이스 클로닝에 사용됩니다. elevenlabs.io 에서 발급."
          link="/voice-settings"
          read={getStoredElevenLabsKey}
          write={setStoredElevenLabsKey}
          clear={clearStoredElevenLabsKey}
        />
      </div>

      <p className="mt-4 text-center text-xs text-ink/40">
        화이트라벨 공급: 각 기관이 자체 키를 연결해 독립적으로 운영합니다. 더 엄격한
        배포에서는 서버 환경변수로만 키를 관리할 수도 있습니다.
      </p>
    </div>
  );
}
