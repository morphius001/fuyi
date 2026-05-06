export const CHINA_MARKET_MEMBERSHIP_TABLES = {
  market: "china_market",
  membership: "china_market_membership",
  sellerRole: "china_seller_role",
  announcement: "china_market_announcement",
  businessHour: "china_market_business_hour",
  deliveryProfile: "china_market_delivery_profile",
} as const

export type ChinaMarketStatus = "draft" | "open" | "paused" | "closed"

export type ChinaMarketMembershipStatus =
  | "pending"
  | "open"
  | "paused"
  | "closed"

export type ChinaSellerRoleStatus =
  | "pending"
  | "active"
  | "paused"
  | "rejected"

export type ChinaMarketAnnouncementAudience =
  | "all"
  | "consumer"
  | "merchant"
  | "delivery_supplier"

export type ChinaMarketAnnouncementStatus =
  | "draft"
  | "published"
  | "archived"

export type ChinaMarketDeliveryType =
  | "market_pickup"
  | "merchant_self_delivery"
  | "market_unified_delivery"
  | "delivery_supplier"
  | "cold_chain_express"
