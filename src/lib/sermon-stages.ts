// 설교 자동화 파이프라인 — 단계 메타데이터 & 스트림 마커
//
// 이 파일은 클라이언트/서버 공용이며, 실제 프롬프트는 포함하지 않습니다.
// (프롬프트 본문은 서버 전용 모듈 sermon-pipeline.ts 에만 둡니다.)

export type SermonStageId =
  | "theme"
  | "structure"
  | "draft"
  | "critique"
  | "revision";

export interface SermonStageMeta {
  id: SermonStageId;
  title: string;
  emoji: string;
  desc: string;
}

// 파이프라인 진행 순서
export const SERMON_STAGE_META: SermonStageMeta[] = [
  { id: "theme", title: "주제 설정", emoji: "🎯", desc: "본문 주해 → 중심 사상·설교 주제" },
  { id: "structure", title: "구조 분석", emoji: "🧱", desc: "서론·본론·결론 개요 설계" },
  { id: "draft", title: "초안 작성", emoji: "✍️", desc: "회중 눈높이의 설교문 초안" },
  { id: "critique", title: "다각적 비평", emoji: "🔍", desc: "본문·신학·적용·구조 4관점 점검" },
  { id: "revision", title: "수정본", emoji: "📜", desc: "비평을 반영한 최종 원고" },
];

// 스트림 안에서 단계 전환을 표시하는 마커.
// 일반 설교 텍스트에 나타날 가능성이 거의 없는 형태를 사용합니다.
export function sermonStageMarker(id: string): string {
  return `[[SERMON_STAGE:${id}]]`;
}

// 클라이언트가 누적 스트림을 단계별로 분해할 때 쓰는 정규식(캡처 그룹 = 단계 id).
export const SERMON_STAGE_SPLIT_RE = /\[\[SERMON_STAGE:(\w+)\]\]/;
