-- MagicFishbowl Initial Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type subscription_tier as enum ('starter', 'pro', 'agency');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');
create type offer_type as enum ('giveaway', 'discount');
create type redemption_status as enum ('pending_pin', 'confirmed', 'flagged');
create type scan_method as enum ('qr', 'nfc');
create type campaign_type as enum ('email', 'sms', 'social');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
create type campaign_send_status as enum ('pending', 'sent', 'failed', 'bounced', 'opted_out');
create type contact_source as enum ('scan', 'import', 'manual');

-- ============================================================
-- SUBDOMAIN ORGS (white-label chambers / BIDs)
-- ============================================================

create table subdomain_orgs (
  id               uuid primary key default uuid_generate_v4(),
  org_name         text not null,
  subdomain        text not null unique,
  logo_url         text,
  primary_color    text default '#0ea5e9',
  region_bounds    jsonb,  -- { north, south, east, west }
  admin_user_id    uuid references auth.users(id) on delete set null,
  created_at       timestamptz default now()
);

-- ============================================================
-- MEMBERS (consumers)
-- ============================================================

create table members (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade,
  email            text not null unique,
  phone            text not null unique,
  full_name        text not null,
  qr_token         text not null unique default encode(gen_random_bytes(16), 'hex'),
  nfc_token        text not null unique default encode(gen_random_bytes(16), 'hex'),
  phone_verified   boolean not null default false,
  opted_in_sms     boolean not null default false,
  opted_in_email   boolean not null default false,
  created_at       timestamptz default now()
);

-- Enforce unique email+phone combination
create unique index members_email_phone_idx on members (email, phone);

-- ============================================================
-- MERCHANTS
-- ============================================================

create table merchants (
  id                  uuid primary key default uuid_generate_v4(),
  owner_user_id       uuid not null references auth.users(id) on delete cascade,
  business_name       text not null,
  category            text not null,
  address             text,
  lat                 float,
  lng                 float,
  logo_url            text,
  hours               jsonb,
  subscription_tier   subscription_tier not null default 'starter',
  subscription_status subscription_status not null default 'trialing',
  trial_ends_at       timestamptz default (now() + interval '14 days'),
  stripe_customer_id  text,
  stripe_subscription_id text,
  subdomain_org_id    uuid references subdomain_orgs(id) on delete set null,
  is_live             boolean not null default false,
  created_at          timestamptz default now()
);

-- ============================================================
-- MERCHANT STAFF
-- ============================================================

create table merchant_staff (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid not null references merchants(id) on delete cascade,
  full_name    text not null,
  pin_hash     text not null,  -- bcrypt hash of 4-6 digit PIN
  is_active    boolean not null default true,
  created_at   timestamptz default now()
);

-- ============================================================
-- OFFERS
-- ============================================================

create table offers (
  id                uuid primary key default uuid_generate_v4(),
  merchant_id       uuid not null references merchants(id) on delete cascade,
  title             text not null,
  description       text,
  offer_type        offer_type not null default 'giveaway',
  discount_value    float,
  max_total_uses    int,
  per_member_limit  int not null default 1,
  cooldown_days     int not null default 30,
  expires_at        timestamptz,
  is_active         boolean not null default true,
  total_redeemed    int not null default 0,
  created_at        timestamptz default now()
);

-- ============================================================
-- REDEMPTIONS
-- ============================================================

create table redemptions (
  id             uuid primary key default uuid_generate_v4(),
  member_id      uuid not null references members(id) on delete restrict,
  merchant_id    uuid not null references merchants(id) on delete restrict,
  offer_id       uuid not null references offers(id) on delete restrict,
  staff_id       uuid references merchant_staff(id) on delete set null,
  scanned_at     timestamptz not null default now(),
  confirmed_at   timestamptz,
  status         redemption_status not null default 'pending_pin',
  scan_method    scan_method not null default 'qr'
);

create index redemptions_member_offer_idx on redemptions (member_id, offer_id, confirmed_at);
create index redemptions_merchant_idx on redemptions (merchant_id, scanned_at desc);

-- ============================================================
-- CRM CONTACTS
-- ============================================================

create table crm_contacts (
  id                uuid primary key default uuid_generate_v4(),
  merchant_id       uuid not null references merchants(id) on delete cascade,
  member_id         uuid references members(id) on delete set null,
  email             text not null,
  phone             text,
  full_name         text not null,
  tags              text[] not null default '{}',
  source            contact_source not null default 'scan',
  subdomain_source  text,
  created_at        timestamptz default now(),
  last_contacted_at timestamptz,
  unique (merchant_id, email)
);

create index crm_contacts_merchant_idx on crm_contacts (merchant_id, created_at desc);

-- ============================================================
-- CAMPAIGNS
-- ============================================================

create table campaigns (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid not null references merchants(id) on delete cascade,
  name         text not null,
  type         campaign_type not null,
  status       campaign_status not null default 'draft',
  trigger      jsonb not null default '{}',
  steps        jsonb[] not null default '{}',
  created_at   timestamptz default now()
);

-- ============================================================
-- CAMPAIGN SENDS
-- ============================================================

create table campaign_sends (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references campaigns(id) on delete cascade,
  contact_id    uuid not null references crm_contacts(id) on delete cascade,
  step_index    int not null default 0,
  scheduled_at  timestamptz not null,
  sent_at       timestamptz,
  status        campaign_send_status not null default 'pending'
);

-- ============================================================
-- DUPLICATE SCAN FLAGS (fraud prevention)
-- ============================================================

create table duplicate_scan_flags (
  id               uuid primary key default uuid_generate_v4(),
  qr_token         text not null,
  first_scan_at    timestamptz not null,
  second_scan_at   timestamptz not null,
  merchant_id      uuid references merchants(id) on delete set null,
  resolved         boolean not null default false,
  resolved_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz default now()
);

-- ============================================================
-- OTP VERIFICATIONS (phone)
-- ============================================================

create table phone_otps (
  id          uuid primary key default uuid_generate_v4(),
  phone       text not null,
  otp_hash    text not null,  -- bcrypt hash of 6-digit OTP
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  used        boolean not null default false,
  created_at  timestamptz default now()
);

create index phone_otps_phone_idx on phone_otps (phone, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table members enable row level security;
alter table merchants enable row level security;
alter table merchant_staff enable row level security;
alter table offers enable row level security;
alter table redemptions enable row level security;
alter table crm_contacts enable row level security;
alter table campaigns enable row level security;
alter table campaign_sends enable row level security;
alter table duplicate_scan_flags enable row level security;
alter table subdomain_orgs enable row level security;
alter table phone_otps enable row level security;

-- Members: read/write own record
create policy "members_own" on members
  for all using (auth.uid() = user_id);

-- Merchants: owner full access
create policy "merchants_owner" on merchants
  for all using (auth.uid() = owner_user_id);

-- Public: view live merchants for discovery map
create policy "merchants_public_read" on merchants
  for select using (is_live = true);

-- Offers: merchant owner
create policy "offers_owner" on offers
  for all using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Public: view active offers
create policy "offers_public_read" on offers
  for select using (is_active = true);

-- Merchant staff: owner manages
create policy "staff_owner" on merchant_staff
  for all using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Redemptions: merchant owner sees their redemptions
create policy "redemptions_merchant" on redemptions
  for select using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Members can see their own redemptions
create policy "redemptions_member" on redemptions
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- CRM contacts: merchant owner only
create policy "crm_contacts_owner" on crm_contacts
  for all using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Campaigns: merchant owner only
create policy "campaigns_owner" on campaigns
  for all using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Campaign sends: via campaigns
create policy "campaign_sends_owner" on campaign_sends
  for all using (
    campaign_id in (
      select c.id from campaigns c
      join merchants m on c.merchant_id = m.id
      where m.owner_user_id = auth.uid()
    )
  );

-- Duplicate flags: admin only (service role bypasses RLS)
create policy "dup_flags_owner" on duplicate_scan_flags
  for select using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- Subdomain orgs: admin
create policy "subdomain_orgs_admin" on subdomain_orgs
  for all using (auth.uid() = admin_user_id);

create policy "subdomain_orgs_public_read" on subdomain_orgs
  for select using (true);

-- Phone OTPs: service role only (via API routes with service key)

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Increment offer total_redeemed on confirmed redemption
create or replace function increment_offer_redeemed()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'confirmed' and old.status != 'confirmed' then
    update offers set total_redeemed = total_redeemed + 1
    where id = new.offer_id;
  end if;
  return new;
end;
$$;

create trigger on_redemption_confirmed
  after update on redemptions
  for each row execute function increment_offer_redeemed();

-- Auto-create CRM contact on confirmed redemption
create or replace function create_crm_contact_on_redemption()
returns trigger language plpgsql security definer as $$
declare
  v_member members%rowtype;
begin
  if new.status = 'confirmed' and old.status != 'confirmed' then
    select * into v_member from members where id = new.member_id;
    insert into crm_contacts (merchant_id, member_id, email, phone, full_name, source)
    values (new.merchant_id, new.member_id, v_member.email, v_member.phone, v_member.full_name, 'scan')
    on conflict (merchant_id, email) do update
      set last_contacted_at = now(),
          member_id = excluded.member_id;
  end if;
  return new;
end;
$$;

create trigger on_redemption_confirmed_crm
  after update on redemptions
  for each row execute function create_crm_contact_on_redemption();
