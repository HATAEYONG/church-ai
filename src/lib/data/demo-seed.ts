// 고객 시연용 데모 데이터 시드
//
// 새 브라우저(고객 기기)에서 기도·감사·묵상·게임·배지가 비어 있으면 홈·교사·가정
// 화면이 허전해 보입니다. 데모 모드(로컬)에서 첫 방문 시 현실적인 샘플을 한 번
// 채워 모든 메뉴가 완성된 모습으로 보이게 합니다. (사용자가 비우면 다시 채우지 않음)

import type {
  Badge,
  GameResult,
  GameType,
  GratitudeNote,
  Meditation,
  PrayerNote,
} from "@/lib/types";

const KEYS = {
  prayer: "amen:prayers",
  gratitude: "amen:gratitude",
  meditation: "amen:meditations",
  results: "amen:results",
  badges: "amen:badges",
} as const;

export const DEMO_SEED_FLAG = "amen:demo-seeded";

let seq = 0;
function uid(): string {
  seq += 1;
  return `demo-${Date.now().toString(36)}-${seq}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// n일 전(시각은 적당히 분산)의 ISO 문자열
function daysAgo(n: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, (n * 7) % 60, 0, 0);
  return d.toISOString();
}

function buildPrayers(): PrayerNote[] {
  return [
    { title: "가족을 위한 기도", content: "엄마 아빠가 늘 건강하고 우리 가족이 화목하게 지내게 해주세요.", answered: false, createdAt: daysAgo(0, 8) },
    { title: "시험 잘 보게 해주세요", content: "열심히 준비한 만큼 마음 졸이지 않고 시험을 잘 볼 수 있게 도와주세요.", answered: false, createdAt: daysAgo(0, 20) },
    { title: "친구와 화해하기", content: "다툰 친구와 다시 잘 지내고 싶어요. 먼저 사과할 용기를 주세요.", answered: true, createdAt: daysAgo(2) },
    { title: "주일학교 친구들", content: "우리 반 친구들이 모두 예수님을 더 사랑하게 되길 기도해요.", answered: false, createdAt: daysAgo(4) },
    { title: "아픈 할머니", content: "할머니가 빨리 나으셔서 같이 교회에 갈 수 있게 해주세요.", answered: true, createdAt: daysAgo(6) },
  ].map((p) => ({ id: uid(), ...p }));
}

function buildGratitude(): GratitudeNote[] {
  return [
    { content: "오늘 급식이 정말 맛있었어요. 감사합니다!", createdAt: daysAgo(0, 13) },
    { content: "친구가 준비물을 빌려줘서 고마웠어요.", createdAt: daysAgo(0, 17) },
    { content: "비 온 뒤에 무지개를 봤어요. 하나님이 만드신 게 멋져요.", createdAt: daysAgo(1) },
    { content: "가족과 함께 저녁을 먹으며 많이 웃었어요.", createdAt: daysAgo(2) },
    { content: "주일학교 선생님이 칭찬해 주셔서 기뻤어요.", createdAt: daysAgo(3) },
    { content: "오늘도 건강하게 하루를 보낼 수 있어서 감사해요.", createdAt: daysAgo(5) },
  ].map((g) => ({ id: uid(), ...g }));
}

function buildMeditations(): Meditation[] {
  return [
    { reference: "빌립보서 4:6-7", reflection: "걱정될 때 먼저 기도하기로 했어요. 마음이 한결 편해졌어요.", createdAt: daysAgo(0, 7) },
    { reference: "시편 23:1", reflection: "하나님이 나의 목자시라는 말씀이 참 든든했어요.", createdAt: daysAgo(1) },
    { reference: "마태복음 5:9", reflection: "화평하게 하는 사람이 되고 싶다는 마음이 들었어요.", createdAt: daysAgo(3) },
    { reference: "요한복음 3:16", reflection: "하나님이 나를 사랑하셔서 예수님을 보내주셨다는 게 감사해요.", createdAt: daysAgo(5) },
  ].map((m) => ({ id: uid(), passageId: "", ...m }));
}

function buildResults(): GameResult[] {
  const rows: { gameType: GameType; correct: number; total: number; createdAt: string }[] = [
    { gameType: "bible-quiz", correct: 5, total: 5, createdAt: daysAgo(0, 16) },
    { gameType: "prayer-person", correct: 3, total: 4, createdAt: daysAgo(1) },
    { gameType: "card-sentence", correct: 1, total: 1, createdAt: daysAgo(2) },
    { gameType: "bible-quiz", correct: 4, total: 5, createdAt: daysAgo(4) },
    { gameType: "prayer-person", correct: 4, total: 4, createdAt: daysAgo(6) },
  ];
  return rows.map((r) => ({ id: uid(), ...r }));
}

function buildBadges(): Badge[] {
  return [
    { type: "first-prayer", label: "첫 기도 기록", emoji: "🙏", earnedAt: daysAgo(6) },
    { type: "first-gratitude", label: "첫 감사 기록", emoji: "💛", earnedAt: daysAgo(5) },
    { type: "first-meditation", label: "첫 말씀 묵상", emoji: "📖", earnedAt: daysAgo(5) },
    { type: "game-first", label: "첫 게임 도전", emoji: "🎮", earnedAt: daysAgo(4) },
    { type: "quiz-master", label: "성경퀴즈 만점", emoji: "🏆", earnedAt: daysAgo(0, 16) },
  ].map((b) => ({ id: uid(), ...b }));
}

function write(key: string, value: unknown[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isEmptyKey(key: string): boolean {
  const raw = window.localStorage.getItem(key);
  if (!raw) return true;
  try {
    return (JSON.parse(raw) as unknown[]).length === 0;
  } catch {
    return true;
  }
}

// 변경을 스토어 훅에 알려 즉시 다시 읽게 합니다.
function notify() {
  window.dispatchEvent(new CustomEvent("amen:store-change"));
  window.dispatchEvent(new CustomEvent("amen:cloud-refresh"));
}

// force=false: 비어 있는 컬렉션만 채움(사용자 데이터 보존). force=true: 모두 덮어씀.
export function seedDemoData(force = false): void {
  if (typeof window === "undefined") return;
  seq = 0;
  const data: Record<string, unknown[]> = {
    [KEYS.prayer]: buildPrayers(),
    [KEYS.gratitude]: buildGratitude(),
    [KEYS.meditation]: buildMeditations(),
    [KEYS.results]: buildResults(),
    [KEYS.badges]: buildBadges(),
  };
  let wrote = false;
  for (const key of Object.values(KEYS)) {
    if (force || isEmptyKey(key)) {
      write(key, data[key]);
      wrote = true;
    }
  }
  window.localStorage.setItem(DEMO_SEED_FLAG, "1");
  if (wrote) notify();
}

export function clearDemoData(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(KEYS)) window.localStorage.removeItem(key);
  window.localStorage.removeItem(DEMO_SEED_FLAG);
  notify();
}

// 첫 방문(시드 플래그 없음)에만 자동으로 채웁니다.
export function autoSeedDemoData(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(DEMO_SEED_FLAG)) return;
  seedDemoData(false);
}
