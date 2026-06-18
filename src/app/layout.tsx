import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import PWARegister from "@/components/PWARegister";
import DemoSeeder from "@/components/DemoSeeder";
import { AuthProvider } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "AI 신앙교육 플랫폼",
  description:
    "기도노트·감사노트에서 출발한 AI 기반 신앙교육 플랫폼. 게임형 학습, AI 신앙 멘토, 교사·관리자 대시보드까지.",
  applicationName: "신앙교육",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "신앙교육",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <PWARegister />
          <DemoSeeder />
          <NavBar />
          <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
          <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-center text-xs text-ink/40">
            기도는 기록될 때 신앙의 여정이 되고, 감사는 남겨질 때 은혜의 기억이
            됩니다.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
