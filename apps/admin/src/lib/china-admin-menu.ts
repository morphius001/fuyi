import type { ComponentType } from "react"
import {
  BellAlert,
  Buildings,
  Cash,
  ChatBubbleLeftRight,
  CogSixTooth,
  CreditCard,
  Gift,
  House,
  QueueList,
  Receipt,
  ReceiptPercent,
  ShoppingCart,
  Tag,
} from "@medusajs/icons"

export type ChinaAdminPageKind =
  | "merchant"
  | "product"
  | "order"
  | "afterSales"
  | "operations"
  | "pickupCard"
  | "payment"
  | "settlement"
  | "marketing"
  | "message"
  | "risk"
  | "settings"

export type ChinaAdminPageMeta = {
  key: string
  path: string
  labelKey: string
  descriptionKey: string
  tableKind: ChinaAdminPageKind
}

export type ChinaAdminMenuGroup = {
  key: string
  labelKey: string
  path?: string
  icon: ComponentType<{ className?: string }>
  items: ChinaAdminPageMeta[]
}

export const CHINA_ADMIN_ROUTE_PREFIX = "/cn"

const page = (
  key: string,
  path: string,
  tableKind: ChinaAdminPageKind,
): ChinaAdminPageMeta => ({
  key,
  path: `${CHINA_ADMIN_ROUTE_PREFIX}${path}`,
  tableKind,
  labelKey: `chinaAdmin.pages.${key}.title`,
  descriptionKey: `chinaAdmin.pages.${key}.description`,
})

export const CHINA_ADMIN_HOME = {
  key: "home",
  path: CHINA_ADMIN_ROUTE_PREFIX,
  labelKey: "chinaAdmin.nav.home",
  icon: House,
}

export const CHINA_ADMIN_MENU: ChinaAdminMenuGroup[] = [
  {
    key: "operations",
    labelKey: "chinaAdmin.nav.operations.title",
    icon: QueueList,
    items: [
      page("capabilityContracts", "/operations/capability-contracts", "operations"),
      page("unitPermissions", "/operations/unit-permissions", "operations"),
      page("moduleSwitches", "/operations/module-switches", "operations"),
      page("marketCapabilities", "/operations/market-capabilities", "operations"),
      page("roleEnablement", "/operations/role-enablement", "operations"),
    ],
  },
  {
    key: "merchants",
    labelKey: "chinaAdmin.nav.merchants.title",
    icon: Buildings,
    items: [
      page("merchantList", "/merchants/list", "merchant"),
      page("merchantOnboarding", "/merchants/onboarding", "merchant"),
      page("merchantLegalProfiles", "/merchants/legal-profiles", "merchant"),
      page("merchantStoreProfiles", "/merchants/store-profiles", "merchant"),
      page("merchantViolationRecords", "/merchants/violation-records", "merchant"),
    ],
  },
  {
    key: "products",
    labelKey: "chinaAdmin.nav.products.title",
    icon: Tag,
    items: [
      page("productList", "/products/list", "product"),
      page("productReview", "/products/review", "product"),
      page("categoryManagement", "/products/categories", "product"),
      page("productSpecTemplates", "/products/spec-templates", "product"),
      page("brandManagement", "/products/brands", "product"),
      page("prohibitedRules", "/products/prohibited-rules", "product"),
    ],
  },
  {
    key: "orders",
    labelKey: "chinaAdmin.nav.orders.title",
    icon: ShoppingCart,
    items: [
      page("allOrders", "/orders/all", "order"),
      page("pendingPaymentOrders", "/orders/pending-payment", "order"),
      page("pendingShipmentOrders", "/orders/pending-shipment", "order"),
      page("pendingReceiptOrders", "/orders/pending-receipt", "order"),
      page("completedOrders", "/orders/completed", "order"),
      page("closedOrders", "/orders/closed", "order"),
      page("exceptionOrders", "/orders/exceptions", "order"),
    ],
  },
  {
    key: "afterSales",
    labelKey: "chinaAdmin.nav.afterSales.title",
    icon: Receipt,
    items: [
      page("refundRequests", "/after-sales/refund-requests", "afterSales"),
      page("returnRefunds", "/after-sales/return-refunds", "afterSales"),
      page("platformInterventions", "/after-sales/platform-interventions", "afterSales"),
      page("afterSalesReasons", "/after-sales/reasons", "afterSales"),
    ],
  },
  {
    key: "pickupCards",
    labelKey: "chinaAdmin.nav.pickupCards.title",
    icon: Gift,
    items: [
      page("pickupCardDashboard", "/pickup-cards/dashboard", "pickupCard"),
      page("pickupCardTypes", "/pickup-cards/card-types", "pickupCard"),
      page("pickupCardBatches", "/pickup-cards/batches", "pickupCard"),
      page("pickupCardNumbers", "/pickup-cards/card-numbers", "pickupCard"),
      page("pickupCardRedemptions", "/pickup-cards/redemptions", "pickupCard"),
      page("pickupCardFreezeVoid", "/pickup-cards/freeze-void", "pickupCard"),
      page("pickupCardOperationLogs", "/pickup-cards/operation-logs", "pickupCard"),
      page("pickupCardChannels", "/pickup-cards/channels", "pickupCard"),
      page("pickupCardOrders", "/pickup-cards/orders", "pickupCard"),
    ],
  },
  {
    key: "payments",
    labelKey: "chinaAdmin.nav.payments.title",
    icon: CreditCard,
    items: [
      page("paymentTransactions", "/payments/transactions", "payment"),
      page("refundTransactions", "/payments/refunds", "payment"),
      page("reconciliationStatements", "/payments/reconciliation", "payment"),
      page("abnormalBills", "/payments/abnormal-bills", "payment"),
    ],
  },
  {
    key: "settlements",
    labelKey: "chinaAdmin.nav.settlements.title",
    icon: Cash,
    items: [
      page("merchantPendingSettlement", "/settlements/pending", "settlement"),
      page("settledRecords", "/settlements/settled", "settlement"),
      page("commissionRules", "/settlements/commission-rules", "settlement"),
      page("withdrawalRequests", "/settlements/withdrawals", "settlement"),
    ],
  },
  {
    key: "marketing",
    labelKey: "chinaAdmin.nav.marketing.title",
    icon: ReceiptPercent,
    items: [
      page("marketingDashboard", "/marketing/dashboard", "marketing"),
      page("coupons", "/marketing/coupons", "marketing"),
      page("fullReductionActivities", "/marketing/full-reduction", "marketing"),
      page("flashSaleActivities", "/marketing/flash-sales", "marketing"),
      page("homeBanners", "/marketing/home-banners", "marketing"),
      page("recommendationSlots", "/marketing/recommendation-slots", "marketing"),
    ],
  },
  {
    key: "messages",
    labelKey: "chinaAdmin.nav.messages.title",
    icon: ChatBubbleLeftRight,
    items: [
      page("userConversations", "/messages/user-conversations", "message"),
      page("merchantConversations", "/messages/merchant-conversations", "message"),
      page("platformAnnouncements", "/messages/announcements", "message"),
      page("complaintRecords", "/messages/complaints", "message"),
    ],
  },
  {
    key: "risk",
    labelKey: "chinaAdmin.nav.risk.title",
    icon: BellAlert,
    items: [
      page("riskDashboard", "/risk/dashboard", "risk"),
      page("merchantRisk", "/risk/merchants", "risk"),
      page("productRisk", "/risk/products", "risk"),
      page("orderRisk", "/risk/orders", "risk"),
      page("pickupCardRisk", "/risk/pickup-cards", "risk"),
      page("riskOperationLogs", "/risk/operation-logs", "risk"),
    ],
  },
  {
    key: "system",
    labelKey: "chinaAdmin.nav.system.title",
    icon: CogSixTooth,
    items: [
      page("platformInformation", "/system/platform-information", "settings"),
      page("icpFiling", "/system/icp-filing", "settings"),
      page("businessLicenseDisplay", "/system/business-license", "settings"),
      page("userAgreement", "/system/user-agreement", "settings"),
      page("privacyPolicy", "/system/privacy-policy", "settings"),
      page("paymentConfigPlaceholder", "/system/payment-config", "settings"),
      page("smsConfigPlaceholder", "/system/sms-config", "settings"),
      page("logisticsConfigPlaceholder", "/system/logistics-config", "settings"),
      page("imConfigPlaceholder", "/system/im-config", "settings"),
    ],
  },
]

export const CHINA_ADMIN_PAGES = CHINA_ADMIN_MENU.flatMap((group) => group.items)

export const findChinaAdminGroupByKey = (
  groupKey: string,
): ChinaAdminMenuGroup | undefined =>
  CHINA_ADMIN_MENU.find((group) => group.key === groupKey)

export const findChinaAdminGroupByPage = (
  page: ChinaAdminPageMeta,
): ChinaAdminMenuGroup | undefined =>
  CHINA_ADMIN_MENU.find((group) =>
    group.items.some((item) => item.path === page.path),
  )

export const findChinaAdminPage = (
  section?: string,
  pageSlug?: string,
): ChinaAdminPageMeta | undefined => {
  const path = `${CHINA_ADMIN_ROUTE_PREFIX}/${section ?? ""}/${pageSlug ?? ""}`

  return CHINA_ADMIN_PAGES.find((item) => item.path === path)
}
