-- =========================================================
-- HOSTEL MANAGEMENT SYSTEM
-- FINAL REFINED DATABASE STRUCTURE (Single Hostel Version)
-- =========================================================

-- Clear existing schema (Drop in correct order to avoid FK errors)
drop table if exists public.room_allocations cascade;
drop table if exists public.payments cascade;
drop table if exists public.expenses cascade;
drop table if exists public.transactions cascade;
drop table if exists public.accounts cascade;
drop table if exists public.students cascade;
drop table if exists public.rooms cascade;
drop table if exists public.pricing cascade;
drop table if exists public.inquiries cascade;
drop table if exists public.users cascade;

-- =========================================================
-- 1. ROOMS
-- =========================================================
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  type text not null check (type in ('Single Room', 'Double Sharing', 'Triple Sharing')),
  capacity int not null default 1,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 2. STUDENTS
-- =========================================================
create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnic text unique,
  phone text,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  is_active boolean not null default true,
  last_payment_date date,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 3. ROOM_ALLOCATIONS
-- =========================================================
create table public.room_allocations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  checkin_date date not null default current_date,
  checkout_date date,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 4. PRICING
-- =========================================================
create table public.pricing (
  id uuid primary key default gen_random_uuid(),
  room_type text not null unique check (room_type in ('Single Room', 'Double Sharing', 'Triple Sharing')),
  monthly_rent numeric not null default 0,
  security_deposit numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 5. ACCOUNTS
-- =========================================================
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('cash', 'bank', 'wallet')),
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. PAYMENTS
-- =========================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  amount numeric not null,
  payment_date date not null default current_date,
  month text not null, -- e.g., 'Jan-2026'
  status text not null default 'paid' check (status in ('paid', 'pending', 'partial')),
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'wallet')),
  account_id uuid not null references public.accounts(id) on delete restrict,
  transaction_id text,
  bank_name text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 7. TRANSACTIONS
-- =========================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  type text not null check (type in ('credit', 'debit')),
  amount numeric not null,
  reference text not null check (reference in ('payment', 'expense', 'manual')),
  reference_id uuid not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 8. EXPENSES
-- =========================================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  amount numeric not null,
  account_id uuid not null references public.accounts(id) on delete restrict,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 9. INQUIRIES
-- =========================================================
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  preferred_room text,
  message text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 10. USERS (Roles)
-- =========================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'manager' check (role in ('admin', 'manager')),
  created_at timestamptz not null default now()
);


-- =========================================================
-- AUTOMATION TRIGGERS (FINANCIAL LOGIC)
-- =========================================================

-- Trigger function for PAYMENTS (Credit)
create or replace function process_payment_transaction()
returns trigger as $$
begin
  -- 1. Create a transaction record
  insert into public.transactions (account_id, type, amount, reference, reference_id)
  values (new.account_id, 'credit', new.amount, 'payment', new.id);
  
  -- 2. Update the account balance
  update public.accounts
  set balance = balance + new.amount
  where id = new.account_id;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_process_payment
  after insert on public.payments
  for each row
  when (new.status = 'paid')
  execute function process_payment_transaction();


-- Trigger function for EXPENSES (Debit)
create or replace function process_expense_transaction()
returns trigger as $$
begin
  -- 1. Create a transaction record
  insert into public.transactions (account_id, type, amount, reference, reference_id)
  values (new.account_id, 'debit', new.amount, 'expense', new.id);
  
  -- 2. Update the account balance
  update public.accounts
  set balance = balance - new.amount
  where id = new.account_id;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_process_expense
  after insert on public.expenses
  for each row
  execute function process_expense_transaction();


-- =========================================================
-- SEED DATA
-- =========================================================

-- Seed default pricing
insert into public.pricing (room_type, monthly_rent, security_deposit) values
  ('Single Room', 8000, 10000),
  ('Double Sharing', 5500, 8000),
  ('Triple Sharing', 4000, 6000)
on conflict (room_type) do nothing;

-- Seed default accounts
insert into public.accounts (name, type, balance) values
  ('Main Cash Drawer', 'cash', 0),
  ('HBL Bank Account', 'bank', 0),
  ('Easypaisa Wallet', 'wallet', 0)
on conflict (name) do nothing;


-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Temporarily disable RLS on all tables so the application works seamlessly
-- Security can be tightened later by the admin based on auth.uid()
alter table public.rooms disable row level security;
alter table public.students disable row level security;
alter table public.room_allocations disable row level security;
alter table public.pricing disable row level security;
alter table public.accounts disable row level security;
alter table public.payments disable row level security;
alter table public.transactions disable row level security;
alter table public.expenses disable row level security;
alter table public.inquiries disable row level security;
alter table public.users disable row level security;
