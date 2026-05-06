import {
  ChinaMarket,
  ChinaMarketAnnouncement,
  ChinaMarketBusinessHour,
  ChinaMarketDeliveryProfile,
  ChinaMarketMembership,
  ChinaMarketReadModelSeed,
  ChinaSellerRole,
} from "./types";

export class ChinaMarketReadModelService {
  private readonly markets = new Map<string, ChinaMarket>();
  private readonly memberships = new Map<string, ChinaMarketMembership>();
  private readonly roles = new Map<string, ChinaSellerRole>();
  private readonly announcements = new Map<string, ChinaMarketAnnouncement>();
  private readonly businessHours = new Map<string, ChinaMarketBusinessHour>();
  private readonly deliveryProfiles = new Map<string, ChinaMarketDeliveryProfile>();

  constructor(seed: ChinaMarketReadModelSeed = {}) {
    seed.markets?.forEach((market) => this.markets.set(market.id, market));
    seed.memberships?.forEach((membership) =>
      this.memberships.set(membership.id, membership)
    );
    seed.roles?.forEach((role) => this.roles.set(role.id, role));
    seed.announcements?.forEach((announcement) =>
      this.announcements.set(announcement.id, announcement)
    );
    seed.businessHours?.forEach((businessHour) =>
      this.businessHours.set(businessHour.id, businessHour)
    );
    seed.deliveryProfiles?.forEach((deliveryProfile) =>
      this.deliveryProfiles.set(deliveryProfile.id, deliveryProfile)
    );
  }

  listOpenMarkets() {
    return Array.from(this.markets.values()).filter(
      (market) => market.status === "open"
    );
  }

  getMarketBySlug(slug: string) {
    return Array.from(this.markets.values()).find(
      (market) => market.slug === slug
    );
  }

  listOpenMembershipsByMarket(marketId: string) {
    return Array.from(this.memberships.values()).filter(
      (membership) =>
        membership.marketId === marketId && membership.status === "open"
    );
  }

  listRolesBySeller(sellerId: string) {
    return Array.from(this.roles.values()).filter(
      (role) => role.sellerId === sellerId && role.status === "active"
    );
  }

  listPublishedAnnouncements(marketId: string, audience = "consumer") {
    return Array.from(this.announcements.values()).filter(
      (announcement) =>
        announcement.marketId === marketId &&
        announcement.status === "published" &&
        (announcement.audience === audience || announcement.audience === "all")
    );
  }

  listBusinessHours(marketId: string) {
    return Array.from(this.businessHours.values())
      .filter((businessHour) => businessHour.marketId === marketId)
      .sort((left, right) => left.weekday - right.weekday);
  }

  listEnabledDeliveryProfiles(marketId: string) {
    return Array.from(this.deliveryProfiles.values()).filter(
      (profile) => profile.marketId === marketId && profile.enabled
    );
  }

  buildMarketDetail(slug: string) {
    const market = this.getMarketBySlug(slug);

    if (!market) {
      return undefined;
    }

    return {
      mode: "read_only_market_detail" as const,
      market,
      memberships: this.listOpenMembershipsByMarket(market.id),
      announcements: this.listPublishedAnnouncements(market.id),
      businessHours: this.listBusinessHours(market.id),
      deliveryProfiles: this.listEnabledDeliveryProfiles(market.id),
      runtimeEnabled: false as const,
      note: "Market read models are display-only and do not affect checkout, shipping options, order fulfillment, payment, settlement, commission, or permissions.",
    };
  }
}
