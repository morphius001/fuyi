import { Button, Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import {
  chinaAdminDashboardFocusRows,
  chinaAdminDashboardMetricKeys,
  chinaAdminDashboardQuickActionKeys,
  chinaAdminDashboardRiskRows,
  chinaAdminDashboardTodoRows,
} from "../lib/china-admin-dashboard-data"
import { CHINA_ADMIN_METRIC_ICON_BY_KEY } from "../lib/china-admin-icon-maps"
import ChinaAdminShell from "./ChinaAdminShell"

const ChinaAdminDashboard = () => {
  const { t } = useChinaAdminTranslation()

  return (
    <ChinaAdminShell
      titleKey="chinaAdmin.dashboard.title"
      descriptionKey="chinaAdmin.dashboard.description"
    >
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {chinaAdminDashboardMetricKeys.map((key) => {
          const Icon = CHINA_ADMIN_METRIC_ICON_BY_KEY[key]

          return (
            <Container key={key} className="p-0">
              <div className="flex min-h-[104px] items-center justify-between gap-x-3 px-4 py-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" className="text-ui-fg-subtle">
                    {t(`chinaAdmin.dashboard.metrics.${key}.label`)}
                  </Text>
                  <Heading level="h2">{t(`chinaAdmin.dashboard.metrics.${key}.value`)}</Heading>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.dashboard.metrics.${key}.hint`)}
                  </Text>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle shadow-borders-base">
                  <Icon className="text-ui-fg-subtle" />
                </div>
              </div>
            </Container>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.dashboard.todo.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.dashboard.todo.description")}
            </Text>
          </div>
          <div className="divide-y">
            {chinaAdminDashboardTodoRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.dashboard.todo.${row.key}`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.dashboard.todo.${row.key}Hint`)}
                  </Text>
                </div>
                <StatusBadge color={row.color}>{row.count}</StatusBadge>
              </div>
            ))}
          </div>
        </Container>

        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.dashboard.risk.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.dashboard.risk.description")}
            </Text>
          </div>
          <div className="divide-y">
            {chinaAdminDashboardRiskRows.map((row) => (
              <div key={row.key} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <StatusBadge color={row.color}>
                  {t(`chinaAdmin.dashboard.risk.${row.key}.level`)}
                </StatusBadge>
                <Text size="small" className="min-w-0 flex-1">
                  {t(`chinaAdmin.dashboard.risk.${row.key}.message`)}
                </Text>
                <Text size="xsmall" className="shrink-0 text-ui-fg-muted">
                  {t(`chinaAdmin.dashboard.risk.${row.key}.time`)}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Container className="p-0">
          <div className="flex flex-col gap-y-3 px-4 py-3">
            <div className="flex flex-col gap-y-1">
              <Heading level="h2">{t("chinaAdmin.dashboard.quickActions.title")}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {t("chinaAdmin.dashboard.quickActions.description")}
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {chinaAdminDashboardQuickActionKeys.map((key) => (
                <Button
                  key={key}
                  size="small"
                  variant="secondary"
                  disabled
                  title={t("chinaAdmin.actions.readonlyAction")}
                >
                  {t(`chinaAdmin.dashboard.quickActions.${key}`)}
                </Button>
              ))}
            </div>
          </div>
        </Container>

        <Container className="p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.dashboard.mockSource.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.dashboard.mockSource.message")}
            </Text>
          </div>
        </Container>
      </div>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">{t("chinaAdmin.dashboard.focus.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.dashboard.focus.description")}
          </Text>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("chinaAdmin.dashboard.focus.columns.module")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.dashboard.focus.columns.owner")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.dashboard.focus.columns.status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.dashboard.focus.columns.next")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {chinaAdminDashboardFocusRows.map((row) => (
                <Table.Row key={row}>
                  <Table.Cell>{t(`chinaAdmin.dashboard.focus.${row}.module`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.dashboard.focus.${row}.owner`)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color="green">
                      {t(`chinaAdmin.dashboard.focus.${row}.status`)}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.dashboard.focus.${row}.next`)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Container>

      <Container className="p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">{t("chinaAdmin.dashboard.safety.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.dashboard.safety.message")}
          </Text>
        </div>
      </Container>
    </ChinaAdminShell>
  )
}

export default ChinaAdminDashboard
