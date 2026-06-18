"use client";

import { useEffect } from "react";
import { autoSeedDemoData } from "@/lib/data/demo-seed";

// 첫 방문 시 비어 있는 로컬 컬렉션에만 샘플 데이터를 한 번 채워, 고객 시연에서
// 모든 메뉴가 완성된 모습으로 보이게 합니다.
// - 빈 컬렉션만 채우므로 기존 데이터를 덮어쓰지 않습니다.
// - 한 번 시드하면(또는 사용자가 비우면) 다시 채우지 않습니다.
// - 로그인(클라우드) 사용자는 원격 데이터를 쓰므로 이 로컬 시드의 영향을 받지 않습니다.
export default function DemoSeeder() {
  useEffect(() => {
    autoSeedDemoData();
  }, []);

  return null;
}
