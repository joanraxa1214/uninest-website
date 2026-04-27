-- =========================================================
-- UniNest Hostel Management System — Supabase SQL Schema
-- Run this in your Supabase project's SQL Editor
-- =========================================================

-- 1. ROOMS
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  room_number  text not null unique,
  type         text not null check (type in ('Single Room', 'Double Sharing', 'Triple Sharing')),
  capacity     int  not null default 1,
  price        numeric not null default 0,
  status       text not null default 'available' check (status in ('available', 'occupied')),
  created_at   timestamptz not null default now()
);

-- 2. STUDENTS
create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  cnic            text,
  phone           text,
  room_id         uuid references public.rooms(id) on delete set null,
  checkin_date    date,
  payment_status  text not null default 'pending' check (payment_status in ('paid', 'pending')),
  created_at      timestamptz not null default now()
);

-- 3. BUDGET
create table if not exists public.budget (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  description text,
  amount      numeric not null default 0,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

-- 4. INQUIRIES
create table if not exists public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  phone          text,
  email          text,
  preferred_room text,
  message        text,
  created_at     timestamptz not null default now()
);

-- 5. PRICING
create table if not exists public.pricing (
  id                uuid primary key default gen_random_uuid(),
  room_type         text not null unique check (room_type in ('Single Room', 'Double Sharing', 'Triple Sharing')),
  monthly_price     numeric not null default 0,
  security_deposit  numeric not null default 0,
  updated_at        timestamptz not null default now()
);

-- Seed default pricing
insert into public.pricing (room_type, monthly_price, security_deposit) values
  ('Single Room',    8000, 10000),
  ('Double Sharing', 5500, 8000),
  ('Triple Sharing', 4000, 6000)
on conflict (room_type) do nothing;

-- =========================================================
-- ROW LEVEL SECURITY — Enable but allow anon reads for
-- inquiries insert and pricing/rooms reads (public page)
-- =========================================================

alter table public.rooms     enable row level security;
alter table public.students  enable row level security;
alter table public.budget    enable row level security;
alter table public.inquiries enable row level security;
alter table public.pricing   enable row level security;

-- Public: anyone can INSERT an inquiry (contact form)
create policy "Anyone can submit inquiry"
  on public.inquiries for insert
  with check (true);

-- Public: anyone can read pricing (landing page)
create policy "Anyone can read pricing"
  on public.pricing for select
  using (true);

-- Public: anyone can read rooms (landing page)
create policy "Anyone can read rooms"
  on public.rooms for select
  using (true);

-- Authenticated admins: full access to all tables
create policy "Admin full access to rooms"
  on public.rooms for all
  to authenticated
  using (true) with check (true);

create policy "Admin full access to students"
  on public.students for all
  to authenticated
  using (true) with check (true);

create policy "Admin full access to budget"
  on public.budget for all
  to authenticated
  using (true) with check (true);

create policy "Admin full access to inquiries"
  on public.inquiries for all
  to authenticated
  using (true) with check (true);

create policy "Admin full access to pricing"
  on public.pricing for all
  to authenticated
  using (true) with check (true);

-- =========================================================
-- ADMIN USERS — Create via Supabase Auth Dashboard
-- Go to: Authentication > Users > Invite User, then set:
--   Email: joanraza@uninest.pk   Password: joan1214
--   Email: dogar@uninest.pk      Password: dogar1214
-- Or use any email format you prefer.
-- =========================================================
