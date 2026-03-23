# Product Requirements Document
## MagicFishbowl.com
**B2B Economic Development & Local Marketing Platform**

**Version:** 2.0 — Decisions Locked
**Date:** March 2026
**Stack:** Vercel · Supabase (PostgreSQL) · Next.js 14

---

## Decisions Log

All open questions from v1.0 have been resolved. This version reflects those decisions throughout.

| # | Question | Decision |
|---|---|---|
| Q1 | Offer verification | Two-step: scan QR + staff enters PIN to confirm |
| Q2 | Member phone requirement | Phone required at signup (SMS core to value prop) |
| Q3 | NFC tap-to-redeem | Phase 1 MVP — ship alongside QR from day one |
| Q4 | Subscription tiers | 3 tiers (Starter / Pro / Agency) + free trial |
| Q5 | Consumer app format | Pure mobile web — no install required |
| Q6 | White-label structure | Subdomain per org (e.g. brunswick.magicfishbowl.com) |
| Q7 | Fraud prevention | All four: SMS verification, unique email+phone combo, cooldown period, admin duplicate flagging |
| Q8 | Staff scanner roles | Owner + Staff roles at MVP |

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Solution Overview
4. Target Users & Personas
5. Core Features
6. User Flows
7. Technical Architecture
8. Data Models
9. Integrations
10. Subscription Tiers
11. MVP Scope & Phased Roadmap
12. Success Metrics
13. Non-Functional Requirements

---

## 1. Executive Summary

**MagicFishbowl** is a B2B SaaS platform that helps local businesses grow their customer contact lists by offering product giveaways or discounts in exchange for consumer opt-in. Members register with a verified phone number and receive a persistent virtual card (QR + NFC) that they present at participating businesses to claim their benefit. Staff scan the card and enter a confirmation PIN to complete the redemption — capturing the lead automatically and triggering integrated CRM automations including drip email, SMS campaigns, and social media publishing. A consumer-facing mobile web discovery layer drives foot traffic to enrolled merchants, creating a two-sided marketplace with compounding local economic value. Organizations such as chambers of commerce may operate co-branded instances on dedicated subdomains.

---

## 2. Problem Statement

### For Local Businesses
- Customer contact lists are expensive and slow to build organically.
- Traditional paper "fishbowl" card drops lack digital capture, automation, and follow-through.
- Small businesses lack the budget or technical staff for enterprise CRM tools.
- Foot traffic from new customers is hard to incentivize without costly ad spend.

### For Consumers
- Discovering local deals requires checking multiple apps, websites, and social feeds.
- Loyalty programs are fragmented — a separate card or login per merchant.
- There is no universal local-benefit identity that works across participating businesses.

---

## 3. Solution Overview

MagicFishbowl solves both sides with a two-sided platform:

**Merchant Side:** Businesses enroll, define their offer (giveaway or discount), and receive a web-based scan tool. When a member presents their virtual card, staff scan the QR or tap NFC and enter a confirmation PIN. The lead is captured, and CRM automations begin immediately.

**Consumer Side:** Members register with a verified phone number, receive a universal virtual card (QR + NFC), and browse a map of participating local businesses on mobile web — no app install required. They visit, redeem, and continue receiving personalized follow-up from enrolled merchants.

**White-Label Side:** Chambers of commerce, BIDs, and tourism boards may operate co-branded instances on dedicated subdomains (e.g. `brunswick.magicfishbowl.com`) to promote shop-local campaigns within their region.

---

## 4. Target Users & Personas

### Persona A — The Local Business Owner ("Merchant")
- Restaurants, retail shops, salons, gyms, real estate offices, service providers
- Goal: Build a customer list, drive repeat visits, increase revenue
- Pain: No time for complicated tech; needs something that works in under 5 minutes
- Willingness to Pay: $49–$149/month for a proven lead-capture and marketing tool

### Persona B — The Consumer Member
- Local resident or visitor aged 25–65
- Goal: Discover local deals, receive free or discounted goods
- Behavior: Will opt-in if the value exchange is clear and the process is frictionless
- Device: Primarily smartphone; mobile web experience must be seamless with no app install

### Persona C — The Merchant Staff Member
- Cashier, host, front-desk associate
- Goal: Complete redemptions quickly without touching the owner's full dashboard
- Access: PIN-authenticated scanner only — no access to CRM, billing, or settings

### Persona D — The Platform Administrator
- MagicFishbowl staff managing merchant onboarding, billing, content moderation, and analytics

### Persona E — The Economic Development Organization
- Chambers of commerce, Business Improvement Districts, tourism boards
- Access: Co-branded subdomain instance promoting their enrolled local merchants
- Goal: Drive shop-local engagement without building their own platform

---

## 5. Core Features

### 5.1 Consumer-Facing Features (Mobile Web)

**Universal Virtual Member Card**
- QR code + NFC tag data unique to each member, displayed in mobile browser
- No app install required — card accessible via saved link, home screen bookmark, or email
- Member profile: full name, verified phone, email, opt-in preferences
- Wallet-style display optimized for one-handed mobile use

**Phone Verification at Signup**
- SMS OTP sent to phone number during registration
- One account enforced per unique email + phone combination
- Prevents duplicate accounts and ensures SMS deliverability from day one

**Local Business Discovery**
- Interactive map showing enrolled merchants with active offers
- Category filters (food, retail, services, entertainment, health/beauty, etc.)
- Business profiles: offer description, hours, address, distance
- "New Near You" section and featured placement for promoted merchants

**Offer History & Redemption Log**
- Members can view all past redemptions, current eligible offers, and savings summary
- Email and SMS notification when a new business within their area enrolls

---

### 5.2 Merchant-Facing Features

**Merchant Enrollment & Offer Setup**
- Self-service signup with business profile (name, category, address, logo, hours)
- Offer builder: define giveaway item or discount amount/percentage
- Offer limits: total uses, per-member frequency, cooldown period between redemptions, expiration date
- Preview how the listing appears on the consumer discovery map

**Two-Step Redemption (QR + PIN)**
- Staff open the web-based scanner tool on any device (tablet, phone, desktop)
- Step 1 — Scan: Staff scan member's QR code or tap NFC-enabled card
- Step 2 — Confirm: Staff enter their assigned staff PIN to complete the redemption
- System validates: membership active, offer eligible, cooldown period not violated, no duplicate scan in progress
- Confirmation screen displayed to both staff and member
- Offline-tolerant: queues redemptions locally and syncs when reconnected

**Staff Role Management (Owner + Staff)**
- Owner account: full access to dashboard, CRM, campaigns, billing, staff management
- Staff accounts: scanner tool only — no access to contacts, campaigns, or billing
- Owner creates staff profiles and assigns 4–6 digit PINs
- Owner can deactivate staff access instantly
- Scan log records which staff member confirmed each redemption

**Merchant Dashboard**
- Total leads captured, redemptions, and new vs. returning member breakdowns
- Offer performance over time (daily/weekly/monthly charts)
- Member contact list with search, sort, tag filtering, and CSV export
- Staff activity log (who scanned what, when)
- Billing and subscription management

---

### 5.3 Back-Office CRM

**Contact Management**
- Auto-populated from each confirmed redemption: name, email, verified phone
- Manual contact import via CSV upload
- Tagging: offer redeemed, location, campaign source, custom tags
- Duplicate detection using email + phone match

**Drip Email Campaigns**
- Visual workflow builder: trigger → delay → send
- Triggers: new lead captured, X days after redemption, member birthday, custom date
- Template library with local-business-themed designs
- Personalization tokens: first name, offer redeemed, business name, staff name
- CAN-SPAM compliant unsubscribe management

**SMS / Text Marketing**
- Drip SMS sequences post-redemption
- Broadcast SMS to opted-in segments
- Two-way SMS inbox for customer replies
- TCPA-compliant opt-in/opt-out tracking per contact (explicit written consent captured at member signup)

**Social Media Publishing**
- Connect Facebook Page and Instagram Business Account
- Draft and schedule posts from the merchant back office
- Post templates for announcing offers, new member milestones, and promotions
- Basic engagement metrics pulled back into the dashboard

---

### 5.4 White-Label Subdomain Instances

- Each chamber/BID organization gets a dedicated subdomain (e.g. `brunswick.magicfishbowl.com`)
- Custom logo, color scheme, and hero messaging per subdomain
- Discovery map scoped to merchants within the organization's region
- Organization admin account to manage featured placements and local messaging
- Merchants enrolled on a subdomain also appear on the main `magicfishbowl.com` map
- Subdomain instances provisioned via Vercel wildcard domain + Supabase tenant config

---

### 5.5 Fraud Prevention

All four safeguards are implemented from Phase 1:

- **SMS phone verification** — OTP required at member signup; unverified accounts cannot generate a valid card
- **Unique email + phone enforcement** — Supabase unique constraint on the combination; signup blocked if either is already registered
- **Per-offer cooldown period** — Merchant configures minimum days between redemptions by the same member (default: 30 days); enforced at scan time
- **Duplicate scan flagging** — If the same QR token is scanned twice within 60 seconds (across any merchant), the second scan is blocked and flagged in the admin dashboard for review

---

### 5.6 Platform Administration

- Merchant account management: approve, suspend, change tier
- Global offer moderation: review and remove inappropriate offers
- Duplicate scan alert queue with resolution workflow
- Platform-wide analytics: total merchants, members, scans, MRR, churn
- White-label subdomain provisioning and org management

---

## 6. User Flows

### Flow 1 — Merchant Onboarding
```
Visit magicfishbowl.com
  → Click "List Your Business"
  → Create owner account (email + password or Google SSO)
  → Enter business info + upload logo
  → Define offer (free item or % discount) + set cooldown period
  → Select subscription plan → 14-day free trial starts
  → Enter payment info (charged after trial)
  → Create staff accounts + assign PINs
  → Receive scanner link + in-store QR poster asset
  → Go live on consumer discovery map
```

### Flow 2 — Consumer Registration (Mobile Web)
```
Visit magicfishbowl.com on mobile (or scan in-store QR)
  → Click "Get My Free Card"
  → Enter full name, email, phone number
  → Receive SMS OTP → verify phone
  → Accept opt-in terms (email + SMS consent)
  → Virtual card generated (QR displayed + link texted + emailed)
  → Browse nearby offers on map — no install required
```

### Flow 3 — In-Store Redemption (Two-Step)
```
Member opens virtual card on phone (QR displayed)
  → Staff opens scanner tool on tablet/phone
  → Step 1: Staff scans QR  OR  member taps NFC to staff device
  → System checks: membership valid, offer eligible, cooldown clear, no duplicate
  → Step 2: Staff enters their assigned PIN
  → Redemption confirmed on both screens
  → Member contact saved to CRM
  → Drip sequence triggered automatically
  → Scan logged with staff ID and timestamp
```

### Flow 4 — CRM Drip Sequence (Post-Redemption)
```
Confirmed redemption → contact created/updated in CRM
  → Immediately: Welcome SMS: "Thanks for visiting [Business]! Here's what's next..."
  → Day 0: Welcome email with offer receipt
  → Day 3: Follow-up SMS: "Hope you enjoyed your visit — we'd love to see you again"
  → Day 14: Email: "A special offer, just for you"
  → Day 30: Re-engagement SMS if no return redemption logged
```

### Flow 5 — Staff PIN Redemption
```
Owner logs into dashboard
  → Navigate to Staff Management
  → Add staff member (name, role: Staff)
  → System generates or owner sets 4-digit PIN
  → Staff uses PIN at scanner — no separate login required
  → Owner can deactivate PIN instantly from dashboard
```

### Flow 6 — White-Label Subdomain Discovery
```
Consumer visits brunswick.magicfishbowl.com
  → Sees co-branded map scoped to Brunswick County merchants
  → Registers or logs in with existing MagicFishbowl account
  → Browses and redeems at local merchants
  → Merchant CRM captures lead tagged with subdomain source
```

---

## 7. Technical Architecture

### Stack Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/pass + Google OAuth) |
| File Storage | Supabase Storage (logos, QR assets) |
| Real-Time | Supabase Realtime (scan confirmations) |
| Email | Resend |
| SMS | Twilio (OTP + campaigns + 2-way inbox) |
| Payments | Stripe (subscriptions + trials) |
| Social | Meta Graph API (Facebook/Instagram) |
| QR Scanning | html5-qrcode (client-side, no server needed) |
| NFC | Web NFC API (Chrome Android, Phase 1) |
| Maps | Mapbox GL JS |
| White-Label | Vercel wildcard domain (`*.magicfishbowl.com`) |
| Domain | magicfishbowl.com (GoDaddy → Vercel CNAME) |

### Architecture Diagram

```
Consumer Mobile Web          Merchant Web App         Admin Dashboard
(magicfishbowl.com)     (magicfishbowl.com/biz)   (/admin)
        │                        │                       │
        └────────────────────────┼───────────────────────┘
                                 │
                    Vercel Edge / Next.js API Routes
                                 │
                    ┌────────────┴────────────┐
                    │       Supabase          │
                    │  Auth · DB · Storage    │
                    │  Realtime · RLS         │
                    └────────────┬────────────┘
                                 │
          ┌──────────┬───────────┼───────────┬──────────┐
        Stripe    Twilio      Resend      Mapbox    Meta API
     (billing)  (SMS/OTP)   (email)      (maps)   (social)

White-Label:
brunswick.magicfishbowl.com  ──→  Vercel wildcard  ──→  tenant config in Supabase
```

### Supabase Row-Level Security
- Merchants read/write only their own leads, contacts, and campaigns
- Staff accounts (non-owner) access scanner endpoint only — RLS blocks CRM tables
- Members read/write only their own profile and redemption history
- Admin role bypasses RLS for platform management
- White-label orgs scoped to their region's merchant subset

### Vercel Deployment
- Production: `magicfishbowl.com` + `*.magicfishbowl.com` (wildcard)
- Staging: `staging.magicfishbowl.com`
- Preview: auto-generated per PR branch
- GoDaddy DNS: A record + CNAME pointed to Vercel nameservers

---

## 8. Data Models

### `members`
```
id                  uuid, PK
email               text, unique
phone               text, unique
full_name           text
qr_token            text, unique  ← scanned at redemption
nfc_token           text, unique  ← written to NFC tag
phone_verified      bool, default false
opted_in_sms        bool
opted_in_email      bool
created_at          timestamptz
```

### `merchants`
```
id                  uuid, PK
owner_user_id       uuid, FK → auth.users
business_name       text
category            text
address             text
lat / lng           float
logo_url            text
hours               jsonb
subscription_tier   enum: starter | pro | agency
subscription_status enum: trialing | active | past_due | canceled
trial_ends_at       timestamptz
stripe_customer_id  text
subdomain_org_id    uuid, FK → subdomain_orgs (nullable)
created_at          timestamptz
```

### `merchant_staff`
```
id                  uuid, PK
merchant_id         uuid, FK → merchants
full_name           text
pin_hash            text  ← bcrypt hashed 4–6 digit PIN
is_active           bool, default true
created_at          timestamptz
```

### `offers`
```
id                  uuid, PK
merchant_id         uuid, FK → merchants
title               text
description         text
offer_type          enum: giveaway | discount
discount_value      float, nullable
max_total_uses      int, nullable
per_member_limit    int, default 1
cooldown_days       int, default 30
expires_at          timestamptz, nullable
is_active           bool
```

### `redemptions`
```
id                  uuid, PK
member_id           uuid, FK → members
merchant_id         uuid, FK → merchants
offer_id            uuid, FK → offers
staff_id            uuid, FK → merchant_staff
scanned_at          timestamptz
confirmed_at        timestamptz  ← set when PIN entered
status              enum: pending_pin | confirmed | flagged
scan_method         enum: qr | nfc
```

### `crm_contacts`
```
id                  uuid, PK
merchant_id         uuid, FK → merchants
member_id           uuid, FK → members (nullable)
email               text
phone               text
full_name           text
tags                text[]
source              enum: scan | import | manual
subdomain_source    text, nullable  ← which subdomain drove the visit
created_at          timestamptz
last_contacted_at   timestamptz
```

### `campaigns`
```
id                  uuid, PK
merchant_id         uuid, FK → merchants
name                text
type                enum: email | sms | social
status              enum: draft | active | paused | completed
trigger             jsonb  ← {event: 'scan', delay_days: 0}
steps               jsonb[]
created_at          timestamptz
```

### `campaign_sends`
```
id                  uuid, PK
campaign_id         uuid, FK → campaigns
contact_id          uuid, FK → crm_contacts
step_index          int
scheduled_at        timestamptz
sent_at             timestamptz, nullable
status              enum: pending | sent | failed | bounced | opted_out
```

### `subdomain_orgs`
```
id                  uuid, PK
org_name            text
subdomain           text, unique  ← e.g. "brunswick"
logo_url            text
primary_color       text
region_bounds       jsonb  ← lat/lng bounding box for map scope
admin_user_id       uuid, FK → auth.users
created_at          timestamptz
```

### `duplicate_scan_flags`
```
id                  uuid, PK
qr_token            text
first_scan_at       timestamptz
second_scan_at      timestamptz
merchant_id         uuid, FK → merchants
resolved            bool, default false
resolved_by         uuid, nullable
```

---

## 9. Integrations

| Integration | Purpose | Provider |
|---|---|---|
| SMS | OTP verification, drip campaigns, 2-way inbox | Twilio |
| Email delivery | Drip campaigns, transactional | Resend |
| Payments | Subscription billing + trial management | Stripe |
| Social posting | Facebook/Instagram publish | Meta Graph API |
| Maps | Consumer discovery map | Mapbox GL JS |
| QR scanning | In-store redemption Step 1 | html5-qrcode (client) |
| NFC | In-store redemption Step 1 (Phase 1) | Web NFC API |
| QR generation | Member virtual card | qrcode.js (client) |
| Analytics | Platform usage | Vercel Analytics + Supabase logs |

### NFC Implementation Notes
- Web NFC API is supported on Chrome for Android (covers majority of staff devices)
- iOS Safari does not support Web NFC — QR fallback always available
- NFC tokens written once at card generation and stored in `members.nfc_token`
- Staff device prompts NFC tap on the same scanner screen as QR

---

## 10. Subscription Tiers

All plans include a **14-day free trial** — credit card required at signup, charged on day 15.

| Feature | Starter | Pro | Agency |
|---|---|---|---|
| **Price** | $49/mo | $99/mo | $199/mo |
| Active offers | 1 | 5 | Unlimited |
| Staff scanner seats | 2 | 10 | Unlimited |
| CRM contacts | 500 | 5,000 | Unlimited |
| Email campaigns | ✓ | ✓ | ✓ |
| SMS campaigns | — | ✓ | ✓ |
| Social media scheduler | — | ✓ | ✓ |
| 2-way SMS inbox | — | — | ✓ |
| White-label subdomain | — | — | ✓ |
| CSV export | ✓ | ✓ | ✓ |
| Featured map placement | — | Add-on | Included |
| API access | — | — | ✓ |
| Priority support | — | — | ✓ |

**Trial Behavior:**
- Full Pro-level access during 14-day trial regardless of chosen plan
- Downgraded to selected plan features on day 15 when billing begins
- Cancellation before day 15 incurs no charge

---

## 11. MVP Scope & Phased Roadmap

### Phase 1 — MVP (Months 1–3)
- [ ] Consumer mobile web: registration, phone OTP verification, virtual card (QR + NFC)
- [ ] Merchant signup, offer creation, staff management (owner + staff roles + PINs)
- [ ] Two-step web-based scanner (QR scan + PIN confirmation)
- [ ] NFC tap-to-redeem alongside QR
- [ ] All four fraud prevention safeguards active
- [ ] Basic CRM contact list per merchant (auto-populated from scans)
- [ ] Manual email send to contact list
- [ ] Consumer discovery map (Mapbox, category filters)
- [ ] 3-tier subscription billing with 14-day trial (Stripe)
- [ ] Vercel + Supabase infrastructure, GoDaddy DNS setup, wildcard subdomain config

### Phase 2 — CRM Automation (Months 4–5)
- [ ] Drip email workflow builder
- [ ] Drip SMS sequences (Twilio)
- [ ] Campaign scheduling and send logs
- [ ] Per-offer cooldown enforcement UI (merchant-configurable)
- [ ] Member push/email notifications for new nearby offers
- [ ] Staff activity log and scan audit trail

### Phase 3 — Social & Growth (Months 6–8)
- [ ] Social media post scheduler (Facebook/Instagram via Meta Graph API)
- [ ] Two-way SMS inbox
- [ ] Member referral program ("Invite a friend, both get a bonus offer")
- [ ] Merchant featured placement (promoted listings / map pins)
- [ ] White-label subdomain instances for chambers/BIDs
- [ ] Subdomain org admin dashboard

### Phase 4 — Intelligence & Scale (Months 9–12)
- [ ] AI-generated email/SMS copy suggestions
- [ ] Predictive re-engagement (flag contacts likely to churn)
- [ ] Multi-location merchant support
- [ ] Merchant POS integration API
- [ ] Advanced analytics: lifetime member value, offer ROI, cohort retention

---

## 12. Success Metrics

### Business KPIs
- Monthly Recurring Revenue (MRR) — target $10K by end of Month 6
- Merchant churn rate — target < 5%/month
- Trial-to-paid conversion — target > 40%
- Average leads captured per merchant per month

### Engagement KPIs
- Scans per merchant per week
- Email open rate — target > 25%
- SMS click rate — target > 8%
- Member QR/NFC usage rate (active members / total registered)

### Platform Health
- QR scan success rate — target > 99%
- NFC tap success rate — target > 95% (Android Chrome)
- API uptime — target > 99.9%
- Scan-to-lead capture latency — target < 2 seconds
- Duplicate scan flag rate — target < 0.5% of total scans

---

## 13. Non-Functional Requirements

**Security**
- All member PII encrypted at rest (Supabase AES-256)
- HTTPS enforced everywhere (Vercel default)
- Staff PINs stored as bcrypt hashes — never plaintext
- OWASP Top 10 mitigations in all API routes
- Supabase RLS enforces tenant data isolation

**Compliance**
- CAN-SPAM: unsubscribe link in every marketing email; honored within 10 days
- TCPA: explicit written SMS opt-in captured at member signup; stored with timestamp
- GDPR-friendly: member account deletion flow removes PII from all tables
- Twilio SHAKEN/STIR compliance for outbound SMS

**Performance**
- Consumer mobile web: Lighthouse score > 90 on mobile
- QR + PIN redemption flow: < 2 seconds end-to-end on 4G
- Supabase connection pooling via PgBouncer
- Vercel Edge caching for discovery map and merchant listing pages

**Scalability**
- Supabase PostgreSQL with read replicas for high-traffic map queries
- Vercel serverless auto-scales with demand
- Twilio and Resend handle bulk send queuing natively
- Wildcard subdomain routing handled at Vercel edge — no per-subdomain deploy needed

**Accessibility**
- WCAG 2.1 AA for all consumer and merchant interfaces
- Virtual card QR readable by any standard camera/QR app — no MagicFishbowl app required
- NFC fallback to QR always available for iOS users

---

*Document Owner: MagicFishbowl Product Team*
*Version: 2.0 — All decisions locked*
*Next Step: Technical scoping + sprint planning for Phase 1 MVP*
