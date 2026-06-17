"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { Card, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/supabase/auth";

const ROLES: { value: string; label: string }[] = [
  { value: "student", label: "학생/성도" },
  { value: "parent", label: "부모" },
  { value: "teacher", label: "교사" },
  { value: "admin", label: "관리자" },
];

// 내 프로필(이름·역할·부서·반) 편집 — 교사/관리자로 설정하면 대시보드가 실데이터로 전환됩니다.
function ProfilePanel({
  client,
  user,
}: {
  client: SupabaseClient;
  user: User;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [className, setClassName] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    client
      .from("profiles")
      .select("name,role,department,class_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        const d = data as {
          name?: string;
          role?: string;
          department?: string;
          class_name?: string;
        };
        setName(d.name ?? "");
        setRole(d.role ?? "student");
        setDepartment(d.department ?? "");
        setClassName(d.class_name ?? "");
      });
    return () => {
      active = false;
    };
  }, [client, user.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    await client
      .from("profiles")
      .update({
        name: name.trim(),
        role,
        department: department.trim() || null,
        class_name: className.trim() || null,
      })
      .eq("id", user.id);
    setBusy(false);
    setSaved(true);
  };

  return (
    <Card className="mt-4">
      <h2 className="font-bold">내 프로필</h2>
      <p className="mt-1 text-sm text-ink/55">
        역할을 <b>교사</b> 또는 <b>관리자</b>로 설정하면 대시보드가 우리 교회
        실데이터로 전환됩니다.
      </p>
      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-ink/60">이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream/40 px-3 py-2 outline-none focus:border-amen-400"
          />
        </label>
        <label className="text-sm">
          <span className="text-ink/60">역할</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream/40 px-3 py-2 outline-none focus:border-amen-400"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-ink/60">부서 (예: 초등부)</span>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream/40 px-3 py-2 outline-none focus:border-amen-400"
          />
        </label>
        <label className="text-sm">
          <span className="text-ink/60">반 (예: 은혜반)</span>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-cream/40 px-3 py-2 outline-none focus:border-amen-400"
          />
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-amen-700 disabled:opacity-50"
          >
            {busy ? "저장 중…" : "프로필 저장"}
          </button>
          {saved && <span className="text-sm text-emerald-700">저장됐어요 ✓</span>}
        </div>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  const { client, user, configured, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(
    null,
  );

  if (!loading && !configured) {
    return (
      <div className="animate-fade-up">
        <PageHeader emoji="🔐" title="로그인" />
        <Card>
          <p className="text-ink/70">
            현재 <b>데모 모드</b>로 동작 중입니다. 기록은 이 브라우저에만
            저장돼요. 클라우드 동기화를 사용하려면 Supabase 환경 변수를
            설정하세요. (README 참고)
          </p>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="animate-fade-up">
        <PageHeader emoji="🙆" title="내 계정" />
        <Card>
          <p className="text-ink/80">
            <b>{user.email}</b> 으로 로그인되어 있어요. 기도·감사·묵상 기록이
            클라우드에 안전하게 저장됩니다.
          </p>
          <button
            onClick={async () => {
              await client?.auth.signOut();
              router.refresh();
            }}
            className="mt-4 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink/70 transition hover:bg-black/5"
          >
            로그아웃
          </button>
        </Card>
        {client && <ProfilePanel client={client} user={user} />}
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMsg({
            kind: "ok",
            text: "확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요. (즉시 사용하려면 Supabase 인증 설정에서 이메일 확인을 끄면 됩니다.)",
          });
          setMode("signin");
        }
      } else {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setMsg({
        kind: "err",
        text:
          err instanceof Error ? err.message : "로그인 중 문제가 발생했어요.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        emoji="🔐"
        title={mode === "signin" ? "로그인" : "회원가입"}
        subtitle="로그인하면 기도·감사·묵상 기록이 클라우드에 저장되어 어느 기기에서나 이어집니다."
      />
      <Card className="max-w-md">
        <div className="mb-4 flex rounded-full bg-cream/60 p-1 text-sm font-medium">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full py-1.5 transition ${
              mode === "signin" ? "bg-white shadow-sm" : "text-ink/55"
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-1.5 transition ${
              mode === "signup" ? "bg-white shadow-sm" : "text-ink/55"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="w-full rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            className="w-full rounded-xl border border-black/10 bg-cream/40 px-4 py-2.5 outline-none focus:border-amen-400 focus:ring-2 focus:ring-amen-100"
          />
          {msg && (
            <p
              className={`rounded-xl px-3 py-2 text-sm ${
                msg.kind === "err"
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-amen-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-amen-700 disabled:opacity-50"
          >
            {busy
              ? "처리 중…"
              : mode === "signin"
                ? "로그인"
                : "회원가입"}
          </button>
        </form>
      </Card>

      <p className="mt-3 text-xs text-ink/40">
        로그인하지 않아도 데모 모드로 모든 기능을 체험할 수 있어요. (기록은 이
        브라우저에만 저장됩니다.)
      </p>
    </div>
  );
}
