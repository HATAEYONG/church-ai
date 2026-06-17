// 가정 신앙 대화 콘텐츠
//
// 기사의 "부모와 가정을 연결하는 신앙교육" 구상을 구현합니다.
// 자녀가 배운 성경 인물·기도를 가정의 신앙 대화로 자연스럽게 이어줍니다.

export interface FamilyTalkCard {
  id: string;
  person: string;
  emoji: string;
  learned: string; // 자녀가 배운 핵심
  starter: string; // 부모가 건넬 수 있는 대화 시작 문장
  reference: string;
}

export const familyTalkCards: FamilyTalkCard[] = [
  {
    id: "ft-hannah",
    person: "한나",
    emoji: "🌷",
    learned: "속상할 때 하나님께 마음을 드리는 기도",
    starter:
      "“한나는 속상할 때 하나님께 마음을 드렸대. 우리도 오늘 하나님께 마음을 말해볼까?”",
    reference: "사무엘상 1장",
  },
  {
    id: "ft-david",
    person: "다윗",
    emoji: "🎵",
    learned: "두려운 순간에도 하나님을 의지하는 믿음",
    starter:
      "“다윗은 큰 골리앗 앞에서도 하나님을 믿었대. 너는 요즘 어떤 게 제일 크게 느껴져?”",
    reference: "사무엘상 17장",
  },
  {
    id: "ft-daniel",
    person: "다니엘",
    emoji: "🦁",
    learned: "어려운 상황에서도 이어가는 기도 습관",
    starter:
      "“다니엘은 힘든 때에도 매일 기도했대. 우리 가족도 오늘 같이 기도해볼까?”",
    reference: "다니엘 6장",
  },
  {
    id: "ft-solomon",
    person: "솔로몬",
    emoji: "👑",
    learned: "부와 권력보다 지혜를 먼저 구한 기도",
    starter:
      "“솔로몬은 하나님께 지혜를 구했대. 너는 하나님께 가장 먼저 무엇을 구하고 싶어?”",
    reference: "열왕기상 3장",
  },
];

// 가정 예배 가이드 팁
export const familyWorshipTips: string[] = [
  "하루 5분, 자녀가 오늘 기록한 감사 한 가지를 함께 나눠보세요.",
  "자녀가 묵상한 말씀을 부모도 함께 읽고 한 문장으로 느낌을 나눠보세요.",
  "잠들기 전, 가족이 돌아가며 한 가지씩 기도 제목을 말하고 함께 기도해요.",
  "주일에 배운 이야기를 자녀가 부모에게 들려주도록 질문해 주세요.",
];
