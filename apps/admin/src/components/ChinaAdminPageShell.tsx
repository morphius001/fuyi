import { Button } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import {
  findChinaAdminGroupByPage,
  type ChinaAdminPageMeta,
} from "../lib/china-admin-menu"
import ChinaAdminShell from "./ChinaAdminShell"
import {
  getChinaAdminTableData,
  type ChinaAdminTableColumn,
} from "../lib/china-admin-table-data"
import {
  ChinaAdminModuleOverview,
  ChinaAdminPlaceholderBoundary,
  ChinaAdminReadonlyTable,
  ChinaAdminSummaryGrid,
  ChinaAdminTableFilters,
} from "./ChinaAdminPageShellSections"

type ChinaAdminPageShellProps = {
  page: ChinaAdminPageMeta
}

const detailColumns = (columns: ChinaAdminTableColumn[]) =>
  columns.filter((column) => !["id", "name", "status", "actions"].includes(column.key))

const ChinaAdminPageShell = ({ page }: ChinaAdminPageShellProps) => {
  const { t } = useChinaAdminTranslation()
  const table = getChinaAdminTableData(page.tableKind, page.key)
  const details = detailColumns(table.columns)
  const group = findChinaAdminGroupByPage(page)

  return (
    <ChinaAdminShell
      titleKey={page.labelKey}
      descriptionKey={page.descriptionKey}
      page={page}
      actions={
        <>
          <Button size="small" variant="secondary" disabled>
            {t("chinaAdmin.actions.export")}
          </Button>
          <Button size="small" variant="secondary" disabled>
            {t("chinaAdmin.actions.batchPlaceholder")}
          </Button>
          <Button size="small" variant="primary" disabled>
            {table.primaryActionKey
              ? t(table.primaryActionKey)
              : t("chinaAdmin.actions.createPlaceholder")}
          </Button>
        </>
      }
    >
      <ChinaAdminModuleOverview group={group} page={page} table={table} t={t} />
      <ChinaAdminTableFilters filters={table.filters} t={t} />
      <ChinaAdminSummaryGrid table={table} t={t} />
      <ChinaAdminReadonlyTable details={details} table={table} t={t} />
      <ChinaAdminPlaceholderBoundary t={t} />
    </ChinaAdminShell>
  )
}

export default ChinaAdminPageShell
