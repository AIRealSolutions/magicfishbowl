# MagicFishbowl — Build Progress

**Repo:** https://github.com/AIRealSolutions/magicfishbowl.git
**Stack:** Next.js 14 · Supabase · Vercel · Stripe · Twilio · Resend · Mapbox
**Last Updated:** 2026-03-23

---

## Phase 1 MVP Status

### ✅ Completed

#### Infrastructure
- [x] `package.json` — all dependencies defined
- [x] `next.config.ts` — image domains, rewrites placeholder
- [x] `tsconfig.json` — strict TypeScript, path aliases
- [x] `tailwind.config.ts` — brand colors, component utilities in globals.css
- [x] `.env.example` — all required environment variables documented
- [x] `src/middleware.ts` — session refresh, `/biz` route protection, white-label subdomain detection

#### Database
- [x] `supabase/migrations/001_initial_schema.sql`
  - All 10 tables: members, merchants, merchant_staff, offers, redemptions, crm_contacts, campaigns, campaign_sends, subdomain_orgs, duplicate_scan_flags, phone_otps
  - All enums defined
  - Row Level Security (RLS) policies on all tables
  - Triggers: auto-increment offer.total_redeemed, auto-create CRM contact on confirmed redemption

#### Supabase Helpers & Types
- [x] `src/lib/supabase/client.ts` — browser client (SSR-safe)
- [x] `src/lib/supabase/server.ts` — server client + service role client
- [x] `src/lib/supabase/types.ts` — all TypeScript types, TIER_LIMITS, TIER_PRICES
- [x] `src/lib/utils.ts` — cn(), formatPhone(), normalizePhone(), generateOtp(), getCategoryEmoji(), CATEGORIES

#### Consumer-Facing Pages
- [x] `src/app/layout.tsx` — root layout, Inter font, react-hot-toast, viewport meta
- [x] `src/app/globals.css` — Tailwind base + component classes (btn-primary, input, card, badge)
- [x] `src/app/page.tsx` — landing page (hero, how it works, for businesses, pricing, CTA, footer)
- [x] `src/app/join/page.tsx` — member registration (2-step: info → phone OTP → done)
- [x] `src/app/card/page.tsx` — server page: auth check, member + redemption data fetch
- [x] `src/app/card/VirtualCard.tsx` — client: QR code display (qrcode.js canvas), NFC write, redemption history tabs

#### Consumer Discovery
- [x] `src/app/discover/page.tsx` — server: fetch live merchants with active offers
- [x] `src/app/discover/DiscoverClient.tsx` — Mapbox GL JS map, category filters, search, mobile bottom sheet

#### Merchant Area
- [x] `src/app/biz/page.tsx` — merchant login/signup (2-step signup: account → business info + plan)
- [x] `src/app/biz/layout.tsx` — protected layout: auth check, merchant record fetch, renders BizNav
- [x] `src/app/biz/BizNav.tsx` — responsive sidebar (desktop) + top bar drawer (mobile)
- [x] `src/app/biz/dashboard/page.tsx` — stats (contacts, scans, offers), trial banner, not-live banner, recent redemptions
- [x] `src/app/biz/offers/page.tsx` — offer list with active/inactive toggle, tier limit enforcement
- [x] `src/app/biz/offers/OfferToggle.tsx` — client toggle component
- [x] `src/app/biz/offers/new/page.tsx` — offer creation form (type, discount %, limits, cooldown, expiry)
- [x] `src/app/biz/scan/page.tsx` — server: fetch merchant, staff, active offers
- [x] `src/app/biz/scan/ScannerClient.tsx` — full two-step scanner: QR (html5-qrcode) + NFC → member confirm → PIN entry → success/error
- [x] `src/app/biz/staff/page.tsx` — server: fetch staff list
- [x] `src/app/biz/staff/StaffManager.tsx` — add staff with hashed PIN, activate/deactivate toggle, seat limit enforcement
- [x] `src/app/biz/contacts/page.tsx` — CRM contact table with search, CSV export link
- [x] `src/app/biz/billing/page.tsx` — current plan, trial status, plan comparison, upgrade links

#### API Routes
- [x] `POST /api/otp/send` — Twilio SMS OTP, email+phone duplicate check
- [x] `POST /api/otp/verify` — bcrypt OTP verify, create auth user + member record
- [x] `POST /api/scan/lookup` — validate token → member → offer → fraud checks (duplicate scan 60s, cooldown, limits) → create pending redemption
- [x] `POST /api/scan/confirm` — verify staff PIN (bcrypt), confirm redemption, triggers DB functions
- [x] `POST /api/staff/create` — create staff with hashed PIN, enforce seat limits
- [x] `POST /api/staff/toggle` — activate/deactivate staff
- [x] `GET /api/contacts/export` — CSV export (ownership-verified)
- [x] `GET /api/billing/checkout` — Stripe Checkout session with 14-day trial
- [x] `GET /api/billing/portal` — Stripe billing portal redirect
- [x] `POST /api/webhooks/stripe` — subscription lifecycle: checkout.completed, subscription.updated, subscription.deleted

---

## Fraud Prevention (All 4 from PRD)
- [x] **SMS phone verification** — OTP at signup, unverified members blocked at scan
- [x] **Unique email + phone** — DB unique constraint + checked before OTP send
- [x] **Per-offer cooldown** — enforced at scan lookup time
- [x] **Duplicate scan flagging** — 60-second window check, flagged in `duplicate_scan_flags` table

---

## Phase 2 — CRM Automation (Next Up)

- [ ] Drip email workflow builder (trigger → delay → send)
- [ ] Drip SMS sequences via Twilio
- [ ] Campaign scheduling and send logs
- [ ] Staff activity log and scan audit trail
- [ ] Member push/email notifications for new nearby offers

## Phase 3 — Social & Growth

- [ ] Social media post scheduler (Facebook/Instagram via Meta Graph API)
- [ ] Two-way SMS inbox
- [ ] Member referral program
- [ ] Merchant featured map placement
- [ ] White-label subdomain instances (chamber/BID admin dashboards)
- [ ] Subdomain org admin dashboard

## Phase 4 — Intelligence & Scale

- [ ] AI-generated email/SMS copy suggestions
- [ ] Predictive re-engagement
- [ ] Multi-location merchant support
- [ ] Merchant POS integration API
- [ ] Advanced analytics

---

## Setup Instructions

1. **Install dependencies:** `npm install`
2. **Configure environment:** Copy `.env.example` → `.env.local`, fill all values
3. **Supabase:** Run `supabase/migrations/001_initial_schema.sql` in SQL editor
4. **Stripe:** Create 3 products (Starter $49, Pro $99, Agency $199), add price IDs to env
5. **Twilio:** Enable messaging service, set phone number in env
6. **Mapbox:** Create token with `styles:read` and `tiles:read` scopes
7. **Vercel:** Deploy with wildcard domain `*.magicfishbowl.com` + `magicfishbowl.com`
8. **Stripe webhook:** Point to `https://magicfishbowl.com/api/webhooks/stripe`

---

## Known Limitations (address in Phase 2)
- No email drip automation yet (manual sends only via contacts page)
- No geocoding for merchant addresses (lat/lng must be set manually or via admin)
- No admin dashboard yet (duplicate scan review, merchant management)
- Login page (`/login`) route not yet built — sign-in is at `/biz`
