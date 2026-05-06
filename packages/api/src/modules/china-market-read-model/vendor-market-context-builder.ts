import { ChinaMarketReadModelService } from "./market-read-model-service";
import {
  ChinaMarketDeliveryProfile,
  ChinaSellerRoleKey,
  ChinaVendorMarketContextView,
  ChinaVendorMarketDeliveryProfileView,
  ChinaVendorMarketMembershipView,
  ChinaVendorMarketModuleHintView,
} from "./types";

export type BuildChinaVendorMarketContextInput = {
  readModel: ChinaMarketReadModelService;
  sellerId: string;
  sellerHandle?: string;
  marketId?: string;
};

const VENDOR_MARKET_CONTEXT_NOTE =
  "Vendor market context is read-only. It does not change checkout, shipping options, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.";

const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const formatBusinessHours = (
  readModel: ChinaMarketReadModelService,
  marketId: string,
) => {
  const hours = readModel.listBusinessHours(marketId);

  if (!hours.length) {
    return undefined;
  }

  return hours
    .map((item) => {
      const weekday = weekdayLabels[item.weekday] ?? `周${item.weekday}`;
      const range = item.isClosed ? "休市" : `${item.opensAt}-${item.closesAt}`;

      return item.note
        ? `${weekday} ${range} ${item.note}`
        : `${weekday} ${range}`;
    })
    .join("；");
};

const deliveryProfileToView = (
  profile: ChinaMarketDeliveryProfile,
): ChinaVendorMarketDeliveryProfileView => ({
  id: profile.id,
  marketId: profile.marketId,
  deliveryType: profile.deliveryType,
  enabled: profile.enabled,
  displayName: profile.displayName,
  serviceAreaNote: profile.serviceAreaNote,
  cutoffTime: profile.cutoffTime,
  merchantSelectable: [
    "merchant_self_delivery",
    "market_unified_delivery",
    "delivery_supplier",
  ].includes(profile.deliveryType),
  runtimeEnabled: false,
  checkoutImpact: "none",
});

const buildModuleHints = (
  merchantTypeKeys: ChinaSellerRoleKey[],
): ChinaVendorMarketModuleHintView[] => {
  const hasMaterialsRole = merchantTypeKeys.includes("materials_supplier");
  const hasDeliveryRole = merchantTypeKeys.includes("delivery_supplier");

  return [
    {
      key: "quick_listing",
      label: "快速上架",
      visible: true,
      reason: "商户端可展示快速上架入口，但真实发布仍需后续审核和商品任务。",
      runtimeEnabled: false,
    },
    {
      key: "store_decoration",
      label: "店铺装修",
      visible: true,
      reason: "店铺/档口主页装修属于展示能力，不改变订单或权限。",
      runtimeEnabled: false,
    },
    {
      key: "market_materials",
      label: "市场物料",
      visible: hasMaterialsRole,
      reason: hasMaterialsRole
        ? "物料供应商可看到物料工作台提示，真实接单后续单独实现。"
        : "普通经营商户不默认开放物料供应商工作台。",
      runtimeEnabled: false,
    },
    {
      key: "livestream_status",
      label: "直播状态",
      visible: true,
      reason: "只允许显示直播占位状态，不接真实直播、IM 或支付。",
      runtimeEnabled: false,
    },
    {
      key: "ai_listing_draft",
      label: "AI 上架草稿",
      visible: true,
      reason: "AI 只能生成草稿建议，不能直接创建真实商品。",
      runtimeEnabled: false,
    },
    {
      key: "express_print",
      label: "快递打印",
      visible: hasDeliveryRole,
      reason: hasDeliveryRole
        ? "配送供应商可看到电子面单占位提示，不能生成真实运单。"
        : "非配送供应商不默认开放快递打印工作台。",
      runtimeEnabled: false,
    },
  ];
};

export const buildChinaVendorMarketContext = ({
  readModel,
  sellerId,
  sellerHandle,
  marketId,
}: BuildChinaVendorMarketContextInput): ChinaVendorMarketContextView => {
  const memberships = readModel.listVisibleMembershipsBySeller(
    sellerId,
    marketId,
  );
  const roles = readModel.listRolesBySeller(sellerId);
  const membershipViews = memberships.reduce<ChinaVendorMarketMembershipView[]>(
    (views, membership) => {
      const market = readModel.getMarketById(membership.marketId);

      if (!market) {
        return views;
      }

      const marketRoleKeys = roles
        .filter(
          (role) => !role.marketId || role.marketId === membership.marketId,
        )
        .map((role) => role.roleKey);

      views.push({
        id: membership.id,
        marketId: membership.marketId,
        marketName: market.name,
        marketSlug: market.slug,
        province: market.province,
        city: market.city,
        district: market.district,
        boothNo: membership.boothNo,
        stallName: membership.stallName,
        isPrimary: membership.isPrimary,
        status: membership.status,
        businessHours: formatBusinessHours(readModel, membership.marketId),
        serviceRange:
          typeof market.metadata.serviceRange === "string"
            ? market.metadata.serviceRange
            : undefined,
        merchantTypeKeys: Array.from(new Set(marketRoleKeys)),
      });

      return views;
    },
    [],
  );

  const visibleMarketIds = new Set(
    membershipViews.map((membership) => membership.marketId),
  );
  const moduleHintRoleKeys = membershipViews.length
    ? Array.from(
        new Set(
          roles
            .filter(
              (role) => !role.marketId || visibleMarketIds.has(role.marketId),
            )
            .map((role) => role.roleKey),
        ),
      )
    : [];
  const announcements = Array.from(visibleMarketIds).flatMap(
    (visibleMarketId) =>
      readModel
        .listPublishedAnnouncements(visibleMarketId, "merchant")
        .map((announcement) => ({
          id: announcement.id,
          marketId: announcement.marketId,
          title: announcement.title,
          content: announcement.content,
          severity: announcement.severity,
        })),
  );
  const deliveryProfiles = Array.from(visibleMarketIds).flatMap(
    (visibleMarketId) =>
      readModel
        .listEnabledDeliveryProfiles(visibleMarketId)
        .map(deliveryProfileToView),
  );

  return {
    mode: membershipViews.length
      ? "vendor_market_context_read_only"
      : "vendor_market_context_empty",
    source: "china_market_read_model",
    sellerId,
    sellerHandle,
    primaryMembership:
      membershipViews.find((membership) => membership.isPrimary) ??
      membershipViews[0],
    memberships: membershipViews,
    announcements,
    deliveryProfiles,
    moduleHints: buildModuleHints(moduleHintRoleKeys),
    runtimeEnabled: false,
    note: VENDOR_MARKET_CONTEXT_NOTE,
  };
};
