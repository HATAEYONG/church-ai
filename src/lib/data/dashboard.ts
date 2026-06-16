// 대시보드 예시 데이터
//
// 교사·관리자 대시보드의 개념을 보여주기 위한 샘플 데이터입니다.
// 운영 환경에서는 Supabase 의 집계 쿼리로 대체됩니다.

export interface StudentRow {
  id: string;
  name: string;
  attendanceRate: number; // 0-100, 최근 4주 출석률
  prayerNotes: number;
  gratitudeNotes: number;
  meditationDone: number; // 말씀 묵상 완료 수
  quizParticipation: number;
  prayerPersonAccuracy: number; // 0-100
  cardSentencePlays: number;
  badges: number;
}

export const sampleClass = {
  department: "주일학교 초등부",
  className: "은혜반",
  teacher: "김믿음 교사",
};

export const sampleStudents: StudentRow[] = [
  {
    id: "s1",
    name: "이사랑",
    attendanceRate: 100,
    prayerNotes: 12,
    gratitudeNotes: 18,
    meditationDone: 9,
    quizParticipation: 14,
    prayerPersonAccuracy: 92,
    cardSentencePlays: 6,
    badges: 5,
  },
  {
    id: "s2",
    name: "박소망",
    attendanceRate: 75,
    prayerNotes: 2,
    gratitudeNotes: 14,
    meditationDone: 5,
    quizParticipation: 11,
    prayerPersonAccuracy: 68,
    cardSentencePlays: 3,
    badges: 3,
  },
  {
    id: "s3",
    name: "최기쁨",
    attendanceRate: 90,
    prayerNotes: 8,
    gratitudeNotes: 3,
    meditationDone: 7,
    quizParticipation: 13,
    prayerPersonAccuracy: 80,
    cardSentencePlays: 5,
    badges: 4,
  },
  {
    id: "s4",
    name: "정믿음",
    attendanceRate: 50,
    prayerNotes: 1,
    gratitudeNotes: 1,
    meditationDone: 2,
    quizParticipation: 3,
    prayerPersonAccuracy: 45,
    cardSentencePlays: 1,
    badges: 1,
  },
  {
    id: "s5",
    name: "한온유",
    attendanceRate: 100,
    prayerNotes: 6,
    gratitudeNotes: 9,
    meditationDone: 8,
    quizParticipation: 12,
    prayerPersonAccuracy: 88,
    cardSentencePlays: 4,
    badges: 4,
  },
];

// ── 관리자: 부서별 집계 ──────────────────────────────────────
export interface DepartmentRow {
  id: string;
  name: string;
  members: number;
  activeRate: number; // 주중 활동 참여율 0-100
  prayerTotal: number;
  gratitudeTotal: number;
  meditationRate: number; // 말씀 묵상 완료율 0-100
}

export const sampleDepartments: DepartmentRow[] = [
  {
    id: "d1",
    name: "유년부",
    members: 32,
    activeRate: 71,
    prayerTotal: 184,
    gratitudeTotal: 240,
    meditationRate: 64,
  },
  {
    id: "d2",
    name: "초등부",
    members: 48,
    activeRate: 82,
    prayerTotal: 356,
    gratitudeTotal: 412,
    meditationRate: 78,
  },
  {
    id: "d3",
    name: "중등부",
    members: 40,
    activeRate: 58,
    prayerTotal: 168,
    gratitudeTotal: 150,
    meditationRate: 49,
  },
  {
    id: "d4",
    name: "고등부",
    members: 35,
    activeRate: 64,
    prayerTotal: 142,
    gratitudeTotal: 138,
    meditationRate: 55,
  },
  {
    id: "d5",
    name: "청년부",
    members: 60,
    activeRate: 69,
    prayerTotal: 410,
    gratitudeTotal: 388,
    meditationRate: 61,
  },
];
