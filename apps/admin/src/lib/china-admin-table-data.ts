import type { ChinaAdminPageKind } from "./china-admin-menu"
import {
  afterSalesColumns,
  columnsByKind,
  genericColumns,
  marketingColumns,
  merchantColumns,
  messageColumns,
  orderColumns,
  paymentColumns,
  productColumns,
  riskColumns,
  settingsColumns,
  settlementColumns,
} from "./china-admin-table-columns"
import {
  afterSalesRows,
  orderRows,
  paymentRows,
  productRows,
} from "./china-admin-table-core-rows"
import { afterSalesTables } from "./china-admin-table-after-sales-tables"
import { merchantTables } from "./china-admin-table-merchant-tables"
import { merchantRows } from "./china-admin-table-merchant-rows"
import { marketingTables } from "./china-admin-table-marketing-tables"
import { messageTables } from "./china-admin-table-message-tables"
import { orderTables } from "./china-admin-table-order-tables"
import { paymentTables } from "./china-admin-table-payment-tables"
import { pickupCardTables } from "./china-admin-table-pickup-card-tables"
import { productTables } from "./china-admin-table-product-tables"
import { riskTables } from "./china-admin-table-risk-tables"
import { settingsTables } from "./china-admin-table-settings-tables"
import { settlementTables } from "./china-admin-table-settlement-tables"
import {
  cell,
  statusCell,
  type ChinaAdminTableData,
  type ChinaAdminTableRow,
} from "./china-admin-table-primitives"
import {
  marketingRows,
  messageRows,
  riskRows,
  settingsRows,
  settlementRows,
} from "./china-admin-table-support-rows"

export type {
  ChinaAdminStatusColor,
  ChinaAdminTableCell,
  ChinaAdminTableColumn,
  ChinaAdminTableData,
  ChinaAdminTableRow,
} from "./china-admin-table-primitives"

const genericRows: Record<ChinaAdminPageKind, ChinaAdminTableRow[]> = {
  merchant: merchantRows,
  product: productRows,
  order: orderRows,
  afterSales: afterSalesRows,
  operations: [],
  pickupCard: [],
  payment: paymentRows,
  settlement: settlementRows,
  marketing: marketingRows,
  message: messageRows,
  risk: riskRows,
  settings: settingsRows,
}

const tableOverrides: Partial<Record<ChinaAdminPageKind, Record<string, ChinaAdminTableData>>> = {
  afterSales: afterSalesTables,
  merchant: merchantTables,
  order: orderTables,
  payment: paymentTables,
  pickupCard: pickupCardTables,
  product: productTables,
  settlement: settlementTables,
  marketing: marketingTables,
  message: messageTables,
  risk: riskTables,
  settings: settingsTables,
}

const fallbackPickupCardTable = (pageKey: string): ChinaAdminTableData => ({
  columns: columnsByKind.pickupCard ?? genericColumns,
  filters: ["激活状态", "提货状态", "批次号", "渠道"],
  primaryActionKey: "chinaAdmin.actions.createPickupCardPlaceholder",
  rows: [
    {
      id: `PICKUP-${pageKey}`,
      cells: {
        id: cell(`PICKUP-${pageKey}`),
        name: cell("提货卡运营占位记录"),
        status: statusCell("chinaAdmin.status.settings.placeholder", "grey"),
        owner: cell("提货卡运营组"),
        amount: cell("-"),
        updatedAt: cell("2026-05-03 09:00"),
      },
      actions: ["view", "remark"],
    },
  ],
})

const fallbackTables: Record<Exclude<ChinaAdminPageKind, "pickupCard">, ChinaAdminTableData> = {
  merchant: {
    columns: merchantColumns,
    rows: merchantRows,
    filters: ["所属市场", "商户类型", "配送方式", "开放能力", "更新时间"],
  },
  product: {
    columns: productColumns,
    rows: productRows,
    filters: ["所属市场", "类目", "规格模板", "商户类型", "更新时间"],
  },
  order: {
    columns: orderColumns,
    rows: orderRows,
    filters: ["订单状态", "所属市场", "配送方式", "支付状态", "更新时间"],
  },
  afterSales: {
    columns: afterSalesColumns,
    rows: afterSalesRows,
    filters: ["售后类型", "所属市场", "负责人", "更新时间"],
  },
  operations: {
    columns: genericColumns,
    rows: genericRows.operations,
    filters: ["状态", "负责人", "更新时间"],
  },
  payment: {
    columns: paymentColumns,
    rows: paymentRows,
    filters: ["支付方式", "通知状态", "对账状态", "更新时间"],
  },
  settlement: {
    columns: settlementColumns,
    rows: settlementRows,
    filters: ["所属市场", "结算周期", "商户类型", "结算状态"],
  },
  marketing: {
    columns: marketingColumns,
    rows: marketingRows,
    filters: ["运营位置", "面向对象", "活动状态", "更新时间"],
  },
  message: {
    columns: messageColumns,
    rows: messageRows,
    filters: ["会话状态", "所属市场", "渠道", "更新时间"],
  },
  risk: {
    columns: riskColumns,
    rows: riskRows,
    filters: ["风险等级", "风险对象", "所属市场", "负责人"],
  },
  settings: {
    columns: settingsColumns,
    rows: settingsRows,
    filters: ["配置范围", "负责人", "更新时间"],
  },
}

export const getChinaAdminTableData = (
  kind: ChinaAdminPageKind,
  pageKey: string,
): ChinaAdminTableData => {
  const overrides = tableOverrides[kind]
  if (overrides?.[pageKey]) {
    return overrides[pageKey]
  }

  if (kind === "pickupCard") {
    return fallbackPickupCardTable(pageKey)
  }

  return fallbackTables[kind] ?? {
    columns: columnsByKind[kind] ?? genericColumns,
    rows: genericRows[kind],
    filters: ["状态", "负责人", "更新时间"],
  }
}
