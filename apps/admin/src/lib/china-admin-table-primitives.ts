export type ChinaAdminStatusColor = "green" | "orange" | "red" | "blue" | "grey"

export type ChinaAdminTableCell = {
  value: string
  statusKey?: string
  statusColor?: ChinaAdminStatusColor
}

export type ChinaAdminTableColumn = {
  key: string
  labelKey: string
}

export type ChinaAdminTableRow = {
  id: string
  cells: Record<string, ChinaAdminTableCell>
  actions: string[]
}

export type ChinaAdminTableData = {
  columns: ChinaAdminTableColumn[]
  rows: ChinaAdminTableRow[]
  filters: string[]
  primaryActionKey?: string
}

export const cell = (value: string): ChinaAdminTableCell => ({ value })

export const statusCell = (
  statusKey: string,
  statusColor: ChinaAdminStatusColor,
): ChinaAdminTableCell => ({
  value: "",
  statusKey,
  statusColor,
})

export const genericColumns: ChinaAdminTableColumn[] = [
  { key: "id", labelKey: "chinaAdmin.tables.columns.id" },
  { key: "name", labelKey: "chinaAdmin.tables.columns.name" },
  { key: "status", labelKey: "chinaAdmin.tables.columns.status" },
  { key: "owner", labelKey: "chinaAdmin.tables.columns.owner" },
  { key: "amount", labelKey: "chinaAdmin.tables.columns.amount" },
  { key: "updatedAt", labelKey: "chinaAdmin.tables.columns.updatedAt" },
  { key: "actions", labelKey: "chinaAdmin.tables.columns.actions" },
]
