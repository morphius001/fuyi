import { Badge, Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui"

import type {
  ChinaAdminMenuGroup,
  ChinaAdminPageMeta,
} from "../lib/china-admin-menu"
import type {
  ChinaAdminTableCell,
  ChinaAdminTableColumn,
  ChinaAdminTableData,
} from "../lib/china-admin-table-data"

type Translate = (key: string) => string

type ChinaAdminModuleOverviewProps = {
  group?: ChinaAdminMenuGroup
  page: ChinaAdminPageMeta
  table: ChinaAdminTableData
  t: Translate
}

type ChinaAdminTableFiltersProps = {
  filters: string[]
  t: Translate
}

type ChinaAdminSummaryGridProps = {
  table: ChinaAdminTableData
  t: Translate
}

type ChinaAdminReadonlyTableProps = {
  details: ChinaAdminTableColumn[]
  table: ChinaAdminTableData
  t: Translate
}

const summaryValue = (table: ChinaAdminTableData, key: string) => {
  const statusCount = table.rows.filter((row) => row.cells.status?.statusColor === key).length

  return String(statusCount)
}

const displayCell = (
  t: Translate,
  tableCell?: ChinaAdminTableCell,
) => {
  if (!tableCell) {
    return "-"
  }

  if (tableCell.statusKey) {
    return (
      <StatusBadge color={tableCell.statusColor ?? "grey"}>
        {t(tableCell.statusKey)}
      </StatusBadge>
    )
  }

  return tableCell.value || "-"
}

export const ChinaAdminModuleOverview = ({
  group,
  page,
  table,
  t,
}: ChinaAdminModuleOverviewProps) => (
  <Container className="p-0">
    <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Heading level="h2">
            {group
              ? t(group.labelKey)
              : t("chinaAdmin.tables.moduleOverview.currentModule")}
          </Heading>
          <Badge size="2xsmall">
            {t("chinaAdmin.tables.moduleOverview.mockMode")}
          </Badge>
        </div>
        <Text size="small" className="line-clamp-2 text-ui-fg-subtle lg:line-clamp-1">
          {t("chinaAdmin.tables.moduleOverview.description")}
        </Text>
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-3 lg:w-[430px]">
        <div className="flex flex-col gap-y-0.5">
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("chinaAdmin.tables.moduleOverview.currentPage")}
          </Text>
          <Text size="small" weight="plus" className="truncate">
            {t(page.labelKey)}
          </Text>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("chinaAdmin.tables.moduleOverview.scopeLabel")}
          </Text>
          <Text size="small" weight="plus">
            {group
              ? `${group.items.length} ${t("chinaAdmin.tables.moduleOverview.scopeUnit")}`
              : "-"}
          </Text>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("chinaAdmin.tables.moduleOverview.recordCount")}
          </Text>
          <Text size="small" weight="plus">
            {table.rows.length}
          </Text>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-1 border-t px-4 py-2 lg:flex-row lg:items-center lg:justify-between">
      <Text size="small" weight="plus">
        {t("chinaAdmin.tables.moduleOverview.safetyLabel")}
      </Text>
      <div className="flex min-w-0 flex-col gap-y-0.5 lg:items-end">
        <Text size="small" className="line-clamp-1 text-ui-fg-subtle">
          {t("chinaAdmin.tables.moduleOverview.safetyMessage")}
        </Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          {t("chinaAdmin.tables.moduleOverview.statusLabel")}
        </Text>
      </div>
    </div>
  </Container>
)

export const ChinaAdminTableFilters = ({
  filters,
  t,
}: ChinaAdminTableFiltersProps) => (
  <Container className="p-0">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter}
            className="rounded-md bg-ui-bg-subtle px-2.5 py-1 text-ui-fg-subtle shadow-borders-base"
            disabled
            title={t("chinaAdmin.actions.readonlyAction")}
            type="button"
          >
            <Text size="small">{filter}</Text>
          </button>
        ))}
      </div>
      <Text size="small" className="text-ui-fg-muted">
        {t("chinaAdmin.tables.mockHint")}
      </Text>
    </div>
  </Container>
)

export const ChinaAdminSummaryGrid = ({
  table,
  t,
}: ChinaAdminSummaryGridProps) => (
  <div className="grid gap-2 md:grid-cols-3">
    <Container className="p-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-col gap-y-0.5">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.tables.summary.total")}
          </Text>
          <Text size="xsmall" className="truncate text-ui-fg-muted">
            {t("chinaAdmin.tables.summary.totalHint")}
          </Text>
        </div>
        <Heading level="h2">{table.rows.length}</Heading>
      </div>
    </Container>
    <Container className="p-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-col gap-y-0.5">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.tables.summary.attention")}
          </Text>
          <Text size="xsmall" className="truncate text-ui-fg-muted">
            {t("chinaAdmin.tables.summary.attentionHint")}
          </Text>
        </div>
        <Heading level="h2">
          {Number(summaryValue(table, "orange")) + Number(summaryValue(table, "red"))}
        </Heading>
      </div>
    </Container>
    <Container className="p-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-col gap-y-0.5">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.tables.summary.latest")}
          </Text>
          <Text size="xsmall" className="truncate text-ui-fg-muted">
            {t("chinaAdmin.tables.summary.latestHint")}
          </Text>
        </div>
        <Text size="small" weight="plus" className="shrink-0">
          {table.rows[0]?.cells.updatedAt?.value ?? "-"}
        </Text>
      </div>
    </Container>
  </div>
)

export const ChinaAdminReadonlyTable = ({
  details,
  table,
  t,
}: ChinaAdminReadonlyTableProps) => (
  <Container className="divide-y p-0">
    <div className="flex flex-col gap-y-1 px-4 py-3">
      <Heading level="h2">{t("chinaAdmin.tables.title")}</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        {t("chinaAdmin.tables.description")}
      </Text>
    </div>

    {table.rows.length > 0 ? (
      <div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="border-b bg-ui-bg-subtle">
                <th className="w-[260px] px-4 py-2 text-left">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.tables.columns.name")}
                  </Text>
                </th>
                <th className="w-[110px] px-3 py-2 text-left">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.tables.columns.status")}
                  </Text>
                </th>
                {details.map((column) => (
                  <th key={column.key} className="min-w-[150px] px-3 py-2 text-left">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t(column.labelKey)}
                    </Text>
                  </th>
                ))}
                <th className="sticky right-0 w-[220px] bg-ui-bg-subtle px-4 py-2 text-right shadow-[-8px_0_12px_rgba(0,0,0,0.04)]">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.tables.columns.actions")}
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {table.rows.map((row) => (
                <tr key={row.id} className="bg-ui-bg-base align-top hover:bg-ui-bg-subtle">
                  <td className="max-w-[260px] px-4 py-2">
                    <div className="flex min-w-0 flex-col gap-y-0.5">
                      <Text size="small" weight="plus" className="truncate">
                        {row.cells.name?.value ?? row.id}
                      </Text>
                      <Text size="xsmall" className="truncate text-ui-fg-muted">
                        {row.cells.id?.value ?? row.id}
                      </Text>
                    </div>
                  </td>
                  <td className="px-3 py-2">{displayCell(t, row.cells.status)}</td>
                  {details.map((column) => (
                    <td key={column.key} className="max-w-[220px] px-3 py-2">
                      <div className="line-clamp-2 text-ui-fg-base txt-compact-small">
                        {displayCell(t, row.cells[column.key])}
                      </div>
                    </td>
                  ))}
                  <td className="sticky right-0 bg-ui-bg-base px-4 py-2 text-right shadow-[-8px_0_12px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-nowrap justify-end gap-1.5">
                      {row.actions.map((action) => (
                        <Button
                          key={action}
                          size="small"
                          variant="secondary"
                          disabled
                          title={t("chinaAdmin.actions.readonlyAction")}
                        >
                          {t(`chinaAdmin.actions.${action}`)}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y lg:hidden">
          {table.rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-y-2 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus" className="truncate">
                    {row.cells.name?.value ?? row.id}
                  </Text>
                  <Text size="xsmall" className="truncate text-ui-fg-muted">
                    {row.cells.id?.value ?? row.id}
                  </Text>
                </div>
                <div className="shrink-0">{displayCell(t, row.cells.status)}</div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {details.slice(0, 6).map((column) => (
                  <div key={column.key} className="min-w-0">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t(column.labelKey)}
                    </Text>
                    <div className="truncate text-ui-fg-base txt-compact-small">
                      {displayCell(t, row.cells[column.key])}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-1.5">
                {row.actions.map((action) => (
                  <Button
                    key={action}
                    size="small"
                    variant="secondary"
                    disabled
                    title={t("chinaAdmin.actions.readonlyAction")}
                  >
                    {t(`chinaAdmin.actions.${action}`)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-y-1 px-6 py-10 text-center">
        <Text size="small" weight="plus">
          {t("chinaAdmin.empty.title")}
        </Text>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.empty.message")}
        </Text>
      </div>
    )}
  </Container>
)

export const ChinaAdminPlaceholderBoundary = ({ t }: { t: Translate }) => (
  <Container className="p-0">
    <div className="flex flex-col gap-y-1 px-4 py-3">
      <Heading level="h2">{t("chinaAdmin.placeholder.title")}</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        {t("chinaAdmin.placeholder.message")}
      </Text>
    </div>
  </Container>
)
