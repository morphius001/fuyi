import type { ChinaAdminPageKind } from "./china-admin-menu"
import {
  genericColumns,
  type ChinaAdminTableColumn,
} from "./china-admin-table-primitives"

export const merchantColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "stallNo", labelKey: "chinaAdmin.tables.columns.stallNo" },
  { key: "merchantType", labelKey: "chinaAdmin.tables.columns.merchantType" },
  { key: "deliveryMode", labelKey: "chinaAdmin.tables.columns.deliveryMode" },
  { key: "capabilities", labelKey: "chinaAdmin.tables.columns.capabilities" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const productColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "category", labelKey: "chinaAdmin.tables.columns.category" },
  { key: "spec", labelKey: "chinaAdmin.tables.columns.spec" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const orderColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "deliveryMode", labelKey: "chinaAdmin.tables.columns.deliveryMode" },
  { key: "paymentState", labelKey: "chinaAdmin.tables.columns.paymentState" },
  { key: "fulfillmentState", labelKey: "chinaAdmin.tables.columns.fulfillmentState" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const afterSalesColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "afterSalesType", labelKey: "chinaAdmin.tables.columns.afterSalesType" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "orderNo", labelKey: "chinaAdmin.tables.columns.orderNo" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const paymentColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "paymentMethod", labelKey: "chinaAdmin.tables.columns.paymentMethod" },
  { key: "paymentState", labelKey: "chinaAdmin.tables.columns.paymentState" },
  { key: "notificationState", labelKey: "chinaAdmin.tables.columns.notificationState" },
  { key: "idempotencyKey", labelKey: "chinaAdmin.tables.columns.idempotencyKey" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const settlementColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "merchant", labelKey: "chinaAdmin.tables.columns.merchant" },
  { key: "settlementPeriod", labelKey: "chinaAdmin.tables.columns.settlementPeriod" },
  { key: "commissionRate", labelKey: "chinaAdmin.tables.columns.commissionRate" },
  { key: "settlementBoundary", labelKey: "chinaAdmin.tables.columns.settlementBoundary" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const marketingColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "marketingChannel", labelKey: "chinaAdmin.tables.columns.marketingChannel" },
  { key: "placement", labelKey: "chinaAdmin.tables.columns.placement" },
  { key: "audience", labelKey: "chinaAdmin.tables.columns.audience" },
  { key: "campaignPeriod", labelKey: "chinaAdmin.tables.columns.campaignPeriod" },
  { key: "promoBoundary", labelKey: "chinaAdmin.tables.columns.promoBoundary" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const messageColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "messageChannel", labelKey: "chinaAdmin.tables.columns.messageChannel" },
  { key: "conversationRole", labelKey: "chinaAdmin.tables.columns.conversationRole" },
  { key: "market", labelKey: "chinaAdmin.tables.columns.market" },
  { key: "serviceBoundary", labelKey: "chinaAdmin.tables.columns.serviceBoundary" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const riskColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "riskObject", labelKey: "chinaAdmin.tables.columns.riskObject" },
  { key: "riskType", labelKey: "chinaAdmin.tables.columns.riskType" },
  { key: "riskLevel", labelKey: "chinaAdmin.tables.columns.riskLevel" },
  { key: "triggerRule", labelKey: "chinaAdmin.tables.columns.triggerRule" },
  { key: "riskBoundary", labelKey: "chinaAdmin.tables.columns.riskBoundary" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const settingsColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "configScope", labelKey: "chinaAdmin.tables.columns.configScope" },
  { key: "configOwner", labelKey: "chinaAdmin.tables.columns.configOwner" },
  { key: "configBoundary", labelKey: "chinaAdmin.tables.columns.configBoundary" },
  { key: "secretPolicy", labelKey: "chinaAdmin.tables.columns.secretPolicy" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]

export const columnsByKind: Partial<Record<ChinaAdminPageKind, ChinaAdminTableColumn[]>> = {
  merchant: merchantColumns,
  product: productColumns,
  order: orderColumns,
  afterSales: afterSalesColumns,
  payment: paymentColumns,
  settlement: settlementColumns,
  marketing: marketingColumns,
  message: messageColumns,
  risk: riskColumns,
  settings: settingsColumns,
}

export { genericColumns }
