import {
  ChinaLiveCommerceBoundaryKey,
  ChinaLiveCommerceBoundaryView,
  ChinaLiveCommercePlacementView,
  ChinaLiveCommerceReadonlyView,
  ChinaLiveCommerceSessionView,
} from "./types";

const placements: ChinaLiveCommercePlacementView[] = [
  {
    key: "shop_card_badge",
    label: "店铺卡片直播标识",
    visible: true,
    reason: "status_badge_only",
  },
  {
    key: "shop_home_status",
    label: "店铺主页直播状态",
    visible: true,
    reason: "shop_context_only",
  },
  {
    key: "vendor_preview",
    label: "商户后台预告/回放占位",
    visible: true,
    reason: "readonly_preview_only",
  },
  {
    key: "admin_review_queue",
    label: "平台审核/风控占位",
    visible: true,
    reason: "readonly_review_queue_only",
  },
  {
    key: "home_primary_entry",
    label: "消费者首页主入口",
    visible: false,
    reason: "live_should_not_be_home_primary_entry",
  },
];

const boundaryReasons: Record<ChinaLiveCommerceBoundaryKey, string> = {
  real_streaming: "当前不接真实推流。",
  real_im: "当前不接真实 IM。",
  chatroom: "当前不创建真实聊天室。",
  gift_tipping: "当前不支持礼物或打赏。",
  live_order: "当前不支持直播间下单。",
  payment: "直播只读状态不影响支付。",
  refund: "直播只读状态不影响退款。",
  settlement: "直播只读状态不影响结算。",
  commission: "直播只读状态不影响佣金。",
  permission: "直播只读状态不改变权限。",
  push_notification: "当前不发送真实开播通知。",
  fulfillment: "直播只读状态不影响履约。",
};

const buildBoundaryViews = (): ChinaLiveCommerceBoundaryView[] =>
  Object.entries(boundaryReasons).map(([key, reason]) => ({
    key: key as ChinaLiveCommerceBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaLiveCommerceReadonlyView = (
  session: ChinaLiveCommerceSessionView,
): ChinaLiveCommerceReadonlyView => ({
  mode: "live_commerce_readonly_contract",
  source: "china_live_commerce_read_model",
  locale: "zh-CN",
  currency: "CNY",
  timezone: "Asia/Shanghai",
  session,
  placements,
  highRiskBoundaries: buildBoundaryViews(),
  readOnly: true,
  runtimeEnabled: false,
  note: "Live commerce readonly view is a shop/stall status signal only. It does not enable real streaming, IM, chatroom, gifts, live orders, payments, refunds, settlements, commissions, permissions, notifications, or fulfillment.",
});
