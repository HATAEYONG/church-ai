"use client";

import { Card, PageHeader, StatPill } from "@/components/ui";
import {
  sampleClass,
  sampleStudents,
  type StudentRow,
} from "@/lib/data/dashboard";
import {
  useBadges,
  useGameResults,
  useGratitudeNotes,
  useMeditations,
  usePrayerNotes,
  useStaffData,
} from "@/lib/store";

function Bar({ value, tone = "amen" }: { value: number; tone?: string }) {
  const color =
    tone === "amen"
      ? "bg-amen-500"
      : tone === "grace"
        ? "bg-grace-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-ink/55">
        {value}%
      </span>
    </div>
  );
}

// 데이터로부터 돌봄이 필요한 학생을 부드럽게 제안
function careCue(s: StudentRow): string | null {
  if (s.attendanceRate < 60) return "최근 출석이 줄었어요. 따뜻한 안부 연락을 권해요.";
  if (s.quizParticipation >= 8 && s.prayerNotes <= 2)
    return "퀴즈는 열심이지만 기도노트는 적어요. 기도 습관을 격려해 보세요.";
  if (s.gratitudeNotes >= 10 && s.meditationDone <= 3)
    return "감사를 꾸준히 적어요. 더 깊은 말씀 묵상으로 이어주면 좋아요.";
  if (s.prayerPersonAccuracy < 60)
    return "기도 인물 맞추기 정답률이 낮아요. 함께 복습해 보면 좋아요.";
  return null;
}

export default function TeacherPage() {
  const { notes: myPrayers } = usePrayerNotes();
  const { notes: myGratitude } = useGratitudeNotes();
  const { notes: myMeditations } = useMeditations();
  const myResults = useGameResults();
  const myBadges = useBadges();

  // 이 기기의 실제 활동을 "나" 행으로 추가
  const ppResults = myResults.filter((r) => r.gameType === "prayer-person");
  const ppAcc =
    ppResults.length > 0
      ? Math.round(
          (ppResults.reduce((s, r) => s + r.correct, 0) /
            ppResults.reduce((s, r) => s + r.total, 0)) *
            100,
        )
      : 0;

  const me: StudentRow = {
    id: "me",
    name: "나 (이 기기)",
    attendanceRate: 100,
    prayerNotes: myPrayers.length,
    gratitudeNotes: myGratitude.length,
    meditationDone: myMeditations.length,
    quizParticipation: myResults.filter((r) => r.gameType === "bible-quiz")
      .length,
    prayerPersonAccuracy: ppAcc,
    cardSentencePlays: myResults.filter((r) => r.gameType === "card-sentence")
      .length,
    badges: myBadges.length,
  };

  // 교직원으로 로그인하면 실제 학생 데이터를, 아니면 예시 데이터를 사용합니다.
  const { students: realStudents, isStaff } = useStaffData();
  const usingReal = Boolean(realStudents && realStudents.length > 0);
  const students = usingReal
    ? (realStudents as StudentRow[])
    : [me, ...sampleStudents];
  const avgAttendance = Math.round(
    students.reduce((s, x) => s + x.attendanceRate, 0) / students.length,
  );
  const totalPrayer = students.reduce((s, x) => s + x.prayerNotes, 0);
  const totalGratitude = students.reduce((s, x) => s + x.gratitudeNotes, 0);

  const careList = students
    .map((s) => ({ s, cue: careCue(s) }))
    .filter((x) => x.cue);

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="📊"
        title="교사용 대시보드"
        subtitle="보이지 않던 학생들의 주중 신앙 성장을 한눈에. 평가가 아닌, 더 따뜻한 돌봄을 위한 자료입니다."
      />

      <div className="mb-4 text-sm text-ink/60">
        {usingReal ? (
          <>
            우리 교회 학생 {students.length}명 · 실시간 데이터
            <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700">
              실데이터
            </span>
          </>
        ) : (
          <>
            {sampleClass.department} · {sampleClass.className} ·{" "}
            {sampleClass.teacher}
            <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">
              {isStaff ? "학생 기록 대기 중 · 예시 데이터" : "예시 데이터 + 내 활동"}
            </span>
          </>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill emoji="👥" label="반 학생" value={students.length} />
        <StatPill emoji="✅" label="평균 출석률" value={`${avgAttendance}%`} />
        <StatPill emoji="🙏" label="기도 기록 합" value={totalPrayer} />
        <StatPill emoji="💛" label="감사 기록 합" value={totalGratitude} />
      </div>

      {/* 돌봄 제안 */}
      {careList.length > 0 && (
        <Card className="mb-6 border-grace-400/30 bg-grace-500/5">
          <h2 className="flex items-center gap-2 font-bold">
            🤍 이번 주 돌봄 제안
          </h2>
          <ul className="mt-3 space-y-2">
            {careList.map(({ s, cue }) => (
              <li key={s.id} className="flex gap-2 text-sm">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="text-ink/70">— {cue}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 학생 표 */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs text-ink/50">
              <th className="px-4 py-3 font-medium">학생</th>
              <th className="px-3 py-3 font-medium">출석률</th>
              <th className="px-3 py-3 font-medium">🙏 기도</th>
              <th className="px-3 py-3 font-medium">💛 감사</th>
              <th className="px-3 py-3 font-medium">📖 묵상</th>
              <th className="px-3 py-3 font-medium">🎯 퀴즈</th>
              <th className="px-3 py-3 font-medium">🙇 기도인물 정답률</th>
              <th className="px-3 py-3 font-medium">🧩 카드</th>
              <th className="px-3 py-3 font-medium">🏅 배지</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                className={`border-b border-black/5 last:border-0 ${
                  s.id === "me" ? "bg-amen-50/50" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-3 py-3">
                  <Bar value={s.attendanceRate} />
                </td>
                <td className="px-3 py-3 tabular-nums">{s.prayerNotes}</td>
                <td className="px-3 py-3 tabular-nums">{s.gratitudeNotes}</td>
                <td className="px-3 py-3 tabular-nums">{s.meditationDone}</td>
                <td className="px-3 py-3 tabular-nums">
                  {s.quizParticipation}
                </td>
                <td className="px-3 py-3">
                  <Bar value={s.prayerPersonAccuracy} tone="grace" />
                </td>
                <td className="px-3 py-3 tabular-nums">{s.cardSentencePlays}</td>
                <td className="px-3 py-3 tabular-nums">{s.badges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-center text-xs text-ink/40">
        “보이는 기록이 더 좋은 신앙교육을 만든다.” — 이 데이터는 학생을 평가하기
        위한 것이 아니라, 더 잘 이해하고 따뜻하게 돌보기 위한 자료입니다.
      </p>
    </div>
  );
}
