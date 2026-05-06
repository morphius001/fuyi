"use server"

import { sdk } from "../config"

export type ChinaMarket = {
  id: string
  name: string
  slug: string
  province?: string
  city: string
  district?: string
  address?: string
  status: string
  timezone: "Asia/Shanghai"
  metadata: Record<string, unknown>
}

export type ChinaMarketMembership = {
  id: string
  marketId: string
  sellerId: string
  sellerHandle?: string
  sellerName: string
  boothNo: string
  stallName?: string
  isPrimary: boolean
  status: string
  mainCategoryIds: string[]
  metadata: Record<string, unknown>
}

export type ChinaMarketDeliveryProfile = {
  id: string
  marketId: string
  deliveryType: string
  enabled: boolean
  displayName: string
  serviceAreaNote?: string
  cutoffTime?: string
  metadata: Record<string, unknown>
}

export type ChinaMarketsResponse = {
  markets: {
    mode: "read_only_markets" | "fallback_static_markets"
    source: string
    note: string
    items: ChinaMarket[]
  }
}

export type ChinaMarketDetailResponse = {
  market: {
    mode: "read_only_market_detail" | "fallback_static_market_detail"
    market?: ChinaMarket
    memberships: ChinaMarketMembership[]
    announcements: unknown[]
    businessHours: unknown[]
    deliveryProfiles: ChinaMarketDeliveryProfile[]
    runtimeEnabled: false
    note: string
  }
}

export type ChinaMarketSellersResponse = {
  sellers: {
    mode: "read_only_market_sellers" | "fallback_static_market_sellers"
    source: string
    note: string
    market?: ChinaMarket
    items: ChinaMarketMembership[]
  }
}

const fallbackNote =
  "China market API is unavailable; storefront is using an empty read-only fallback."

export const retrieveChinaMarkets = async () => {
  return sdk.client
    .fetch<ChinaMarketsResponse>("/store/china/markets", {
      method: "GET",
      cache: "no-cache",
    })
    .then((response) => response.markets)
    .catch(() => ({
      mode: "fallback_static_markets" as const,
      source: "storefront_fallback",
      note: fallbackNote,
      items: [],
    }))
}

export const retrieveChinaMarketDetail = async (slug: string) => {
  return sdk.client
    .fetch<ChinaMarketDetailResponse>(
      `/store/china/markets/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        cache: "no-cache",
      }
    )
    .then((response) => response.market)
    .catch(() => ({
      mode: "fallback_static_market_detail" as const,
      memberships: [],
      announcements: [],
      businessHours: [],
      deliveryProfiles: [],
      runtimeEnabled: false as const,
      note: fallbackNote,
    }))
}

export const retrieveChinaMarketSellers = async (slug: string) => {
  return sdk.client
    .fetch<ChinaMarketSellersResponse>(
      `/store/china/markets/${encodeURIComponent(slug)}/sellers`,
      {
        method: "GET",
        cache: "no-cache",
      }
    )
    .then((response) => response.sellers)
    .catch(() => ({
      mode: "fallback_static_market_sellers" as const,
      source: "storefront_fallback",
      note: fallbackNote,
      items: [],
    }))
}
