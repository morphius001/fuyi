import { merchantColumns } from "./china-admin-table-columns"
import {
  cell,
  statusCell,
  type ChinaAdminTableData,
} from "./china-admin-table-primitives"

const merchantFilters = ["所属市场", "商户类型", "配送方式", "开放能力", "更新时间"]

export const merchantTables: Record<string, ChinaAdminTableData> = {
  merchantList: {
    columns: merchantColumns,
    filters: merchantFilters,
    rows: [
      {
        id: "M-20260503001",
        cells: {
          id: cell("M-20260503001"),
          name: cell("三门海鲜市场 A12 鲜活档口"),
          status: statusCell("chinaAdmin.status.merchant.approved", "green"),
          market: cell("三门海鲜市场"),
          stallNo: cell("A12"),
          merchantType: cell("海鲜档口"),
          deliveryMode: cell("统一配送 + 商家自配可选"),
          capabilities: cell("鲜活海鲜、店铺主页、提货卡履约、直播状态占位"),
          updatedAt: cell("2026-05-03 09:30"),
        },
        actions: ["view", "edit", "remark"],
      },
      {
        id: "M-20260502018",
        cells: {
          id: cell("M-20260502018"),
          name: cell("本地蔬果直供 B08 档口"),
          status: statusCell("chinaAdmin.status.merchant.approved", "green"),
          market: cell("城北果蔬批发中心 / 三门海鲜市场"),
          stallNo: cell("B08 / 联营档"),
          merchantType: cell("水果蔬菜商户"),
          deliveryMode: cell("商家自配为主，可申请统一配送"),
          capabilities: cell("果蔬交易、AI 快速上架草稿、产地直供"),
          updatedAt: cell("2026-05-02 18:12"),
        },
        actions: ["view", "edit", "remark"],
      },
    ],
  },
  merchantOnboarding: {
    columns: merchantColumns,
    filters: ["审核状态", "商户类型", "所属市场", "更新时间"],
    rows: [
      {
        id: "ONB-20260503007",
        cells: {
          id: cell("ONB-20260503007"),
          name: cell("外地批发商入驻申请"),
          status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
          market: cell("可跨市场供货"),
          stallNo: cell("无固定档口，需配置服务范围"),
          merchantType: cell("外地批发商"),
          deliveryMode: cell("干线配送 + 市场分拨待配置"),
          capabilities: cell("仅占位，不开真实接单权限"),
          updatedAt: cell("2026-05-03 10:18"),
        },
        actions: ["view", "review", "remark"],
      },
      {
        id: "ONB-20260503008",
        cells: {
          id: cell("ONB-20260503008"),
          name: cell("种苗批发供应商入驻申请"),
          status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
          market: cell("城北果蔬批发中心"),
          stallNo: cell("供应商专区"),
          merchantType: cell("种苗批发 / 养殖户 / 种植户对接"),
          deliveryMode: cell("预约配送待审核"),
          capabilities: cell("B 端供货占位，不进入消费者首页"),
          updatedAt: cell("2026-05-03 10:02"),
        },
        actions: ["view", "review", "remark"],
      },
    ],
  },
  merchantLegalProfiles: {
    columns: merchantColumns,
    filters: ["主体状态", "商户类型", "所属市场", "更新时间"],
    rows: [
      {
        id: "LEGAL-20260503001",
        cells: {
          id: cell("LEGAL-20260503001"),
          name: cell("A12 阿强鲜活海鲜主体资料"),
          status: statusCell("chinaAdmin.status.merchant.approved", "green"),
          market: cell("三门海鲜市场"),
          stallNo: cell("A12"),
          merchantType: cell("个体工商户 / 海鲜档口"),
          deliveryMode: cell("配送能力不在主体资料页变更"),
          capabilities: cell("证照脱敏展示占位，不上传真实证照"),
          updatedAt: cell("2026-05-03 09:42"),
        },
        actions: ["view", "remark"],
      },
      {
        id: "LEGAL-20260503002",
        cells: {
          id: cell("LEGAL-20260503002"),
          name: cell("市场物料供应商主体资料"),
          status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
          market: cell("三门海鲜市场"),
          stallNo: cell("物料供应商专区"),
          merchantType: cell("物料供应商"),
          deliveryMode: cell("B 端配送待配置"),
          capabilities: cell("泡沫箱、包装箱、冰袋、冰块供应资质占位"),
          updatedAt: cell("2026-05-03 09:36"),
        },
        actions: ["view", "review", "remark"],
      },
    ],
  },
  merchantStoreProfiles: {
    columns: merchantColumns,
    filters: ["店铺状态", "店铺类型", "所属市场", "更新时间"],
    rows: [
      {
        id: "STORE-20260503001",
        cells: {
          id: cell("STORE-20260503001"),
          name: cell("A12 阿强鲜活海鲜店铺主页"),
          status: statusCell("chinaAdmin.status.merchant.approved", "green"),
          market: cell("三门海鲜市场"),
          stallNo: cell("A12"),
          merchantType: cell("海鲜档口"),
          deliveryMode: cell("店铺页展示统一配送 / 自配选项"),
          capabilities: cell("店招、公告、营业时间、正在直播状态占位"),
          updatedAt: cell("2026-05-03 09:58"),
        },
        actions: ["view", "edit", "remark"],
      },
      {
        id: "STORE-20260503002",
        cells: {
          id: cell("STORE-20260503002"),
          name: cell("蔬果直供 B08 店铺主页"),
          status: statusCell("chinaAdmin.status.merchant.approved", "green"),
          market: cell("城北果蔬批发中心"),
          stallNo: cell("B08"),
          merchantType: cell("水果蔬菜商户"),
          deliveryMode: cell("商家自配，可显示市场配送能力"),
          capabilities: cell("店铺装修、产地标签、AI 上架草稿占位"),
          updatedAt: cell("2026-05-03 09:50"),
        },
        actions: ["view", "edit", "remark"],
      },
    ],
  },
  merchantViolationRecords: {
    columns: merchantColumns,
    filters: ["违规状态", "商户类型", "所属市场", "更新时间"],
    rows: [
      {
        id: "VIOL-20260503003",
        cells: {
          id: cell("VIOL-20260503003"),
          name: cell("商品规格描述不完整提醒"),
          status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
          market: cell("三门海鲜市场"),
          stallNo: cell("A12"),
          merchantType: cell("海鲜档口"),
          deliveryMode: cell("不影响配送能力"),
          capabilities: cell("只读违规记录，不处罚、不冻结、不下架"),
          updatedAt: cell("2026-05-03 10:22"),
        },
        actions: ["view", "remark"],
      },
      {
        id: "VIOL-20260503004",
        cells: {
          id: cell("VIOL-20260503004"),
          name: cell("物料供应履约延迟投诉"),
          status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
          market: cell("城北果蔬批发中心"),
          stallNo: cell("物料供应商专区"),
          merchantType: cell("物料供应商"),
          deliveryMode: cell("B 端配送待跟进"),
          capabilities: cell("投诉占位，不关闭真实接单能力"),
          updatedAt: cell("2026-05-03 10:05"),
        },
        actions: ["view", "remark"],
      },
    ],
  },
}
