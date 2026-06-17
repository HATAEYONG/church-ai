"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
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

// 클라우드(Supabase) 변경을 다른 훅에 알려 재조회하게 합니다.
function notifyCloud() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("amen:cloud-refresh"));
}

// 클라우드에 배지를 부여합니다(중복은 무시).
async function grantBadgeCloud(
  client: SupabaseClient,
  userId: string,
  badgeKey: keyof typeof BADGE_DEFS,
) {
  const def = BADGE_DEFS[badgeKey];
  await client
    .from("badges")
    .upsert(
      {
        user_id: userId,
        badge_type: def.type,
        label: def.label,
        emoji: def.emoji,
      },
      { onConflict: "user_id,badge_type", ignoreDuplicates: true },
    );
  notifyCloud();
}

// 클라우드 재조회 이벤트를 구독하는 헬퍼
function useCloudRefresh(refetch: () => void) {
  useEffect(() => {
    const h = () => refetch();
    window.addEventListener("amen:cloud-refresh", h);
    return () => window.removeEventListener("amen:cloud-refresh", h);
  }, [refetch]);
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
        await grantBadgeCloud(client, user.id, "first-prayer");
        if (remote.length + 1 >= 7)
          await grantBadgeCloud(client, user.id, "prayer-7");
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
        await grantBadgeCloud(client, user.id, "first-gratitude");
        if (remote.length + 1 >= 7)
          await grantBadgeCloud(client, user.id, "gratitude-7");
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
        await grantBadgeCloud(client, user.id, "first-meditation");
        if (remote.length + 1 >= 7)
          await grantBadgeCloud(client, user.id, "meditation-7");
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
function mapResult(r: Record<string, unknown>): GameResult {
  return {
    id: String(r.id),
    gameType: r.game_type as GameType,
    correct: Number(r.correct ?? 0),
    total: Number(r.total ?? 0),
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export function useGameResults() {
  const { client, cloud } = useCloud();
  const [local] = useCollection<GameResult>(KEYS.results);
  const [remote, setRemote] = useState<GameResult[]>([]);

  const refetch = useCallback(() => {
    if (!cloud || !client) return;
    client
      .from("game_results")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRemote((data ?? []).map(mapResult)));
  }, [cloud, client]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  useCloudRefresh(refetch);

  return cloud ? remote : local;
}

// 게임 결과 기록 — 로그인 시 Supabase, 아니면 localStorage
export function useRecordGameResult() {
  const { client, user, cloud } = useCloud();

  return useCallback(
    async (gameType: GameType, correct: number, total: number) => {
      if (cloud && client && user) {
        await client.from("game_results").insert({
          user_id: user.id,
          game_type: gameType,
          correct,
          total,
        });
        await grantBadgeCloud(client, user.id, "game-first");
        if (gameType === "bible-quiz" && total > 0 && correct === total) {
          await grantBadgeCloud(client, user.id, "quiz-master");
        }
        notifyCloud();
        return;
      }
      const result: GameResult = {
        id: uid(),
        gameType,
        correct,
        total,
        createdAt: new Date().toISOString(),
      };
      write(KEYS.results, [result, ...read<GameResult>(KEYS.results)]);
      grantBadge("game-first");
      if (gameType === "bible-quiz" && total > 0 && correct === total) {
        grantBadge("quiz-master");
      }
    },
    [cloud, client, user],
  );
}

// ── 배지 ─────────────────────────────────────────────────────
function mapBadge(r: Record<string, unknown>): Badge {
  return {
    id: String(r.id),
    type: (r.badge_type as string) ?? "",
    label: (r.label as string) ?? "",
    emoji: (r.emoji as string) ?? "🏅",
    earnedAt: (r.earned_at as string) ?? new Date().toISOString(),
  };
}

export function useBadges() {
  const { client, cloud } = useCloud();
  const [local] = useCollection<Badge>(KEYS.badges);
  const [remote, setRemote] = useState<Badge[]>([]);

  const refetch = useCallback(() => {
    if (!cloud || !client) return;
    client
      .from("badges")
      .select("*")
      .order("earned_at", { ascending: false })
      .then(({ data }) => setRemote((data ?? []).map(mapBadge)));
  }, [cloud, client]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  useCloudRefresh(refetch);

  return cloud ? remote : local;
}

// ── AI 멘토 대화 ─────────────────────────────────────────────
export interface MentorMsg {
  role: "user" | "assistant";
  content: string;
}

// 로그인 시 멘토 대화를 Supabase 에 저장/복원합니다.
// 로그아웃 상태에서는 저장하지 않고 세션 중에만 유지됩니다.
export function useMentorChat() {
  const { client, user, cloud } = useCloud();
  const [history, setHistory] = useState<MentorMsg[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!cloud || !client) {
      setLoaded(true);
      return;
    }
    let active = true;
    client
      .from("mentor_messages")
      .select("role,content,created_at")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setHistory(
          (data ?? []).map((r) => ({
            role: (r as { role: "user" | "assistant" }).role,
            content: (r as { content: string }).content,
          })),
        );
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [cloud, client]);

  const save = useCallback(
    async (personaId: string, role: "user" | "assistant", content: string) => {
      if (cloud && client && user) {
        await client.from("mentor_messages").insert({
          user_id: user.id,
          persona_id: personaId,
          role,
          content,
        });
      }
    },
    [cloud, client, user],
  );

  const clear = useCallback(async () => {
    if (cloud && client && user) {
      await client.from("mentor_messages").delete().eq("user_id", user.id);
    }
    setHistory([]);
  }, [cloud, client, user]);

  return { history, loaded, save, clear, cloud };
}
