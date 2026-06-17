// 에이맨 공통 타입 정의

export type Role = "student" | "teacher" | "admin" | "parent";

export interface PrayerNote {
  id: string;
  title: string;
  content: string;
  answered: boolean;
  createdAt: string; // ISO
}

export interface GratitudeNote {
  id: string;
  content: string;
  createdAt: string; // ISO
}

export interface Meditation {
  id: string;
  passageId: string;
  reference: string;
  reflection: string; // 사용자가 작성한 묵상
  createdAt: string; // ISO
}

export type GameType = "bible-quiz" | "prayer-person" | "card-sentence";

export interface GameResult {
  id: string;
  gameType: GameType;
  correct: number;
  total: number;
  createdAt: string; // ISO
}

export interface Badge {
  id: string;
  type: string; // 예: "first-prayer", "gratitude-7", "quiz-master"
  label: string;
  emoji: string;
  earnedAt: string; // ISO
}

// ── 게임 콘텐츠 ──────────────────────────────────────────────

export interface BibleQuiz {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reflection: string; // 오늘의 묵상 질문
  reference: string; // 성경 본문 근거
}

export interface PrayerPersonCard {
  id: string;
  prayer: string; // 기도문
  options: string[]; // 인물 보기
  answerIndex: number;
  explanation: string;
  reflection: string;
  reference: string;
}

export interface CardSentence {
  id: string;
  reference: string;
  // 학생이 올바른 순서로 연결해야 하는 말씀 조각 (정답 순서)
  fragments: string[];
  hint: string;
}
