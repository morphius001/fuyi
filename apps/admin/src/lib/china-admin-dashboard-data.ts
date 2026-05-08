export type ChinaAdminDashboardStatusColor = "green" | "orange" | "red" | "blue" | "grey"

export const chinaAdminDashboardMetricKeys = [
  "todayGmv",
  "todayOrders",
  "pendingMerchants",
  "pendingAfterSales",
  "listedProducts",
  "serviceNoticeExceptions",
] as const

export const chinaAdminDashboardTodoRows = [
  {
    key: "merchantReview",
    count: "18",
    color: "orange" as ChinaAdminDashboardStatusColor,
  },
  {
    key: "productReview",
    count: "368",
    color: "orange" as ChinaAdminDashboardStatusColor,
  },
  {
    key: "serviceNoticeException",
    count: "8",
    color: "red" as ChinaAdminDashboardStatusColor,
  },
] as const

export const chinaAdminDashboardRiskRows = [
  { key: "deliveryDelay", color: "red" as ChinaAdminDashboardStatusColor },
  { key: "merchantGrowth", color: "orange" as ChinaAdminDashboardStatusColor },
  { key: "inventoryWarning", color: "orange" as ChinaAdminDashboardStatusColor },
  { key: "liveDrop", color: "green" as ChinaAdminDashboardStatusColor },
] as const

export const chinaAdminDashboardQuickActionKeys = [
  "reviewProduct",
  "configureMarket",
  "reviewMerchant",
  "orderMonitor",
  "moduleSwitches",
  "capabilityContracts",
] as const

export const chinaAdminDashboardFocusModuleRows = [
  { key: "productAudit", color: "orange" as ChinaAdminDashboardStatusColor },
  { key: "marketDelivery", color: "blue" as ChinaAdminDashboardStatusColor },
  { key: "pickupCard", color: "orange" as ChinaAdminDashboardStatusColor },
  { key: "serviceNotice", color: "red" as ChinaAdminDashboardStatusColor },
] as const

export const chinaAdminDashboardFocusRows = [
  "merchant",
  "product",
  "delivery",
  "order",
  "settlement",
] as const
