import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI 신앙교육 플랫폼",
    short_name: "신앙교육",
    description:
      "기도노트·감사노트에서 출발한 AI 기반 신앙교육 플랫폼. 말씀 묵상, 게임형 학습, AI 신앙 멘토까지.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EC",
    theme_color: "#4f46e5",
    lang: "ko",
    orientation: "portrait",
    categories: ["education", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
