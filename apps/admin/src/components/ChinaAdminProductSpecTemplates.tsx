import { Badge, Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import {
  chinaAdminSpecTemplateBoundaryRows,
  chinaAdminSpecTemplateFieldRows,
  chinaAdminSpecTemplateRows,
  chinaAdminSpecTemplateStatusColorByStatus,
  chinaAdminSpecTemplateSummaryCards,
  type ChinaAdminSpecTemplateStatus,
} from "../lib/china-admin-spec-template-data"
import type { ChinaAdminPageMeta } from "../lib/china-admin-menu"
import ChinaAdminShell from "./ChinaAdminShell"

const TemplateStatusBadge = ({ status }: { status: ChinaAdminSpecTemplateStatus }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <StatusBadge color={chinaAdminSpecTemplateStatusColorByStatus[status]}>
      {t(`chinaAdmin.specTemplates.status.${status}`)}
    </StatusBadge>
  )
}

const ChinaAdminProductSpecTemplates = ({ page }: { page: ChinaAdminPageMeta }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <ChinaAdminShell
      titleKey={page.labelKey}
      descriptionKey={page.descriptionKey}
      page={page}
      actions={
        <>
          <Button size="small" variant="secondary" disabled>
            {t("chinaAdmin.specTemplates.actions.exportPlaceholder")}
          </Button>
          <Button size="small" variant="primary" disabled>
            {t("chinaAdmin.specTemplates.actions.createPlaceholder")}
          </Button>
        </>
      }
    >
      <Container className="p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">{t("chinaAdmin.specTemplates.mockNotice.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.specTemplates.mockNotice.message")}
          </Text>
        </div>
      </Container>

      <div className="grid gap-3 md:grid-cols-2">
        {chinaAdminSpecTemplateSummaryCards.map((card) => (
          <Container key={card.key} className="p-0">
            <div className="flex h-full flex-col gap-y-3 px-4 py-3">
              <div className="flex items-center justify-between gap-x-3">
                <Text size="small" weight="plus">
                  {t(`chinaAdmin.specTemplates.summary.${card.key}.title`)}
                </Text>
                <TemplateStatusBadge status={card.status} />
              </div>
              <div className="flex items-end justify-between gap-x-3">
                <Heading level="h2">{card.value}</Heading>
                <Text size="xsmall" className="text-right text-ui-fg-subtle">
                  {t(`chinaAdmin.specTemplates.summary.${card.key}.description`)}
                </Text>
              </div>
            </div>
          </Container>
        ))}
      </div>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">{t("chinaAdmin.specTemplates.templateTable.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.specTemplates.templateTable.description")}
          </Text>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          {chinaAdminSpecTemplateRows.map((row) => (
            <div key={row.key} className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.specTemplates.templates.${row.key}`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.specTemplates.categories.${row.categoryKey}`)}
                  </Text>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge size="2xsmall">{row.version}</Badge>
                  <TemplateStatusBadge status={row.status} />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.specTemplates.columns.scope")}
                  </Text>
                  <Text size="small">{t(`chinaAdmin.specTemplates.scopes.${row.scopeKey}`)}</Text>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.specTemplates.columns.merchantTypes")}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.specTemplates.merchantTypes.${row.merchantTypesKey}`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.specTemplates.columns.required")}
                  </Text>
                  <Text size="small">{t(`chinaAdmin.specTemplates.required.${row.requiredKey}`)}</Text>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.specTemplates.columns.display")}
                  </Text>
                  <Text size="small">{t(`chinaAdmin.specTemplates.display.${row.displayKey}`)}</Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <div className="grid gap-3 lg:grid-cols-2">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.specTemplates.fieldTable.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.specTemplates.fieldTable.description")}
            </Text>
          </div>
          <div className="divide-y">
            {chinaAdminSpecTemplateFieldRows.map((row) => (
              <div key={row.key} className="grid gap-3 px-4 py-3 md:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.specTemplates.fieldGroups.${row.fieldGroupKey}`)}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {t(`chinaAdmin.specTemplates.fields.${row.fieldsKey}`)}
                  </Text>
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.specTemplates.columns.required")}
                    </Text>
                    <Text size="xsmall">
                      {t(`chinaAdmin.specTemplates.required.${row.requiredKey}`)}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.specTemplates.columns.consumer")}
                    </Text>
                    <Text size="xsmall">
                      {t(`chinaAdmin.specTemplates.consumer.${row.consumerKey}`)}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-y-0.5">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.specTemplates.columns.vendor")}
                    </Text>
                    <Text size="xsmall">
                      {t(`chinaAdmin.specTemplates.vendor.${row.vendorKey}`)}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>

        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.specTemplates.boundary.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.specTemplates.boundary.description")}
            </Text>
          </div>
          <div className="flex flex-col divide-y">
            {chinaAdminSpecTemplateBoundaryRows.map((row) => (
              <div key={row.key} className="flex flex-col gap-y-2 px-4 py-3">
                <div className="flex items-center justify-between gap-x-3">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.specTemplates.surfaces.${row.surfaceKey}`)}
                  </Text>
                  <Badge size="2xsmall">{t(`chinaAdmin.specTemplates.boundaryKeys.${row.key}`)}</Badge>
                </div>
                <Text size="small" className="text-ui-fg-subtle">
                  {t(`chinaAdmin.specTemplates.reads.${row.readKey}`)}
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {t(`chinaAdmin.specTemplates.writes.${row.writeKey}`)}
                </Text>
                <Text size="small" className="text-ui-fg-muted">
                  {t(`chinaAdmin.specTemplates.guardrails.${row.guardrailKey}`)}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="p-0">
        <div className="flex flex-col gap-y-2 px-4 py-3">
          <Heading level="h2">{t("chinaAdmin.specTemplates.safety.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.specTemplates.safety.message")}
          </Text>
        </div>
      </Container>
    </ChinaAdminShell>
  )
}

export default ChinaAdminProductSpecTemplates
