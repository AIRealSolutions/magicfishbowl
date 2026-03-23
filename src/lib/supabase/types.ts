export type SubscriptionTier = 'starter' | 'pro' | 'agency'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'
export type OfferType = 'giveaway' | 'discount'
export type RedemptionStatus = 'pending_pin' | 'confirmed' | 'flagged'
export type ScanMethod = 'qr' | 'nfc'
export type CampaignType = 'email' | 'sms' | 'social'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type CampaignSendStatus = 'pending' | 'sent' | 'failed' | 'bounced' | 'opted_out'
export type ContactSource = 'scan' | 'import' | 'manual'

export interface Member {
  id: string
  user_id: string | null
  email: string
  phone: string
  full_name: string
  qr_token: string
  nfc_token: string
  phone_verified: boolean
  opted_in_sms: boolean
  opted_in_email: boolean
  created_at: string
}

export interface Merchant {
  id: string
  owner_user_id: string
  business_name: string
  category: string
  address: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  hours: Record<string, { open: string; close: string; closed?: boolean }> | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subdomain_org_id: string | null
  is_live: boolean
  created_at: string
}

export interface MerchantStaff {
  id: string
  merchant_id: string
  full_name: string
  pin_hash: string
  is_active: boolean
  created_at: string
}

export interface Offer {
  id: string
  merchant_id: string
  title: string
  description: string | null
  offer_type: OfferType
  discount_value: number | null
  max_total_uses: number | null
  per_member_limit: number
  cooldown_days: number
  expires_at: string | null
  is_active: boolean
  total_redeemed: number
  created_at: string
}

export interface Redemption {
  id: string
  member_id: string
  merchant_id: string
  offer_id: string
  staff_id: string | null
  scanned_at: string
  confirmed_at: string | null
  status: RedemptionStatus
  scan_method: ScanMethod
}

export interface CrmContact {
  id: string
  merchant_id: string
  member_id: string | null
  email: string
  phone: string | null
  full_name: string
  tags: string[]
  source: ContactSource
  subdomain_source: string | null
  created_at: string
  last_contacted_at: string | null
}

export interface Campaign {
  id: string
  merchant_id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  trigger: { event: string; delay_days?: number }
  steps: Array<{ type: string; subject?: string; body: string; delay_days: number }>
  created_at: string
}

export interface SubdomainOrg {
  id: string
  org_name: string
  subdomain: string
  logo_url: string | null
  primary_color: string
  region_bounds: { north: number; south: number; east: number; west: number } | null
  admin_user_id: string | null
  created_at: string
}

export interface DuplicateScanFlag {
  id: string
  qr_token: string
  first_scan_at: string
  second_scan_at: string
  merchant_id: string | null
  resolved: boolean
  resolved_by: string | null
  created_at: string
}

// Tier limits lookup
export const TIER_LIMITS: Record<SubscriptionTier, {
  maxOffers: number
  staffSeats: number
  crmContacts: number
  sms: boolean
  social: boolean
  twoWaySms: boolean
  whiteLabel: boolean
  apiAccess: boolean
}> = {
  starter: {
    maxOffers: 1,
    staffSeats: 2,
    crmContacts: 500,
    sms: false,
    social: false,
    twoWaySms: false,
    whiteLabel: false,
    apiAccess: false,
  },
  pro: {
    maxOffers: 5,
    staffSeats: 10,
    crmContacts: 5000,
    sms: true,
    social: true,
    twoWaySms: false,
    whiteLabel: false,
    apiAccess: false,
  },
  agency: {
    maxOffers: Infinity,
    staffSeats: Infinity,
    crmContacts: Infinity,
    sms: true,
    social: true,
    twoWaySms: true,
    whiteLabel: true,
    apiAccess: true,
  },
}

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  starter: 49,
  pro: 99,
  agency: 199,
}
