"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import {
  PROVIDERS,
  DEFAULT_ORDER,
  type ProviderId,
  getStoredKey,
  getStoredAnthropicKey,
  setStoredAnthropicKey,
  clearStoredAnthropicKey,
  getStoredOpenAIKey,
  setStoredOpenAIKey,
  clearStoredOpenAIKey,
  getStoredGeminiKey,
  setStoredGeminiKey,
  clearStoredGeminiKey,
  getProviderOrder,
  setProviderOrder,
} from "@/lib/ai-config";
import {
  getStoredElevenLabsKey,
  setStoredElevenLabsKey,
  clearStoredElevenLabsKey,
} from "@/lib/elevenlabs";
import { seedDemoData, clearDemoData } from "@/lib/data/demo-seed";

interface KeyFieldProps {
  title: string;
  emoji: string;
  usedFor: string;
  link?: string;
  read: () => string;
  write: (v: string) => void;
  clear: () => void;
  onChanged?: () => void;
}

function KeyField({
  title,
  emoji,
  usedFor,
  link,
  read,
  write,
  clear,
  onChanged,
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
    onChanged?.();
  };

  const remove = () => {
    clear();
    setValue("");
    setConnected(false);
    onChanged?.();
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
      {link && (
        <p className="mt-2 text-xs text-ink/40">
          키는 이 브라우저에만 저장됩니다.{" "}
          <Link href={link} className="text-amen-600 underline">
            관련 설정 →
          </Link>
        </p>
      )}
    </Card>
  );
}

function ProviderOrderCard({ refreshKey }: { refreshKey: number }) {
  const [order, setOrder] = useState<ProviderId[]>(DEFAULT_ORDER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOrder(getProviderOrder());
    setMounted(true);
  }, [refreshKey]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setProviderOrder(next);
  };

  return (
    <Card>
      <h2 className="flex items-center gap-2 font-bold">
        <span aria-hidden>🔀</span>
        검색순서 (제공자 우선순위)
      </h2>
      <p className="mt-1 text-xs text-ink/50">
        위에서부터 순서대로, <b>키가 연결된 첫 제공자</b>를 사용합니다. 키가 하나도
        없으면 목업으로 동작합니다.
      </p>

      <div className="mt-3 space-y-2">
        {order.map((id, i) => {
          const meta = PROVIDERS.find((p) => p.id === id);
          if (!meta) return null;
          const connected = mounted && getStoredKey(id).length > 0;
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5"
            >
              <span className="shrink-0 rounded-full bg-amen-600 px-2 py-0.5 text-xs font-bold text-white">
                {i + 1}순위
              </span>
              <span className="flex min-w-0 items-center gap-1 truncate text-sm font-medium">
                <span aria-hidden>{meta.emoji}</span>
                <span className="truncate">{meta.label}</span>
              </span>
              <span
                className={`ml-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  connected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-black/5 text-ink/45"
                }`}
              >
                {connected ? "✅ 연결" : "🧪 목업"}
              </span>
              <div className="ml-auto flex shrink-0 gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="위로"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-ink/60 transition hover:bg-black/5 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  aria-label="아래로"
                  className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-ink/60 transition hover:bg-black/5 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DemoDataCard() {
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <Card className="bg-amen-50/50">
      <h2 className="flex items-center gap-2 font-bold">
        <span aria-hidden>🎬</span>
        데모 데이터 (고객 시연용)
      </h2>
      <p className="mt-1 text-xs text-ink/50">
        기도·감사·묵상·게임·배지에 샘플 기록을 채워 홈·교사·가정 화면이 완성된
        모습으로 보이게 합니다. 시연 후 비우면 깨끗한 상태로 돌아갑니다.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            seedDemoData(true);
            flash("샘플 데이터를 채웠어요. 각 메뉴에서 확인해 보세요.");
          }}
          className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amen-700"
        >
          데모 데이터 채우기
        </button>
        <button
          onClick={() => {
            clearDemoData();
            flash("데모 데이터를 비웠어요.");
          }}
          className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-black/5"
        >
          비우기
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-amen-700">{msg}</p>}
    </Card>
  );
}

export default function SettingsPage() {
  // 키 변경 시 검색순서 카드의 연결 상태를 갱신하기 위한 신호
  const [keyRev, setKeyRev] = useState(0);
  const bump = () => setKeyRev((n) => n + 1);

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
          usedFor="AI 신앙 멘토 · 설교 준비 자동화. console.anthropic.com 에서 발급."
          link="/mentor"
          read={getStoredAnthropicKey}
          write={setStoredAnthropicKey}
          clear={clearStoredAnthropicKey}
          onChanged={bump}
        />
        <KeyField
          emoji="🤖"
          title="OpenAI (GPT) 키"
          usedFor="AI 신앙 멘토 · 설교 준비 자동화. platform.openai.com 에서 발급."
          link="/mentor"
          read={getStoredOpenAIKey}
          write={setStoredOpenAIKey}
          clear={clearStoredOpenAIKey}
          onChanged={bump}
        />
        <KeyField
          emoji="🔷"
          title="Google (Gemini) 키"
          usedFor="AI 신앙 멘토 · 설교 준비 자동화. aistudio.google.com 에서 발급."
          link="/mentor"
          read={getStoredGeminiKey}
          write={setStoredGeminiKey}
          clear={clearStoredGeminiKey}
          onChanged={bump}
        />
        <ProviderOrderCard refreshKey={keyRev} />
        <KeyField
          emoji="🎙️"
          title="ElevenLabs 키"
          usedFor="음성 듣기 · 보이스 클로닝. elevenlabs.io 에서 발급."
          link="/voice-settings"
          read={getStoredElevenLabsKey}
          write={setStoredElevenLabsKey}
          clear={clearStoredElevenLabsKey}
        />
        <DemoDataCard />
      </div>

      <p className="mt-4 text-center text-xs text-ink/40">
        화이트라벨 공급: 각 기관이 자체 키를 연결해 독립적으로 운영합니다. 더 엄격한
        배포에서는 서버 환경변수로만 키를 관리할 수도 있습니다.
      </p>
    </div>
  );
}
