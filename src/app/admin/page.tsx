"use client";

import { Card, PageHeader, StatPill } from "@/components/ui";
import { sampleDepartments } from "@/lib/data/dashboard";

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-black/5">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-ink/55">
        {value}%
      </span>
    </div>
  );
}

export default function AdminPage() {
  const totalMembers = sampleDepartments.reduce((s, d) => s + d.members, 0);
  const totalPrayer = sampleDepartments.reduce((s, d) => s + d.prayerTotal, 0);
  const totalGratitude = sampleDepartments.reduce(
    (s, d) => s + d.gratitudeTotal,
    0,
  );
  const avgActive = Math.round(
    sampleDepartments.reduce((s, d) => s + d.activeRate, 0) /
      sampleDepartments.length,
  );

  const mostActive = [...sampleDepartments].sort(
    (a, b) => b.activeRate - a.activeRate,
  )[0];
  const needsCare = [...sampleDepartments].sort(
    (a, b) => a.meditationRate - b.meditationRate,
  )[0];

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="⚙️"
        title="관리자 대시보드"
        subtitle="교회 전체의 신앙교육과 돌봄을 통합적으로 지원하는 디지털 목회 지원 시스템입니다."
      />

      <div className="mb-4">
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-ink/50">
          예시 데이터 · 중문교회
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill emoji="🧑‍🤝‍🧑" label="전체 인원" value={totalMembers} />
        <StatPill emoji="📈" label="평균 참여율" value={`${avgActive}%`} />
        <StatPill emoji="🙏" label="기도 기록" value={totalPrayer} />
        <StatPill emoji="💛" label="감사 기록" value={totalGratitude} />
      </div>

      {/* 목회적 인사이트 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card className="border-emerald-400/30 bg-emerald-50/40">
          <p className="text-sm font-semibold text-emerald-700">
            🌟 가장 활발한 부서
          </p>
          <p className="mt-1 text-xl font-bold">{mostActive.name}</p>
          <p className="mt-1 text-sm text-ink/60">
            주중 참여율 {mostActive.activeRate}% — 다른 부서와 나눌 좋은 사례가
            될 수 있어요.
          </p>
        </Card>
        <Card className="border-grace-400/30 bg-grace-500/5">
          <p className="text-sm font-semibold text-grace-600">
            🤍 격려가 필요한 부서
          </p>
          <p className="mt-1 text-xl font-bold">{needsCare.name}</p>
          <p className="mt-1 text-sm text-ink/60">
            말씀 묵상 완료율 {needsCare.meditationRate}% — 묵상 콘텐츠와 돌봄에
            더 관심을 기울이면 좋아요.
          </p>
        </Card>
      </div>

      {/* 부서별 표 */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs text-ink/50">
              <th className="px-4 py-3 font-medium">부서</th>
              <th className="px-3 py-3 font-medium">인원</th>
              <th className="px-3 py-3 font-medium">주중 참여율</th>
              <th className="px-3 py-3 font-medium">말씀 묵상 완료율</th>
              <th className="px-3 py-3 font-medium">🙏 기도</th>
              <th className="px-3 py-3 font-medium">💛 감사</th>
            </tr>
          </thead>
          <tbody>
            {sampleDepartments.map((d) => (
              <tr
                key={d.id}
                className="border-b border-black/5 last:border-0"
              >
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-3 py-3 tabular-nums">{d.members}</td>
                <td className="px-3 py-3">
                  <Bar value={d.activeRate} tone="bg-amen-500" />
                </td>
                <td className="px-3 py-3">
                  <Bar value={d.meditationRate} tone="bg-emerald-500" />
                </td>
                <td className="px-3 py-3 tabular-nums">{d.prayerTotal}</td>
                <td className="px-3 py-3 tabular-nums">{d.gratitudeTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-center text-xs text-ink/40">
        관리자 대시보드는 교회를 데이터로 통제하는 시스템이 아니라, 성도와 다음
        세대를 더 섬세하게 돌볼 수 있도록 돕는 디지털 목회 지원 시스템입니다.
      </p>
    </div>
  );
}
