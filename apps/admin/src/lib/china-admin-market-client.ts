import { client } from "./client"

export type ChinaMarketStatus = "draft" | "open" | "paused" | "closed"

export type ChinaAdminMarket = {
  id: string
  name: string
  slug: string
  province?: string
  city: string
  district?: string
  address?: string
  status: ChinaMarketStatus
  timezone: "Asia/Shanghai"
  metadata: Record<string, unknown>
}

export type ChinaAdminMarketMembershipStatus =
  | "pending"
  | "open"
  | "paused"
  | "closed"

export type ChinaAdminMarketMembership = {
  id: string
  marketId: string
  sellerId: string
  sellerHandle?: string
  sellerName: string
  boothNo: string
  stallName?: string
  isPrimary: boolean
  status: ChinaAdminMarketMembershipStatus
  mainCategoryIds: string[]
  metadata: Record<string, unknown>
}

export type ChinaAdminMarketAnnouncement = {
  id: string
  marketId: string
  audience: "consumer" | "merchant" | "delivery_supplier" | "all"
  title: string
  content: string
  severity: "info" | "warning" | "urgent"
  status: "draft" | "published" | "archived"
}

export type ChinaAdminMarketBusinessHour = {
  id: string
  marketId: string
  weekday: number
  opensAt: string
  closesAt: string
  isClosed: boolean
  note?: string
}

export type ChinaAdminMarketDeliveryProfile = {
  id: string
  marketId: string
  deliveryType:
    | "market_pickup"
    | "merchant_self_delivery"
    | "market_unified_delivery"
    | "delivery_supplier"
    | "cold_chain_express"
  enabled: boolean
  displayName: string
  serviceAreaNote?: string
  cutoffTime?: string
  metadata: Record<string, unknown>
}

export type ChinaAdminMarketsView = {
  mode: "admin_read_only_markets" | "admin_fallback_read_only_markets"
  source: string
  note: string
  items: ChinaAdminMarket[]
}

export type ChinaAdminMarketDetailView = {
  mode: "read_only_market_detail" | "admin_fallback_read_only_market_detail"
  market?: ChinaAdminMarket
  memberships: ChinaAdminMarketMembership[]
  announcements: ChinaAdminMarketAnnouncement[]
  businessHours: ChinaAdminMarketBusinessHour[]
  deliveryProfiles: ChinaAdminMarketDeliveryProfile[]
  runtimeEnabled: false
  note: string
}

type ChinaAdminMarketsResponse = {
  markets: ChinaAdminMarketsView
}

type ChinaAdminMarketDetailResponse = {
  market: ChinaAdminMarketDetailView
}

type ChinaAdminMarketsApiClient = {
  admin: {
    china: {
      markets: {
        query: (input?: {
          fetchOptions?: RequestInit
        }) => Promise<ChinaAdminMarketsResponse>
        $id: {
          query: (input: {
            $id: string
            fetchOptions?: RequestInit
          }) => Promise<ChinaAdminMarketDetailResponse>
        }
      }
    }
  }
}

const chinaAdminMarketsApi = client as unknown as ChinaAdminMarketsApiClient

const fallbackNote =
  "Admin China markets API is unavailable; using an empty read-only fallback that must not save configuration or affect runtime behavior."

export const retrieveChinaAdminMarkets = async (): Promise<ChinaAdminMarketsView> => {
  return chinaAdminMarketsApi.admin.china.markets
    .query({
      fetchOptions: {
        cache: "no-cache",
      },
    })
    .then((response) => response.markets)
    .catch(() => ({
      mode: "admin_fallback_read_only_markets" as const,
      source: "admin_market_client_fallback",
      note: fallbackNote,
      items: [],
    }))
}

export const retrieveChinaAdminMarketDetail = async (
  id: string
): Promise<ChinaAdminMarketDetailView> => {
  const trimmedId = id.trim()

  if (!trimmedId) {
    return {
      mode: "admin_fallback_read_only_market_detail",
      memberships: [],
      announcements: [],
      businessHours: [],
      deliveryProfiles: [],
      runtimeEnabled: false,
      note: "Market id is empty; using an empty read-only fallback.",
    }
  }

  return chinaAdminMarketsApi.admin.china.markets.$id
    .query({
      $id: trimmedId,
      fetchOptions: {
        cache: "no-cache",
      },
    })
    .then((response) => response.market)
    .catch(() => ({
      mode: "admin_fallback_read_only_market_detail" as const,
      memberships: [],
      announcements: [],
      businessHours: [],
      deliveryProfiles: [],
      runtimeEnabled: false as const,
      note: fallbackNote,
    }))
}
