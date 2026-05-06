import {
  cell,
  statusCell,
  type ChinaAdminTableRow,
} from "./china-admin-table-primitives"

export const productRows: ChinaAdminTableRow[] = [
  {
    id: "P-884201",
    cells: {
      id: cell("P-884201"),
      name: cell("鲜活梭子蟹 500g/只起"),
      status: statusCell("chinaAdmin.status.product.pending", "orange"),
      category: cell("鲜活海鲜"),
      spec: cell("500g/只起，按斤计价"),
      market: cell("三门海鲜市场"),
      owner: cell("三门海鲜市场 A12 鲜活档口"),
      amount: cell("¥68-82/斤"),
      updatedAt: cell("2026-05-03 10:08"),
    },
    actions: ["view", "review", "remark"],
  },
  {
    id: "P-884176",
    cells: {
      id: cell("P-884176"),
      name: cell("泡沫箱 6 斤装 批发"),
      status: statusCell("chinaAdmin.status.product.failed", "red"),
      category: cell("市场物料"),
      spec: cell("6 斤装，整箱起订"),
      market: cell("城北果蔬批发中心"),
      owner: cell("市场物料供应商"),
      amount: cell("¥4.80/个"),
      updatedAt: cell("2026-05-02 11:40"),
    },
    actions: ["view", "remark"],
  },
]

export const orderRows: ChinaAdminTableRow[] = [
  {
    id: "O-202605030120",
    cells: {
      id: cell("O-202605030120"),
      name: cell("海鲜拼单配送订单"),
      status: statusCell("chinaAdmin.status.order.pendingShipment", "orange"),
      market: cell("三门海鲜市场"),
      deliveryMode: cell("市场统一配送"),
      paymentState: cell("已支付，等待履约"),
      fulfillmentState: cell("待档口备货"),
      owner: cell("三门海鲜市场 A12 鲜活档口"),
      amount: cell("¥358.00"),
      updatedAt: cell("2026-05-03 11:05"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "O-202605020771",
    cells: {
      id: cell("O-202605020771"),
      name: cell("跨档口统一配送订单"),
      status: statusCell("chinaAdmin.status.order.refunding", "red"),
      market: cell("三门海鲜市场 / 城北果蔬批发中心"),
      deliveryMode: cell("跨档口统一配送"),
      paymentState: cell("支付成功，退款申请中"),
      fulfillmentState: cell("配送异常待核实"),
      owner: cell("统一配送调度组"),
      amount: cell("¥168.00"),
      updatedAt: cell("2026-05-02 16:33"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "O-202605030188",
    cells: {
      id: cell("O-202605030188"),
      name: cell("鲜活梭子蟹到店自提"),
      status: statusCell("chinaAdmin.status.order.pendingReceipt", "blue"),
      market: cell("三门海鲜市场"),
      deliveryMode: cell("消费者到档口自提"),
      paymentState: cell("已支付"),
      fulfillmentState: cell("待消费者取货"),
      owner: cell("A12 阿强鲜活海鲜"),
      amount: cell("¥246.00"),
      updatedAt: cell("2026-05-03 10:42"),
    },
    actions: ["view", "remark"],
  },
]

export const afterSalesRows: ChinaAdminTableRow[] = [
  {
    id: "AS-20260503012",
    cells: {
      id: cell("AS-20260503012"),
      name: cell("鲜活到货损耗协商"),
      status: statusCell("chinaAdmin.status.afterSales.pending", "orange"),
      afterSalesType: cell("仅退款 / 损耗协商"),
      market: cell("三门海鲜市场"),
      orderNo: cell("O-202605030120"),
      owner: cell("售后运营组"),
      amount: cell("¥168.00"),
      updatedAt: cell("2026-05-03 10:44"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "AS-20260502031",
    cells: {
      id: cell("AS-20260502031"),
      name: cell("跨档口配送延迟投诉"),
      status: statusCell("chinaAdmin.status.afterSales.intervention", "red"),
      afterSalesType: cell("平台介入"),
      market: cell("三门海鲜市场 / 城北果蔬批发中心"),
      orderNo: cell("O-202605020771"),
      owner: cell("平台售后专员"),
      amount: cell("¥168.00"),
      updatedAt: cell("2026-05-02 16:55"),
    },
    actions: ["view", "remark"],
  },
]

export const paymentRows: ChinaAdminTableRow[] = [
  {
    id: "PAY-20260503071",
    cells: {
      id: cell("PAY-20260503071"),
      name: cell("本地市场支付流水占位"),
      status: statusCell("chinaAdmin.status.payment.pendingReconcile", "orange"),
      paymentMethod: cell("Mock China PaymentProvider"),
      paymentState: cell("支付通知已接收，占位待对账"),
      notificationState: cell("验签 / 幂等 / 重试为后端后续任务"),
      idempotencyKey: cell("mock_event_PAY-20260503071"),
      amount: cell("¥8,620.00"),
      updatedAt: cell("2026-05-03 08:30"),
    },
    actions: ["view", "remark"],
  },
  {
    id: "PAY-20260502018",
    cells: {
      id: cell("PAY-20260502018"),
      name: cell("支付通知异常占位"),
      status: statusCell("chinaAdmin.status.payment.exception", "red"),
      paymentMethod: cell("Mock China PaymentProvider"),
      paymentState: cell("通知重复 / 金额差异待核查"),
      notificationState: cell("必须幂等处理，不能重复改订单"),
      idempotencyKey: cell("mock_event_PAY-20260502018"),
      amount: cell("¥168.00"),
      updatedAt: cell("2026-05-02 16:36"),
    },
    actions: ["view", "remark"],
  },
]
