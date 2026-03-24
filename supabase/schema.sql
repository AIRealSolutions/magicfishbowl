-- ============================================================
-- MagicFishbowl — Complete Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enum Types ──────────────────────────────────────────────
create type subscription_tier     as enum ('starter', 'pro', 'agency');
create type subscription_status   as enum ('trialing', 'active', 'past_due', 'canceled');
create type offer_type            as enum ('giveaway', 'discount');
create type redemption_status     as enum ('pending_pin', 'confirmed', 'flagged');
create type scan_method           as enum ('qr', 'nfc');
create type campaign_type         as enum ('email', 'sms', 'social');
create type campaign_status       as enum ('draft', 'active', 'paused', 'completed');
create type campaign_send_status  as enum ('pending', 'sent', 'failed', 'bounced', 'opted_out');
create type contact_source        as enum ('scan', 'import', 'manual');

-- ─── Tables ──────────────────────────────────────────────────

-- Subdomain orgs (declared first — merchants FK to it)
create table subdomain_orgs (
  id             uuid primary key default uuid_generate_v4(),
  org_name       text not null,
  subdomain      text unique not null,
  logo_url       text,
  primary_color  text not null default '#0ea5e9',
  region_bounds  jsonb,
  admin_user_id  uuid references auth.users on delete set null,
  created_at     timestamptz not null default now()
);

-- Members (consumer side)
create table members (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users on delete cascade,
  email           text unique not null,
  phone           text unique not null,
  full_name       text not null,
  qr_token        text unique not null default uuid_generate_v4()::text,
  nfc_token       text unique not null default uuid_generate_v4()::text,
  phone_verified  boolean not null default false,
  opted_in_sms    boolean not null default false,
  opted_in_email  boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Phone OTPs (for SMS verification)
create table phone_otps (
  id          uuid primary key default uuid_generate_v4(),
  phone       text not null,
  otp_hash    text not null,
  used        boolean not null default false,
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  created_at  timestamptz not null default now()
);

-- Merchants (business side)
create table merchants (
  id                    uuid primary key default uuid_generate_v4(),
  owner_user_id         uuid not null references auth.users on delete cascade,
  business_name         text not null,
  category              text not null,
  address               text,
  lat                   float8,
  lng                   float8,
  logo_url              text,
  hours                 jsonb,
  subscription_tier     subscription_tier not null default 'starter',
  subscription_status   subscription_status not null default 'trialing',
  trial_ends_at         timestamptz default (now() + interval '14 days'),
  stripe_customer_id    text,
  stripe_subscription_id text,
  subdomain_org_id      uuid references subdomain_orgs on delete set null,
  is_live               boolean not null default false,
  created_at            timestamptz not null default now()
);

-- Merchant staff
create table merchant_staff (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid not null references merchants on delete cascade,
  full_name    text not null,
  pin_hash     text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Offers
create table offers (
  id                uuid primary key default uuid_generate_v4(),
  merchant_id       uuid not null references merchants on delete cascade,
  title             text not null,
  description       text,
  offer_type        offer_type not null default 'giveaway',
  discount_value    float8,
  max_total_uses    int,
  per_member_limit  int not null default 1,
  cooldown_days     int not null default 30,
  expires_at        timestamptz,
  is_active         boolean not null default true,
  total_redeemed    int not null default 0,
  created_at        timestamptz not null default now()
);

-- Redemptions
create table redemptions (
  id            uuid primary key default uuid_generate_v4(),
  member_id     uuid not null references members on delete cascade,
  merchant_id   uuid not null references merchants on delete cascade,
  offer_id      uuid not null references offers on delete cascade,
  staff_id      uuid references merchant_staff on delete set null,
  scanned_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  status        redemption_status not null default 'pending_pin',
  scan_method   scan_method not null default 'qr'
);

-- CRM contacts (auto-populated from redemptions, also importable)
create table crm_contacts (
  id                uuid primary key default uuid_generate_v4(),
  merchant_id       uuid not null references merchants on delete cascade,
  member_id         uuid references members on delete set null,
  email             text not null,
  phone             text,
  full_name         text not null,
  tags              text[] not null default '{}',
  source            contact_source not null default 'scan',
  subdomain_source  text,
  created_at        timestamptz not null default now(),
  last_contacted_at timestamptz,
  -- One CRM row per member per merchant
  unique (merchant_id, member_id)
);

-- Campaigns
create table campaigns (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid not null references merchants on delete cascade,
  name         text not null,
  type         campaign_type not null default 'email',
  status       campaign_status not null default 'draft',
  trigger      jsonb not null default '{"event": "scan", "delay_days": 0}'::jsonb,
  steps        jsonb[] not null default '{}',
  created_at   timestamptz not null default now()
);

-- Campaign send log
create table campaign_sends (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references campaigns on delete cascade,
  contact_id    uuid not null references crm_contacts on delete cascade,
  step_index    int not null default 0,
  scheduled_at  timestamptz not null default now(),
  sent_at       timestamptz,
  status        campaign_send_status not null default 'pending'
);

-- Duplicate scan flags (fraud prevention)
create table duplicate_scan_flags (
  id              uuid primary key default uuid_generate_v4(),
  qr_token        text not null,
  first_scan_at   timestamptz not null,
  second_scan_at  timestamptz not null,
  merchant_id     uuid references merchants on delete set null,
  resolved        boolean not null default false,
  resolved_by     uuid references auth.users on delete set null,
  created_at      timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index idx_members_user_id       on members(user_id);
create index idx_members_qr_token      on members(qr_token);
create index idx_members_nfc_token     on members(nfc_token);
create index idx_members_phone         on members(phone);
create index idx_phone_otps_phone      on phone_otps(phone);
create index idx_merchants_owner       on merchants(owner_user_id);
create index idx_merchants_live        on merchants(is_live) where is_live = true;
create index idx_merchants_location    on merchants(lat, lng) where lat is not null;
create index idx_staff_merchant        on merchant_staff(merchant_id);
create index idx_offers_merchant       on offers(merchant_id);
create index idx_offers_active         on offers(merchant_id) where is_active = true;
create index idx_redemptions_member    on redemptions(member_id);
create index idx_redemptions_merchant  on redemptions(merchant_id);
create index idx_redemptions_status    on redemptions(status);
create index idx_contacts_merchant     on crm_contacts(merchant_id);
create index idx_contacts_member       on crm_contacts(member_id);
create index idx_sends_scheduled       on campaign_sends(scheduled_at) where status = 'pending';

-- ─── DB Functions & Triggers ────────────────────────────────

-- Auto-populate CRM contact + increment offer count when redemption confirmed
create or replace function fn_on_redemption_confirmed()
returns trigger
language plpgsql
security definer
as $$
declare
  v_member members%rowtype;
begin
  -- Only fire when status changes to 'confirmed'
  if new.status = 'confirmed' and old.status = 'pending_pin' then

    -- Fetch member
    select * into v_member from members where id = new.member_id;

    -- Upsert CRM contact (one per member per merchant)
    insert into crm_contacts (
      merchant_id, member_id, email, phone, full_name, source, tags
    )
    values (
      new.merchant_id,
      new.member_id,
      v_member.email,
      v_member.phone,
      v_member.full_name,
      'scan',
      array['redeemed']
    )
    on conflict (merchant_id, member_id) do update
      set last_contacted_at = now(),
          tags = array(
            select distinct unnest(array_cat(crm_contacts.tags, array['redeemed']))
          );

    -- Increment offer redemption count
    update offers
      set total_redeemed = total_redeemed + 1
      where id = new.offer_id;

  end if;
  return new;
end;
$$;

create trigger trg_redemption_confirmed
  after update on redemptions
  for each row
  execute function fn_on_redemption_confirmed();

-- ─── Row-Level Security ──────────────────────────────────────
-- Note: API routes use the service_role key which bypasses RLS.
-- These policies protect direct client-side Supabase calls.

alter table members            enable row level security;
alter table phone_otps         enable row level security;
alter table merchants          enable row level security;
alter table merchant_staff     enable row level security;
alter table offers             enable row level security;
alter table redemptions        enable row level security;
alter table crm_contacts       enable row level security;
alter table campaigns          enable row level security;
alter table campaign_sends     enable row level security;
alter table subdomain_orgs     enable row level security;
alter table duplicate_scan_flags enable row level security;

-- Members: own row only
create policy "members_select_own" on members
  for select using (auth.uid() = user_id);
create policy "members_update_own" on members
  for update using (auth.uid() = user_id);

-- Merchants: owners only
create policy "merchants_all_own" on merchants
  for all using (auth.uid() = owner_user_id);

-- Merchants: public can read live merchants (for discovery map)
create policy "merchants_select_live" on merchants
  for select using (is_live = true);

-- Merchant staff: owner can manage
create policy "staff_all_own" on merchant_staff
  for all using (
    merchant_id in (
      select id from merchants where owner_user_id = auth.uid()
    )
  );

-- Offers: owner can manage
create policy "offers_all_own" on offers
  for all using (
    merchant_id in (
      select id from merchants where owner_user_id = auth.uid()
    )
  );

-- Offers: public can read active (for discovery map)
create policy "offers_select_active" on offers
  for select using (is_active = true);

-- Redemptions: member sees own
create policy "redemptions_select_member" on redemptions
  for select using (
    member_id in (select id from members where user_id = auth.uid())
  );

-- Redemptions: merchant owner sees own
create policy "redemptions_select_merchant" on redemptions
  for select using (
    merchant_id in (select id from merchants where owner_user_id = auth.uid())
  );

-- CRM contacts: owner only
create policy "contacts_all_own" on crm_contacts
  for all using (
    merchant_id in (
      select id from merchants where owner_user_id = auth.uid()
    )
  );

-- Campaigns: owner only
create policy "campaigns_all_own" on campaigns
  for all using (
    merchant_id in (
      select id from merchants where owner_user_id = auth.uid()
    )
  );

-- Campaign sends: owner only (via campaign join)
create policy "sends_all_own" on campaign_sends
  for all using (
    campaign_id in (
      select c.id from campaigns c
      join merchants m on m.id = c.merchant_id
      where m.owner_user_id = auth.uid()
    )
  );

-- Subdomain orgs: public read
create policy "orgs_select_public" on subdomain_orgs
  for select using (true);

-- Subdomain orgs: admin can manage their org
create policy "orgs_all_admin" on subdomain_orgs
  for all using (auth.uid() = admin_user_id);

-- ─── Storage Buckets ────────────────────────────────────────
-- Run these separately or create via Supabase Dashboard:
--
-- 1. Create bucket "merchant-logos" (public: true)
--    Dashboard → Storage → New bucket → merchant-logos → Public
--
-- 2. Storage policy: authenticated users can upload to their own folder
-- insert into storage.buckets (id, name, public) values ('merchant-logos', 'merchant-logos', true);
--
-- create policy "logos_upload" on storage.objects
--   for insert with check (
--     bucket_id = 'merchant-logos' and auth.role() = 'authenticated'
--   );
-- create policy "logos_public_read" on storage.objects
--   for select using (bucket_id = 'merchant-logos');
