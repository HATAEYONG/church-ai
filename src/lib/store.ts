"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/auth";
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

// 로그인 여부를 판단하는 헬퍼
function useCloud() {
  const { client, user } = useAuth();
  return { client, user, cloud: Boolean(client && user) };
}

// ── 기도노트 ─────────────────────────────────────────────────
function mapPrayer(r: Record<string, unknown>): PrayerNote {
  return {
    id: String(r.id),
    title: (r.title as string) ?? "",
    content: (r.content as string) ?? "",
    answered: Boolean(r.answered),
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function usePrayerNotes() {
  const { client, user, cloud } = useCloud();
  const [local, setLocal] = useCollection<PrayerNote>(KEYS.prayer);
  const [remote, setRemote] = useState<PrayerNote[]>([]);

  useEffect(() => {
    if (!cloud || !client) return;
    let active = true;
    client
      .from("prayer_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setRemote((data ?? []).map(mapPrayer));
      });
    return () => {
      active = false;
    };
  }, [cloud, client]);

  const notes = cloud ? remote : local;

  const add = useCallback(
    async (title: string, content: string) => {
      if (cloud && client && user) {
        const { data } = await client
          .from("prayer_notes")
          .insert({
            user_id: user.id,
            title: title.trim() || "오늘의 기도",
            content: content.trim(),
            answered: false,
          })
          .select()
          .single();
        if (data) setRemote((p) => [mapPrayer(data), ...p]);
        grantBadge("first-prayer");
        if (remote.length + 1 >= 7) grantBadge("prayer-7");
        return;
      }
      const note: PrayerNote = {
        id: uid(),
        title: title.trim() || "오늘의 기도",
        content: content.trim(),
        answered: false,
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<PrayerNote>(KEYS.prayer)];
      write(KEYS.prayer, next);
      setLocal(next);
      grantBadge("first-prayer");
      if (next.length >= 7) grantBadge("prayer-7");
    },
    [cloud, client, user, remote.length, setLocal],
  );

  const toggleAnswered = useCallback(
    async (id: string) => {
      if (cloud && client) {
        const target = remote.find((n) => n.id === id);
        if (!target) return;
        await client
          .from("prayer_notes")
          .update({ answered: !target.answered })
          .eq("id", id);
        setRemote((p) =>
          p.map((n) => (n.id === id ? { ...n, answered: !n.answered } : n)),
        );
        return;
      }
      const next = read<PrayerNote>(KEYS.prayer).map((n) =>
        n.id === id ? { ...n, answered: !n.answered } : n,
      );
      write(KEYS.prayer, next);
    },
    [cloud, client, remote],
  );

  const remove = useCallback(
    async (id: string) => {
      if (cloud && client) {
        await client.from("prayer_notes").delete().eq("id", id);
        setRemote((p) => p.filter((n) => n.id !== id));
        return;
      }
      const next = read<PrayerNote>(KEYS.prayer).filter((n) => n.id !== id);
      write(KEYS.prayer, next);
    },
    [cloud, client],
  );

  return { notes, add, toggleAnswered, remove };
}

// ── 감사노트 ─────────────────────────────────────────────────
function mapGratitude(r: Record<string, unknown>): GratitudeNote {
  return {
    id: String(r.id),
    content: (r.content as string) ?? "",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function useGratitudeNotes() {
  const { client, user, cloud } = useCloud();
  const [local, setLocal] = useCollection<GratitudeNote>(KEYS.gratitude);
  const [remote, setRemote] = useState<GratitudeNote[]>([]);

  useEffect(() => {
    if (!cloud || !client) return;
    let active = true;
    client
      .from("gratitude_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setRemote((data ?? []).map(mapGratitude));
      });
    return () => {
      active = false;
    };
  }, [cloud, client]);

  const notes = cloud ? remote : local;

  const add = useCallback(
    async (content: string) => {
      if (cloud && client && user) {
        const { data } = await client
          .from("gratitude_notes")
          .insert({ user_id: user.id, content: content.trim() })
          .select()
          .single();
        if (data) setRemote((p) => [mapGratitude(data), ...p]);
        grantBadge("first-gratitude");
        if (remote.length + 1 >= 7) grantBadge("gratitude-7");
        return;
      }
      const note: GratitudeNote = {
        id: uid(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<GratitudeNote>(KEYS.gratitude)];
      write(KEYS.gratitude, next);
      setLocal(next);
      grantBadge("first-gratitude");
      if (next.length >= 7) grantBadge("gratitude-7");
    },
    [cloud, client, user, remote.length, setLocal],
  );

  const remove = useCallback(
    async (id: string) => {
      if (cloud && client) {
        await client.from("gratitude_notes").delete().eq("id", id);
        setRemote((p) => p.filter((n) => n.id !== id));
        return;
      }
      const next = read<GratitudeNote>(KEYS.gratitude).filter(
        (n) => n.id !== id,
      );
      write(KEYS.gratitude, next);
    },
    [cloud, client],
  );

  return { notes, add, remove };
}

// ── 말씀 묵상 ────────────────────────────────────────────────
function mapMeditation(r: Record<string, unknown>): Meditation {
  return {
    id: String(r.id),
    passageId: "",
    reference: (r.passage as string) ?? "",
    reflection: (r.note as string) ?? "",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function useMeditations() {
  const { client, user, cloud } = useCloud();
  const [local, setLocal] = useCollection<Meditation>(KEYS.meditation);
  const [remote, setRemote] = useState<Meditation[]>([]);

  useEffect(() => {
    if (!cloud || !client) return;
    let active = true;
    client
      .from("meditations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) setRemote((data ?? []).map(mapMeditation));
      });
    return () => {
      active = false;
    };
  }, [cloud, client]);

  const notes = cloud ? remote : local;

  const add = useCallback(
    async (passageId: string, reference: string, reflection: string) => {
      if (cloud && client && user) {
        const { data } = await client
          .from("meditations")
          .insert({
            user_id: user.id,
            passage: reference,
            note: reflection.trim(),
          })
          .select()
          .single();
        if (data) setRemote((p) => [mapMeditation(data), ...p]);
        grantBadge("first-meditation");
        if (remote.length + 1 >= 7) grantBadge("meditation-7");
        return;
      }
      const note: Meditation = {
        id: uid(),
        passageId,
        reference,
        reflection: reflection.trim(),
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...read<Meditation>(KEYS.meditation)];
      write(KEYS.meditation, next);
      setLocal(next);
      grantBadge("first-meditation");
      if (next.length >= 7) grantBadge("meditation-7");
    },
    [cloud, client, user, remote.length, setLocal],
  );

  const remove = useCallback(
    async (id: string) => {
      if (cloud && client) {
        await client.from("meditations").delete().eq("id", id);
        setRemote((p) => p.filter((n) => n.id !== id));
        return;
      }
      const next = read<Meditation>(KEYS.meditation).filter((n) => n.id !== id);
      write(KEYS.meditation, next);
    },
    [cloud, client],
  );

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
