import { Badge, Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import {
  pickupCardBatchRows,
  pickupCardFulfillmentRows,
  pickupCardMetricKeys,
  pickupCardOperationBoundaryKeys,
  pickupCardRecentRows,
  pickupCardRedemptionStepKeys,
  pickupCardSecondaryMetricKeys,
  pickupCardTypeRows,
} from "../lib/china-admin-pickup-card-data"
import { PICKUP_CARD_METRIC_ICON_BY_KEY } from "../lib/china-admin-icon-maps"
import type { ChinaAdminPageMeta } from "../lib/china-admin-menu"
import ChinaAdminShell from "./ChinaAdminShell"

type PickupCardDashboardProps = {
  page: ChinaAdminPageMeta
}

const PickupCardDashboard = ({ page }: PickupCardDashboardProps) => {
  const { t } = useChinaAdminTranslation()

  return (
    <ChinaAdminShell titleKey={page.labelKey} descriptionKey={page.descriptionKey} page={page}>
      <Container className="p-0">
        <div className="flex flex-col gap-y-3 px-4 py-3">
          <div className="flex flex-col gap-y-1">
            <Heading level="h2">{t("chinaAdmin.pickupCards.dashboard.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.pickupCards.definition")}
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pickupCardRedemptionStepKeys.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <Badge size="2xsmall">{index + 1}</Badge>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {t(`chinaAdmin.pickupCards.redemptionSteps.${step}`)}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="china-pickup-metric-grid">
        {pickupCardMetricKeys.map((key) => {
          const Icon = PICKUP_CARD_METRIC_ICON_BY_KEY[key]

          return (
            <Container key={key} className="p-0">
              <div className="flex min-h-[104px] items-center justify-between gap-x-3 px-4 py-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" className="text-ui-fg-subtle">
                    {t(`chinaAdmin.pickupCards.metrics.${key}.label`)}
                  </Text>
                  <Heading level="h2">{t(`chinaAdmin.pickupCards.metrics.${key}.value`)}</Heading>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.pickupCards.metrics.${key}.hint`)}
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

      <div className="china-pickup-main-grid">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.pickupCards.dashboard.recentRedemptions")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.pickupCards.dashboard.recentRedemptionsHint")}
            </Text>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.cardNoMasked")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.userPhoneMasked")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.redeemProduct")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.tables.columns.status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.tables.columns.updatedAt")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pickupCardRecentRows.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{row.cardNo}</Table.Cell>
                  <Table.Cell>{row.phone}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.mockProducts.${row.productKey}`)}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={row.color}>{t(row.statusKey)}</StatusBadge>
                  </Table.Cell>
                  <Table.Cell>{row.time}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>

        <div className="grid gap-3">
          <Container className="divide-y p-0">
            <div className="flex flex-col gap-y-1 px-4 py-3">
              <Heading level="h2">{t("chinaAdmin.pickupCards.dashboard.overview.title")}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {t("chinaAdmin.pickupCards.dashboard.overview.description")}
              </Text>
            </div>
            <div className="grid grid-cols-2 divide-x">
              {pickupCardSecondaryMetricKeys.map((key) => (
                <div key={key} className="flex flex-col gap-y-1 px-4 py-3">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.pickupCards.metrics.${key}.label`)}
                  </Text>
                  <Heading level="h2">{t(`chinaAdmin.pickupCards.metrics.${key}.value`)}</Heading>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {t(`chinaAdmin.pickupCards.metrics.${key}.hint`)}
                  </Text>
                </div>
              ))}
            </div>
          </Container>

          {[
            "abnormalCards",
            "expiringBatches",
            "channelOverview",
          ].map((key) => (
            <Container key={key} className="p-0">
              <div className="flex flex-col gap-y-2 px-4 py-3">
                <Heading level="h2">{t(`chinaAdmin.pickupCards.dashboard.${key}.title`)}</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  {t(`chinaAdmin.pickupCards.dashboard.${key}.message`)}
                </Text>
              </div>
            </Container>
          ))}
        </div>
      </div>

      <div className="china-pickup-two-col-grid">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.pickupCards.sections.cardTypes.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.pickupCards.sections.cardTypes.description")}
            </Text>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.cardType")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.entitlement")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.tables.columns.status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.boundary")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pickupCardTypeRows.map((row) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.cardTypes.${row.key}.name`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.cardTypes.${row.key}.entitlement`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.cardTypes.${row.key}.status`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.cardTypes.${row.key}.note`)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>

        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.pickupCards.sections.batches.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.pickupCards.sections.batches.description")}
            </Text>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.batchNo")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.channel")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.quantity")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.validity")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.tables.columns.status")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pickupCardBatchRows.map((row) => (
                <Table.Row key={row.batch}>
                  <Table.Cell>{row.batch}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.channels.${row.channelKey}`)}</Table.Cell>
                  <Table.Cell>{row.quantity}</Table.Cell>
                  <Table.Cell>{row.expiresAt}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.batchStatus.${row.statusKey}`)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      </div>

      <div className="china-pickup-main-grid">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.pickupCards.sections.fulfillment.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.pickupCards.sections.fulfillment.description")}
            </Text>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.pickupTicket")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.merchantStall")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.pickupCards.columns.fulfillmentMethod")}</Table.HeaderCell>
                <Table.HeaderCell>{t("chinaAdmin.tables.columns.status")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pickupCardFulfillmentRows.map((row) => (
                <Table.Row key={row.ticket}>
                  <Table.Cell>{row.ticket}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.fulfillmentMerchants.${row.merchantKey}`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.fulfillmentMethods.${row.methodKey}`)}</Table.Cell>
                  <Table.Cell>{t(`chinaAdmin.pickupCards.fulfillmentStatus.${row.statusKey}`)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>

        <Container className="p-0">
          <div className="flex flex-col gap-y-3 px-4 py-3">
            <Heading level="h2">{t("chinaAdmin.pickupCards.sections.operationBoundary.title")}</Heading>
            {pickupCardOperationBoundaryKeys.map((item) => (
              <Text key={item} size="small" className="text-ui-fg-subtle">
                {t(`chinaAdmin.pickupCards.operationBoundaries.${item}`)}
              </Text>
            ))}
          </div>
        </Container>
      </div>
    </ChinaAdminShell>
  )
}

export default PickupCardDashboard
