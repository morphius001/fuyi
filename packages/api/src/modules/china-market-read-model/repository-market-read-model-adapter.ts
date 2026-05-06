import {
  ChinaMarket,
  ChinaMarketAnnouncement,
  ChinaMarketBusinessHour,
  ChinaMarketDeliveryProfile,
  ChinaMarketDeliveryType,
  ChinaMarketMembership,
  ChinaMarketReadModelSeed,
  ChinaSellerRole,
  ChinaSellerRoleKey,
} from "./types";

type RepositoryRow = Record<string, unknown>;

export type ChinaMarketRepositoryRows = {
  markets?: RepositoryRow[];
  memberships?: RepositoryRow[];
  roles?: RepositoryRow[];
  announcements?: RepositoryRow[];
  businessHours?: RepositoryRow[];
  deliveryProfiles?: RepositoryRow[];
};

export type ChinaMarketReadModelRepository = {
  listChinaMarketReadRows: () =>
    | Promise<ChinaMarketRepositoryRows>
    | ChinaMarketRepositoryRows;
};

const roleKeys = new Set<ChinaSellerRoleKey>([
  "seafood_stall",
  "frozen_goods",
  "dry_goods",
  "fruit_vegetable",
  "materials_supplier",
  "delivery_supplier",
  "farmer",
  "grower",
  "seedling_supplier",
  "regional_wholesaler",
]);

const deliveryTypes = new Set<ChinaMarketDeliveryType>([
  "market_pickup",
  "merchant_self_delivery",
  "market_unified_delivery",
  "delivery_supplier",
  "cold_chain_express",
]);

const readString = (row: RepositoryRow, key: string) => {
  const value = row[key];

  return typeof value === "string" && value.length ? value : undefined;
};

const readBoolean = (
  row: RepositoryRow,
  key: string,
  fallback = false,
): boolean => (typeof row[key] === "boolean" ? row[key] : fallback);

const readNumber = (row: RepositoryRow, key: string) =>
  typeof row[key] === "number" ? row[key] : undefined;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const isDeleted = (row: RepositoryRow) =>
  Boolean(row.deleted_at ?? row.deletedAt);

const mapMarkets = (rows: RepositoryRow[] = []): ChinaMarket[] =>
  rows.reduce<ChinaMarket[]>((markets, row) => {
    if (isDeleted(row)) {
      return markets;
    }

    const id = readString(row, "id");
    const name = readString(row, "name");
    const slug = readString(row, "slug");
    const city = readString(row, "city");
    const status = readString(row, "status");

    if (!id || !name || !slug || !city) {
      return markets;
    }

    if (!["draft", "open", "paused", "closed"].includes(status ?? "")) {
      return markets;
    }

    markets.push({
      id,
      name,
      slug,
      province: readString(row, "province"),
      city,
      district: readString(row, "district"),
      address: readString(row, "address"),
      status: status as ChinaMarket["status"],
      timezone: "Asia/Shanghai",
      metadata: {
        ...toRecord(row.metadata),
        serviceRange: readString(row, "service_range_note"),
      },
    });

    return markets;
  }, []);

const mapMemberships = (rows: RepositoryRow[] = []): ChinaMarketMembership[] =>
  rows.reduce<ChinaMarketMembership[]>((memberships, row) => {
    if (isDeleted(row)) {
      return memberships;
    }

    const id = readString(row, "id");
    const marketId = readString(row, "market_id");
    const sellerId = readString(row, "seller_id");
    const boothNo = readString(row, "booth_no");
    const status = readString(row, "status");

    if (!id || !marketId || !sellerId || !boothNo) {
      return memberships;
    }

    if (!["pending", "open", "paused", "closed"].includes(status ?? "")) {
      return memberships;
    }

    memberships.push({
      id,
      marketId,
      sellerId,
      sellerHandle: readString(row, "seller_handle"),
      sellerName: readString(row, "seller_name") ?? sellerId,
      boothNo,
      stallName: readString(row, "stall_name"),
      isPrimary: readBoolean(row, "is_primary"),
      status: status as ChinaMarketMembership["status"],
      mainCategoryIds: toStringArray(row.main_category_ids),
      metadata: {
        ...toRecord(row.metadata),
        merchantTypeKeys: toStringArray(row.merchant_type_keys),
      },
    });

    return memberships;
  }, []);

const mapRoles = (rows: RepositoryRow[] = []): ChinaSellerRole[] =>
  rows.reduce<ChinaSellerRole[]>((roles, row) => {
    if (isDeleted(row)) {
      return roles;
    }

    const id = readString(row, "id");
    const sellerId = readString(row, "seller_id");
    const roleKey = readString(row, "role_key");
    const status = readString(row, "status");

    if (
      !id ||
      !sellerId ||
      !roleKey ||
      !roleKeys.has(roleKey as ChinaSellerRoleKey)
    ) {
      return roles;
    }

    if (!["pending", "active", "paused", "rejected"].includes(status ?? "")) {
      return roles;
    }

    roles.push({
      id,
      sellerId,
      marketId: readString(row, "market_id"),
      roleKey: roleKey as ChinaSellerRoleKey,
      status: status as ChinaSellerRole["status"],
      metadata: toRecord(row.metadata),
    });

    return roles;
  }, []);

const mapAnnouncements = (
  rows: RepositoryRow[] = [],
): ChinaMarketAnnouncement[] =>
  rows.reduce<ChinaMarketAnnouncement[]>((announcements, row) => {
    if (isDeleted(row)) {
      return announcements;
    }

    const id = readString(row, "id");
    const marketId = readString(row, "market_id");
    const audience = readString(row, "audience");
    const title = readString(row, "title");
    const content = readString(row, "content");
    const severity = readString(row, "severity");
    const status = readString(row, "status");

    if (!id || !marketId || !title || !content) {
      return announcements;
    }

    if (
      !["consumer", "merchant", "delivery_supplier", "all"].includes(
        audience ?? "",
      )
    ) {
      return announcements;
    }

    if (!["info", "warning", "urgent"].includes(severity ?? "")) {
      return announcements;
    }

    if (!["draft", "published", "archived"].includes(status ?? "")) {
      return announcements;
    }

    announcements.push({
      id,
      marketId,
      audience: audience as ChinaMarketAnnouncement["audience"],
      title,
      content,
      severity: severity as ChinaMarketAnnouncement["severity"],
      status: status as ChinaMarketAnnouncement["status"],
    });

    return announcements;
  }, []);

const mapBusinessHours = (
  rows: RepositoryRow[] = [],
): ChinaMarketBusinessHour[] =>
  rows.reduce<ChinaMarketBusinessHour[]>((businessHours, row) => {
    if (isDeleted(row)) {
      return businessHours;
    }

    const id = readString(row, "id");
    const marketId = readString(row, "market_id");
    const weekday = readNumber(row, "weekday");
    const opensAt = readString(row, "opens_at");
    const closesAt = readString(row, "closes_at");

    if (
      !id ||
      !marketId ||
      typeof weekday !== "number" ||
      weekday < 0 ||
      weekday > 6 ||
      !opensAt ||
      !closesAt
    ) {
      return businessHours;
    }

    businessHours.push({
      id,
      marketId,
      weekday,
      opensAt,
      closesAt,
      isClosed: readBoolean(row, "is_closed"),
      note: readString(row, "note"),
    });

    return businessHours;
  }, []);

const mapDeliveryProfiles = (
  rows: RepositoryRow[] = [],
): ChinaMarketDeliveryProfile[] =>
  rows.reduce<ChinaMarketDeliveryProfile[]>((profiles, row) => {
    if (isDeleted(row)) {
      return profiles;
    }

    const id = readString(row, "id");
    const marketId = readString(row, "market_id");
    const deliveryType = readString(row, "delivery_type");
    const displayName = readString(row, "display_name");

    if (
      !id ||
      !marketId ||
      !deliveryType ||
      !deliveryTypes.has(deliveryType as ChinaMarketDeliveryType) ||
      !displayName
    ) {
      return profiles;
    }

    profiles.push({
      id,
      marketId,
      deliveryType: deliveryType as ChinaMarketDeliveryType,
      enabled: readBoolean(row, "enabled"),
      displayName,
      serviceAreaNote: readString(row, "service_area_note"),
      cutoffTime: readString(row, "cutoff_time"),
      metadata: {
        ...toRecord(row.metadata),
        merchantSelectable: readBoolean(row, "merchant_selectable"),
        runtimeEnabled: false,
        checkoutImpact: "none",
      },
    });

    return profiles;
  }, []);

export const mapChinaMarketRepositoryRowsToSeed = ({
  markets,
  memberships,
  roles,
  announcements,
  businessHours,
  deliveryProfiles,
}: ChinaMarketRepositoryRows): ChinaMarketReadModelSeed => ({
  markets: mapMarkets(markets),
  memberships: mapMemberships(memberships),
  roles: mapRoles(roles),
  announcements: mapAnnouncements(announcements),
  businessHours: mapBusinessHours(businessHours),
  deliveryProfiles: mapDeliveryProfiles(deliveryProfiles),
});

export const buildChinaMarketReadModelSeedFromRepository = async (
  repository: ChinaMarketReadModelRepository,
): Promise<ChinaMarketReadModelSeed> => {
  const rows = await repository.listChinaMarketReadRows();

  return mapChinaMarketRepositoryRowsToSeed(rows);
};
