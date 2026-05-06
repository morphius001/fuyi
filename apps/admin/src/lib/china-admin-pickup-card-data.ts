export type PickupCardStatusColor = "green" | "orange" | "red" | "blue" | "grey"

export const pickupCardMetricKeys = [
  "totalIssued",
  "activated",
  "redeemed",
  "unredeemed",
] as const

export const pickupCardSecondaryMetricKeys = [
  "todayRedemptions",
  "pendingShipmentOrders",
  "expiringSoon",
  "abnormalRecords",
] as const

export const pickupCardRedemptionStepKeys = [
  "offlineCard",
  "verifyCard",
  "chooseEntitlement",
  "submitFulfillment",
  "createPickupOrder",
] as const

export const pickupCardRecentRows = [
  {
    id: "RDM-202605030018",
    cardNo: "THK-2026-****-7831",
    phone: "138****8291",
    productKey: "freshGiftA",
    statusKey: "chinaAdmin.status.pickupOrder.pendingShipment",
    color: "orange" as PickupCardStatusColor,
    time: "2026-05-03 10:38",
  },
  {
    id: "RDM-202605030011",
    cardNo: "THK-2026-****-4519",
    phone: "186****2108",
    productKey: "businessTeaGift",
    statusKey: "chinaAdmin.status.pickupOrder.shipped",
    color: "blue" as PickupCardStatusColor,
    time: "2026-05-03 09:12",
  },
] as const

export const pickupCardTypeRows = [
  {
    id: "TYPE-SEAFOOD-GIFT-A",
    key: "seafoodGiftA",
  },
  {
    id: "TYPE-FRESH-BUNDLE-B",
    key: "freshBundleB",
  },
] as const

export const pickupCardBatchRows = [
  {
    batch: "BATCH-202605-A01",
    channelKey: "corporateBenefits",
    quantity: "10,000",
    expiresAt: "2026-08-31",
    statusKey: "expiringMock",
  },
  {
    batch: "BATCH-202605-B02",
    channelKey: "marketStores",
    quantity: "5,000",
    expiresAt: "2026-12-31",
    statusKey: "activatingMock",
  },
] as const

export const pickupCardFulfillmentRows = [
  {
    ticket: "PU20260503012",
    merchantKey: "ahaiSeafood",
    methodKey: "marketPickup",
    statusKey: "preparingMock",
  },
  {
    ticket: "PU20260503009",
    merchantKey: "wankouFrozen",
    methodKey: "cityColdChain",
    statusKey: "exceptionReviewMock",
  },
] as const

export const pickupCardOperationBoundaryKeys = [
  "batchActions",
  "secretSafety",
  "businessBoundary",
] as const
