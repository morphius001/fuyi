import { client } from "./client"

export type VendorMarketContextMode =
  | "vendor_market_context_read_only"
  | "vendor_market_context_empty"
  | "vendor_market_context_fallback"

export type VendorMarketContextSource =
  | "china_market_read_model"
  | "static_adapter"
  | "vendor_market_context_fallback"

export type VendorMarketMembershipStatus =
  | "pending"
  | "open"
  | "paused"
  | "closed"

export type VendorMarketDeliveryType =
  | "market_pickup"
  | "merchant_self_delivery"
  | "market_unified_delivery"
  | "delivery_supplier"
  | "cold_chain_express"

export type VendorMarketModuleHintKey =
  | "quick_listing"
  | "store_decoration"
  | "market_materials"
  | "livestream_status"
  | "ai_listing_draft"
  | "express_print"

export type VendorMarketContextQuery = {
  marketId?: string
  includeAnnouncements?: boolean
  includeDeliveryProfiles?: boolean
}

export type VendorMarketMembershipView = {
  id: string
  marketId: string
  marketName: string
  marketSlug: string
  province?: string
  city: string
  district?: string
  boothNo: string
  stallName?: string
  isPrimary: boolean
  status: VendorMarketMembershipStatus
  businessHours?: string
  serviceRange?: string
  merchantTypeKeys: string[]
}

export type VendorMarketAnnouncementView = {
  id: string
  marketId: string
  title: string
  content: string
  severity: "info" | "warning" | "urgent"
  publishedAt?: string
  expiresAt?: string
}

export type VendorMarketDeliveryProfileView = {
  id: string
  marketId: string
  deliveryType: VendorMarketDeliveryType
  enabled: boolean
  displayName: string
  serviceAreaNote?: string
  cutoffTime?: string
  merchantSelectable: boolean
  runtimeEnabled: false
  checkoutImpact: "none"
}

export type VendorMarketModuleHintView = {
  key: VendorMarketModuleHintKey
  label: string
  visible: boolean
  reason: string
  runtimeEnabled: false
}

export type VendorMarketContextView = {
  mode: VendorMarketContextMode
  source: VendorMarketContextSource
  sellerId: string
  sellerHandle?: string
  primaryMembership?: VendorMarketMembershipView
  memberships: VendorMarketMembershipView[]
  announcements: VendorMarketAnnouncementView[]
  deliveryProfiles: VendorMarketDeliveryProfileView[]
  moduleHints: VendorMarketModuleHintView[]
  runtimeEnabled: false
  note: string
}

type VendorMarketContextResponse = {
  marketContext: VendorMarketContextView
}

type ChinaVendorMarketContextApiClient = {
  vendor: {
    china: {
      marketContext: {
        query: (input?: {
          query?: VendorMarketContextQuery
          fetchOptions?: RequestInit
        }) => Promise<VendorMarketContextResponse>
      }
    }
  }
}

const chinaVendorMarketContextApi =
  client as unknown as ChinaVendorMarketContextApiClient

const fallbackNote =
  "Vendor market context API is unavailable; using an empty read-only fallback that must not affect checkout, fulfillment, settlement, commission, or permissions."

export const createVendorMarketContextFallback = (
  note = fallbackNote
): VendorMarketContextView => ({
  mode: "vendor_market_context_fallback",
  source: "vendor_market_context_fallback",
  sellerId: "current",
  memberships: [],
  announcements: [],
  deliveryProfiles: [],
  moduleHints: [],
  runtimeEnabled: false,
  note,
})

export const retrieveChinaVendorMarketContext = async (
  query?: VendorMarketContextQuery
): Promise<VendorMarketContextView> => {
  return Promise.resolve()
    .then(() =>
      chinaVendorMarketContextApi.vendor.china.marketContext.query({
        query,
        fetchOptions: {
          cache: "no-cache",
        },
      })
    )
    .then((response) => response.marketContext)
    .catch(() => createVendorMarketContextFallback())
}
