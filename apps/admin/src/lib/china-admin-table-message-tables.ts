import { messageColumns } from "./china-admin-table-columns"
import {
  cell,
  statusCell,
  type ChinaAdminTableData,
} from "./china-admin-table-primitives"

const messageFilters = ["会话状态", "所属市场", "渠道", "更新时间"]

export const messageTables: Record<string, ChinaAdminTableData> = {
  userConversations: {
    columns: messageColumns,
    filters: messageFilters,
    rows: [
      {
        id: "MSG-U-20260503018",
        cells: {
          id: cell("MSG-U-20260503018"),
          name: cell("用户咨询今日鲜货配送"),
          status: statusCell("chinaAdmin.status.message.pending", "orange"),
          messageChannel: cell("Mock ChatProvider"),
          conversationRole: cell("消费者 ↔ 平台客服"),
          market: cell("三门海鲜市场"),
          serviceBoundary: cell("只读会话占位，不接真实微信、TalkJS 或 IM"),
          owner: cell("平台客服组"),
          updatedAt: cell("2026-05-03 11:22"),
        },
        actions: ["view", "remark"],
      },
      {
        id: "MSG-U-20260503019",
        cells: {
          id: cell("MSG-U-20260503019"),
          name: cell("用户询问提货卡配送地址修改"),
          status: statusCell("chinaAdmin.status.message.processing", "blue"),
          messageChannel: cell("站内消息 mock"),
          conversationRole: cell("消费者 ↔ 提货卡客服"),
          market: cell("三门海鲜市场"),
          serviceBoundary: cell("不修改真实提货单、订单、物流或卡状态"),
          owner: cell("提货卡客服组"),
          updatedAt: cell("2026-05-03 11:08"),
        },
        actions: ["view", "remark"],
      },
    ],
  },
  merchantConversations: {
    columns: messageColumns,
    filters: messageFilters,
    rows: [
      {
        id: "MSG-M-20260503026",
        cells: {
          id: cell("MSG-M-20260503026"),
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
      {
        id: "MSG-M-20260503031",
        cells: {
          id: cell("MSG-M-20260503031"),
          name: cell("档口咨询统一配送能力开关"),
          status: statusCell("chinaAdmin.status.message.pending", "orange"),
          messageChannel: cell("Mock ChatProvider"),
          conversationRole: cell("商户 ↔ 市场运营"),
          market: cell("三门海鲜市场"),
          serviceBoundary: cell("只说明能力，不替商户切换真实配送规则"),
          owner: cell("市场运营组"),
          updatedAt: cell("2026-05-03 10:34"),
        },
        actions: ["view", "remark"],
      },
    ],
  },
  platformAnnouncements: {
    columns: messageColumns,
    filters: ["公告状态", "可见范围", "所属市场", "更新时间"],
    rows: [
      {
        id: "ANN-20260503001",
        cells: {
          id: cell("ANN-20260503001"),
          name: cell("五一后早市营业时间调整"),
          status: statusCell("chinaAdmin.status.message.draft", "grey"),
          messageChannel: cell("平台公告"),
          conversationRole: cell("平台运营 → 消费者 / 商户"),
          market: cell("三门海鲜市场"),
          serviceBoundary: cell("只读公告草稿，不发布真实站内信或短信"),
          owner: cell("平台运营组"),
          updatedAt: cell("2026-05-03 09:40"),
        },
        actions: ["view", "edit", "copy"],
      },
      {
        id: "ANN-20260503002",
        cells: {
          id: cell("ANN-20260503002"),
          name: cell("市场统一配送试运行说明"),
          status: statusCell("chinaAdmin.status.message.draft", "grey"),
          messageChannel: cell("市场公告"),
          conversationRole: cell("市场运营 → 入驻商户"),
          market: cell("城北果蔬批发中心"),
          serviceBoundary: cell("公告只说明可选能力，不强制商户切换配送方式"),
          owner: cell("市场运营组"),
          updatedAt: cell("2026-05-03 09:32"),
        },
        actions: ["view", "edit", "copy"],
      },
    ],
  },
  complaintRecords: {
    columns: messageColumns,
    filters: ["投诉状态", "投诉对象", "所属市场", "更新时间"],
    rows: [
      {
        id: "CMP-20260503007",
        cells: {
          id: cell("CMP-20260503007"),
          name: cell("用户投诉配送超时"),
          status: statusCell("chinaAdmin.status.message.processing", "blue"),
          messageChannel: cell("投诉记录"),
          conversationRole: cell("消费者 ↔ 平台客服"),
          market: cell("三门海鲜市场"),
          serviceBoundary: cell("只读投诉跟进，不改变订单、退款或处罚逻辑"),
          owner: cell("客服质检组"),
          updatedAt: cell("2026-05-03 10:12"),
        },
        actions: ["view", "remark"],
      },
      {
        id: "CMP-20260503008",
        cells: {
          id: cell("CMP-20260503008"),
          name: cell("商户投诉物料供应履约延迟"),
          status: statusCell("chinaAdmin.status.message.pending", "orange"),
          messageChannel: cell("商户投诉"),
          conversationRole: cell("商户 ↔ 平台运营"),
          market: cell("城北果蔬批发中心"),
          serviceBoundary: cell("B 端履约投诉占位，不进入消费者售后链路"),
          owner: cell("商户运营组"),
          updatedAt: cell("2026-05-03 09:58"),
        },
        actions: ["view", "remark"],
      },
    ],
  },
}
