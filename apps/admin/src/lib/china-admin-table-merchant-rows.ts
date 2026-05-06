import {
  cell,
  statusCell,
  type ChinaAdminTableRow,
} from "./china-admin-table-primitives"

export const merchantRows: ChinaAdminTableRow[] = [
  {
    id: "M-20260503001",
    cells: {
      id: cell("M-20260503001"),
      name: cell("三门海鲜市场 A12 鲜活档口"),
      status: statusCell("chinaAdmin.status.merchant.pending", "orange"),
      market: cell("三门海鲜市场"),
      stallNo: cell("A12"),
      merchantType: cell("海鲜档口"),
      deliveryMode: cell("统一配送 + 商家自配可选"),
      capabilities: cell("鲜活海鲜、提货卡、快递打印待审核"),
      owner: cell("市场招商主管"),
      amount: cell("-"),
      updatedAt: cell("2026-05-03 09:30"),
    },
    actions: ["view", "review", "remark"],
  },
  {
    id: "M-20260502018",
    cells: {
      id: cell("M-20260502018"),
      name: cell("本地蔬果直供 B08 档口"),
      status: statusCell("chinaAdmin.status.merchant.approved", "green"),
      market: cell("城北果蔬批发中心 / 三门海鲜市场"),
      stallNo: cell("B08 / 临时联营"),
      merchantType: cell("水果蔬菜商户"),
      deliveryMode: cell("商家自配为主，可申请统一配送"),
      capabilities: cell("果蔬交易、AI 快速上架、产地直供"),
      owner: cell("生鲜品类运营"),
      amount: cell("-"),
      updatedAt: cell("2026-05-02 18:12"),
    },
    actions: ["view", "edit", "remark"],
  },
]
