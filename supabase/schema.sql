-- ─────────────────────────────────────────────────────────────
-- 에이맨(A-Men) Supabase 스키마
--
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하세요.
-- 데모 모드(localStorage)에서 운영 모드로 전환할 때 사용합니다.
-- ─────────────────────────────────────────────────────────────

-- 역할: 성도/학생, 교사, 관리자, 부모
create type user_role as enum ('student', 'teacher', 'admin', 'parent');
create type game_type as enum ('bible-quiz', 'prayer-person', 'card-sentence');

-- 사용자 프로필 (auth.users 와 1:1)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role user_role not null default 'student',
  department text,
  class_name text,
  -- 부모-자녀 연결 (부모가 자녀의 활동을 볼 수 있도록)
  guardian_of uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- 기도노트
create table if not exists prayer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

-- 감사노트
create table if not exists gratitude_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 말씀 묵상 완료 기록
create table if not exists meditations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  passage text,
  note text,
  created_at timestamptz not null default now()
);

-- 게임 결과 (성경퀴즈 / 기도 인물 맞추기 / 카드문장 연결하기)
create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  game_type game_type not null,
  correct int not null default 0,
  total int not null default 0,
  created_at timestamptz not null default now()
);

-- 성장 배지
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  badge_type text not null,
  label text not null,
  emoji text not null default '🏅',
  earned_at timestamptz not null default now(),
  unique (user_id, badge_type)
);

-- AI 멘토 대화 로그 (선택)
create table if not exists mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  persona_id text not null default 'default',
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ── 인덱스 ────────────────────────────────────────────────────
create index if not exists idx_prayer_user on prayer_notes (user_id, created_at desc);
create index if not exists idx_gratitude_user on gratitude_notes (user_id, created_at desc);
create index if not exists idx_results_user on game_results (user_id, created_at desc);

-- ── Row Level Security ────────────────────────────────────────
alter table profiles enable row level security;
alter table prayer_notes enable row level security;
alter table gratitude_notes enable row level security;
alter table meditations enable row level security;
alter table game_results enable row level security;
alter table badges enable row level security;
alter table mentor_messages enable row level security;

-- 본인 데이터는 본인이 모두 관리
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own prayer" on prayer_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own gratitude" on gratitude_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own meditation" on meditations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own results" on game_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own badges" on badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own mentor msgs" on mentor_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 교사/관리자는 학생 기록을 읽을 수 있음 (대시보드용)
-- 참고: 운영 시에는 부서/반 범위로 더 좁히는 것을 권장합니다.
create policy "staff can read prayer" on prayer_notes
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "staff can read gratitude" on gratitude_notes
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

create policy "staff can read results" on game_results
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('teacher', 'admin')
    )
  );

-- 새 사용자가 가입하면 프로필 자동 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
