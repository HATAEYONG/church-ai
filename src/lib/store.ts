"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Badge,
  GameResult,
  GameType,
  GratitudeNote,
  Meditation,
  PrayerNote,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// 데모용 로컬 저장소
//
// 이 스토어는 브라우저 localStorage 에 데이터를 저장해 Supabase 없이도
// 앱이 즉시 동작하도록 합니다. 운영 환경에서는 supabase/schema.sql 의
// 테이블과 연동하도록 교체할 수 있습니다 (lib/supabase 참고).
// ─────────────────────────────────────────────────────────────

const KEYS = {
  prayer: "amen:prayers",
  gratitude: "amen:gratitude",
  meditation: "amen:meditations",
  results: "amen:results",
  badges: "amen:badges",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("amen:store-change", { detail: { key } }));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 변경 사항을 구독하는 범용 훅
function useCollection<T>(key: string): [T[], (next: T[]) => void] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    setItems(read<T>(key));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.key === key) setItems(read<T>(key));
    };
    window.addEventListener("amen:store-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("amen:store-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  const update = useCallback(
    (next: T[]) => {
      write(key, next);
      setItems(next);
    },
    [key],
  );

  return [items, update];
}

// ── 배지 부여 로직 ────────────────────────────────────────────
const BADGE_DEFS: Record<string, Omit<Badge, "id" | "earnedAt">> = {
  "first-prayer": { type: "first-prayer", label: "첫 기도 기록", emoji: "🙏" },
  "prayer-7": { type: "prayer-7", label: "기도 7일", emoji: "🕯️" },
  "first-gratitude": {
    type: "first-gratitude",
    label: "첫 감사 기록",
    emoji: "💛",
  },
  "gratitude-7": { type: "gratitude-7", label: "감사 7일", emoji: "🌻" },
  "first-meditation": {
    type: "first-meditation",
    label: "첫 말씀 묵상",
    emoji: "📖",
  },
  "meditation-7": { type: "meditation-7", label: "말씀 묵상 7일", emoji: "🌿" },
  "quiz-master": { type: "quiz-master", label: "성경퀴즈 만점", emoji: "🏆" },
  "game-first": { type: "game-first", label: "첫 게임 도전", emoji: "🎮" },
};

function grantBadge(badgeKey: keyof typeof BADGE_DEFS) {
  const badges = read<Badge>(KEYS.badges);
  if (badges.some((b) => b.type === badgeKey)) return;
  const def = BADGE_DEFS[badgeKey];
  badges.push({ ...def, id: uid(), earnedAt: new Date().toISOString() });
  write(KEYS.badges, badges);
}

// ── 기도노트 ─────────────────────────────────────────────────
export function usePrayerNotes() {
  const [notes, setNotes] = useCollection<PrayerNote>(KEYS.prayer);

  const add = useCallback(
    (title: string, content: string) => {
      const note: PrayerNote = {
        id: uid(),
        title: title.trim(),
        content: content.trim(),
        answered: false,
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<PrayerNote>(KEYS.prayer)];
      write(KEYS.prayer, next);
      setNotes(next);
      grantBadge("first-prayer");
      if (next.length >= 7) grantBadge("prayer-7");
    },
    [setNotes],
  );

  const toggleAnswered = useCallback((id: string) => {
    const next = read<PrayerNote>(KEYS.prayer).map((n) =>
      n.id === id ? { ...n, answered: !n.answered } : n,
    );
    write(KEYS.prayer, next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read<PrayerNote>(KEYS.prayer).filter((n) => n.id !== id);
    write(KEYS.prayer, next);
  }, []);

  return { notes, add, toggleAnswered, remove };
}

// ── 감사노트 ─────────────────────────────────────────────────
export function useGratitudeNotes() {
  const [notes, setNotes] = useCollection<GratitudeNote>(KEYS.gratitude);

  const add = useCallback(
    (content: string) => {
      const note: GratitudeNote = {
        id: uid(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<GratitudeNote>(KEYS.gratitude)];
      write(KEYS.gratitude, next);
      setNotes(next);
      grantBadge("first-gratitude");
      if (next.length >= 7) grantBadge("gratitude-7");
    },
    [setNotes],
  );

  const remove = useCallback((id: string) => {
    const next = read<GratitudeNote>(KEYS.gratitude).filter((n) => n.id !== id);
    write(KEYS.gratitude, next);
  }, []);

  return { notes, add, remove };
}

// ── 말씀 묵상 ────────────────────────────────────────────────
export function useMeditations() {
  const [notes, setNotes] = useCollection<Meditation>(KEYS.meditation);

  const add = useCallback(
    (passageId: string, reference: string, reflection: string) => {
      const note: Meditation = {
        id: uid(),
        passageId,
        reference,
        reflection: reflection.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<Meditation>(KEYS.meditation)];
      write(KEYS.meditation, next);
      setNotes(next);
      grantBadge("first-meditation");
      if (next.length >= 7) grantBadge("meditation-7");
    },
    [setNotes],
  );

  const remove = useCallback((id: string) => {
    const next = read<Meditation>(KEYS.meditation).filter((n) => n.id !== id);
    write(KEYS.meditation, next);
  }, []);

  return { notes, add, remove };
}

// ── 게임 결과 ────────────────────────────────────────────────
export function useGameResults() {
  const [results] = useCollection<GameResult>(KEYS.results);
  return results;
}

export function recordGameResult(
  gameType: GameType,
  correct: number,
  total: number,
) {
  const result: GameResult = {
    id: uid(),
    gameType,
    correct,
    total,
    createdAt: new Date().toISOString(),
  };
  const next = [result, ...read<GameResult>(KEYS.results)];
  write(KEYS.results, next);
  grantBadge("game-first");
  if (gameType === "bible-quiz" && total > 0 && correct === total) {
    grantBadge("quiz-master");
  }
}

// ── 배지 ─────────────────────────────────────────────────────
export function useBadges() {
  const [badges] = useCollection<Badge>(KEYS.badges);
  return badges;
}
