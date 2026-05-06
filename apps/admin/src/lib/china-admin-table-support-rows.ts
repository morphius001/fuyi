import {
  cell,
  statusCell,
  type ChinaAdminTableRow,
} from "./china-admin-table-primitives"

export const settlementRows: ChinaAdminTableRow[] = [
  {
    id: "SET-20260503009",
    cells: {
      id: cell("SET-20260503009"),
      name: cell("三门海鲜市场 A12 档口结算批次"),
      status: statusCell("chinaAdmin.status.settlement.pending", "orange"),
      market: cell("三门海鲜市场"),
      merchant: cell("A12 阿强鲜活海鲜"),
      settlementPeriod: cell("2026-05-01 至 2026-05-03"),
      commissionRate: cell("平台默认费率占位"),
      settlementBoundary: cell("只读 mock，不发起真实打款"),
      amount: cell("¥26,580.00"),
      updatedAt: cell("2026-05-03 09:00"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "SET-20260502006",
    cells: {
      id: cell("SET-20260502006"),
      name: cell("城北果蔬 B08 档口结算批次"),
      status: statusCell("chinaAdmin.status.settlement.settled", "green"),
      market: cell("城北果蔬批发中心"),
      merchant: cell("B08 本地蔬果直供"),
      settlementPeriod: cell("2026-04-28 至 2026-05-02"),
      commissionRate: cell("市场试点费率占位"),
      settlementBoundary: cell("已结算状态为 mock 展示"),
      amount: cell("¥18,240.00"),
      updatedAt: cell("2026-05-02 18:20"),
    },
    actions: ["view", "remark"],
  },
]

export const marketingRows: ChinaAdminTableRow[] = [
  {
    id: "MK-20260503001",
    cells: {
      id: cell("MK-20260503001"),
      name: cell("早市鲜货推荐位"),
      status: statusCell("chinaAdmin.status.marketing.draft", "grey"),
      marketingChannel: cell("首页推荐位"),
      placement: cell("消费者首页 / 店铺列表"),
      audience: cell("本地消费者"),
      campaignPeriod: cell("2026-05-04 06:00 至 12:00"),
      promoBoundary: cell("只读 mock，不发布真实活动"),
      updatedAt: cell("2026-05-03 09:18"),
    },
    actions: ["view", "edit", "copy"],
  },
  {
    id: "MK-20260503002",
    cells: {
      id: cell("MK-20260503002"),
      name: cell("市场物料采购提醒"),
      status: statusCell("chinaAdmin.status.marketing.mockOnly", "grey"),
      marketingChannel: cell("商户后台消息位"),
      placement: cell("商户端，不进入消费者首页"),
      audience: cell("市场商户"),
      campaignPeriod: cell("长期占位"),
      promoBoundary: cell("泡沫箱 / 冰袋 / 包装箱属于商户采购"),
      updatedAt: cell("2026-05-03 09:26"),
    },
    actions: ["view", "remark"],
  },
]

export const messageRows: ChinaAdminTableRow[] = [
  {
    id: "MSG-20260503018",
    cells: {
      id: cell("MSG-20260503018"),
      name: cell("用户咨询今日鲜货配送"),
      status: statusCell("chinaAdmin.status.message.pending", "orange"),
      messageChannel: cell("Mock ChatProvider"),
      conversationRole: cell("消费者 ↔ 平台客服"),
      market: cell("三门海鲜市场"),
      serviceBoundary: cell("只读会话占位，不接真实 IM"),
      owner: cell("平台客服组"),
      updatedAt: cell("2026-05-03 11:22"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "MSG-20260503026",
    cells: {
      id: cell("MSG-20260503026"),
      name: cell("商户咨询市场物料采购入口"),
      status: statusCell("chinaAdmin.status.message.processing", "blue"),
      messageChannel: cell("站内消息 mock"),
      conversationRole: cell("商户 ↔ 平台运营"),
      market: cell("城北果蔬批发中心"),
      serviceBoundary: cell("商户 B 端采购咨询，不进入消费者客服入口"),
      owner: cell("商户运营组"),
      updatedAt: cell("2026-05-03 10:48"),
    },
    actions: ["view", "remark"],
  },
]

export const riskRows: ChinaAdminTableRow[] = [
  {
    id: "RISK-20260503021",
    cells: {
      id: cell("RISK-20260503021"),
      name: cell("高频提货尝试占位预警"),
      status: statusCell("chinaAdmin.status.risk.pending", "orange"),
      riskObject: cell("提货卡 THK-2026-****-7831"),
      riskType: cell("提货频次异常"),
      riskLevel: cell("中风险"),
      triggerRule: cell("短时间多次查询 / 提货尝试"),
      riskBoundary: cell("只读预警，不冻结真实卡号"),
      owner: cell("风控运营组"),
      updatedAt: cell("2026-05-03 10:26"),
    },
    actions: ["view", "review", "remark"],
  },
  {
    id: "RISK-20260502008",
    cells: {
      id: cell("RISK-20260502008"),
      name: cell("异常退款申请占位预警"),
      status: statusCell("chinaAdmin.status.risk.processing", "blue"),
      riskObject: cell("售后单 AS-20260503012"),
      riskType: cell("退款频次 / 金额异常"),
      riskLevel: cell("高风险"),
      triggerRule: cell("同手机号多商户短期售后"),
      riskBoundary: cell("不触发真实退款拒绝或账户限制"),
      owner: cell("售后风控组"),
      updatedAt: cell("2026-05-02 15:18"),
    },
    actions: ["view", "remark"],
  },
]

export const settingsRows: ChinaAdminTableRow[] = [
  {
    id: "CFG-BASE-001",
    cells: {
      id: cell("CFG-BASE-001"),
      name: cell("中国大陆平台基础资料"),
      status: statusCell("chinaAdmin.status.settings.placeholder", "grey"),
      configScope: cell("平台名称、默认币种、默认时区、客服电话占位"),
      configOwner: cell("平台运营组"),
      configBoundary: cell("只读 mock，不写真实平台资料"),
      secretPolicy: cell("不涉及密钥"),
      updatedAt: cell("2026-05-03 09:00"),
    },
    actions: ["view", "edit"],
  },
  {
    id: "CFG-PROVIDER-001",
    cells: {
      id: cell("CFG-PROVIDER-001"),
      name: cell("中国本地 Provider 配置模板"),
      status: statusCell("chinaAdmin.status.settings.placeholder", "grey"),
      configScope: cell("支付 / 短信 / 物流 / IM 占位"),
      configOwner: cell("技术配置负责人"),
      configBoundary: cell("只展示配置清单，不接真实服务"),
      secretPolicy: cell("不得写入真实 appId、merchantId、token 或私钥"),
      updatedAt: cell("2026-05-03 09:05"),
    },
    actions: ["view", "remark"],
  },
]
