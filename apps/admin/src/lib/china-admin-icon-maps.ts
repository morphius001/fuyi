import {
  BuildingStorefront,
  Buildings,
  ChartBar,
  ChatBubbleLeftRight,
  CreditCard,
  Gift,
  QueueList,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
} from "@medusajs/icons"

export const CHINA_ADMIN_METRIC_ICON_BY_KEY = {
  todayGmv: ChartBar,
  todayOrders: ShoppingBag,
  pendingMerchants: Buildings,
  listedProducts: Tag,
  pendingAfterSales: Receipt,
  activeMerchants: BuildingStorefront,
  pickupCardPending: Gift,
  serviceNoticeExceptions: ChatBubbleLeftRight,
}

export const PICKUP_CARD_METRIC_ICON_BY_KEY = {
  totalIssued: Gift,
  activated: Tag,
  redeemed: ShoppingBag,
  unredeemed: QueueList,
  todayRedemptions: ChartBar,
  pendingShipmentOrders: ShoppingCart,
  expiringSoon: Receipt,
  abnormalRecords: CreditCard,
}
