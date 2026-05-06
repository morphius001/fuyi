export type ChinaMarketStatus = "draft" | "open" | "paused" | "closed";

export type ChinaMarket = {
  id: string;
  name: string;
  slug: string;
  province?: string;
  city: string;
  district?: string;
  address?: string;
  status: ChinaMarketStatus;
  timezone: "Asia/Shanghai";
  metadata: Record<string, unknown>;
};

export type ChinaMarketMembershipStatus =
  | "pending"
  | "open"
  | "paused"
  | "closed";

export type ChinaMarketMembership = {
  id: string;
  marketId: string;
  sellerId: string;
  sellerHandle?: string;
  sellerName: string;
  boothNo: string;
  stallName?: string;
  isPrimary: boolean;
  status: ChinaMarketMembershipStatus;
  mainCategoryIds: string[];
  metadata: Record<string, unknown>;
};

export type ChinaSellerRoleKey =
  | "seafood_stall"
  | "fruit_vegetable"
  | "materials_supplier"
  | "delivery_supplier"
  | "farmer"
  | "grower"
  | "seedling_supplier"
  | "regional_wholesaler";

export type ChinaSellerRole = {
  id: string;
  sellerId: string;
  marketId?: string;
  roleKey: ChinaSellerRoleKey;
  status: "pending" | "active" | "paused" | "rejected";
  metadata: Record<string, unknown>;
};

export type ChinaMarketAnnouncement = {
  id: string;
  marketId: string;
  audience: "consumer" | "merchant" | "delivery_supplier" | "all";
  title: string;
  content: string;
  severity: "info" | "warning" | "urgent";
  status: "draft" | "published" | "archived";
};

export type ChinaMarketBusinessHour = {
  id: string;
  marketId: string;
  weekday: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
  note?: string;
};

export type ChinaMarketDeliveryType =
  | "market_pickup"
  | "merchant_self_delivery"
  | "market_unified_delivery"
  | "delivery_supplier"
  | "cold_chain_express";

export type ChinaMarketDeliveryProfile = {
  id: string;
  marketId: string;
  deliveryType: ChinaMarketDeliveryType;
  enabled: boolean;
  displayName: string;
  serviceAreaNote?: string;
  cutoffTime?: string;
  metadata: Record<string, unknown>;
};

export type ChinaMarketReadModelSeed = {
  markets?: ChinaMarket[];
  memberships?: ChinaMarketMembership[];
  roles?: ChinaSellerRole[];
  announcements?: ChinaMarketAnnouncement[];
  businessHours?: ChinaMarketBusinessHour[];
  deliveryProfiles?: ChinaMarketDeliveryProfile[];
};
