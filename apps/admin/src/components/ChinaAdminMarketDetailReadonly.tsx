import { useEffect, useMemo, useState } from "react"
import { ArrowLeft } from "@medusajs/icons"
import { Badge, Button, Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"
import { Link, useParams } from "react-router-dom"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import {
  findChinaAdminPage,
  type ChinaAdminPageMeta,
} from "../lib/china-admin-menu"
import {
  retrieveChinaAdminMarketDetail,
  type ChinaAdminMarket,
  type ChinaAdminMarketAnnouncement,
  type ChinaAdminMarketDeliveryProfile,
  type ChinaAdminMarketDetailView,
  type ChinaAdminMarketMembership,
  type ChinaAdminMarketMembershipStatus,
  type ChinaMarketStatus,
} from "../lib/china-admin-market-client"
import ChinaAdminShell from "./ChinaAdminShell"

type MarketDetailState =
  | { status: "loading" }
  | { status: "ready"; data: ChinaAdminMarketDetailView }
  | { status: "error"; message: string }

const marketStatusColors: Record<
  ChinaMarketStatus,
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  draft: "orange",
  open: "green",
  paused: "red",
  closed: "grey",
}

const membershipStatusColors: Record<
  ChinaAdminMarketMembershipStatus,
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  pending: "orange",
  open: "green",
  paused: "red",
  closed: "grey",
}

const announcementSeverityColors: Record<
  ChinaAdminMarketAnnouncement["severity"],
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  info: "blue",
  warning: "orange",
  urgent: "red",
}

const announcementStatusColors: Record<
  ChinaAdminMarketAnnouncement["status"],
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  draft: "orange",
  published: "green",
  archived: "grey",
}

const marketDetailPage =
  findChinaAdminPage("operations", "market-capabilities") ??
  ({
    key: "marketCapabilities",
    path: "/cn/operations/market-capabilities",
    labelKey: "chinaAdmin.pages.marketCapabilities.title",
    descriptionKey: "chinaAdmin.pages.marketCapabilities.description",
    tableKind: "operations",
  } satisfies ChinaAdminPageMeta)

const readMarketMetadataString = (
  market: ChinaAdminMarket | undefined,
  key: string,
) => {
  const value = market?.metadata[key]

  return typeof value === "string" && value.trim() ? value : "-"
}

const getMarketLocation = (market?: ChinaAdminMarket) =>
  market
    ? [market.province, market.city, market.district].filter(Boolean).join(" / ") ||
      "-"
    : "-"

const getPrimaryMembershipCount = (memberships: ChinaAdminMarketMembership[]) =>
  memberships.filter((membership) => membership.isPrimary).length

const weekdayLabelKeys = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

const getDeliveryTypeKey = (
  profile: ChinaAdminMarketDeliveryProfile,
) => `chinaAdmin.operations.marketDetail.deliveryTypes.${profile.deliveryType}`

const MarketDetailSummary = ({
  data,
}: {
  data: ChinaAdminMarketDetailView
}) => {
  const { t } = useChinaAdminTranslation()

  const summaryItems = [
    {
      key: "memberships",
      value: data.memberships.length,
      description: t("chinaAdmin.operations.marketDetail.summary.memberships"),
    },
    {
      key: "primaryBooths",
      value: getPrimaryMembershipCount(data.memberships),
      description: t("chinaAdmin.operations.marketDetail.summary.primaryBooths"),
    },
    {
      key: "deliveryProfiles",
      value: data.deliveryProfiles.length,
      description: t("chinaAdmin.operations.marketDetail.summary.deliveryProfiles"),
    },
    {
      key: "announcements",
      value: data.announcements.length,
      description: t("chinaAdmin.operations.marketDetail.summary.announcements"),
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <Container key={item.key} className="p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">{item.value}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {item.description}
            </Text>
          </div>
        </Container>
      ))}
    </div>
  )
}

const MarketOverview = ({
  data,
  marketId,
}: {
  data: ChinaAdminMarketDetailView
  marketId: string
}) => {
  const { t } = useChinaAdminTranslation()
  const market = data.market

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="flex flex-col gap-y-1">
          <Heading level="h2">
            {market?.name ?? t("chinaAdmin.operations.marketDetail.emptyMarket")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {market?.slug ?? marketId}
          </Text>
        </div>
        {market ? (
          <StatusBadge color={marketStatusColors[market.status]}>
            {t(`chinaAdmin.operations.marketReadonlyApi.status.${market.status}`)}
          </StatusBadge>
        ) : (
          <StatusBadge color="orange">
            {t("chinaAdmin.operations.marketReadonlyApi.fallbackStatus")}
          </StatusBadge>
        )}
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        {[
          ["location", getMarketLocation(market)],
          ["address", market?.address ?? "-"],
          ["timezone", market?.timezone ?? "Asia/Shanghai"],
          ["hours", readMarketMetadataString(market, "hours")],
          ["notice", readMarketMetadataString(market, "notice")],
          ["serviceRange", readMarketMetadataString(market, "serviceRange")],
        ].map(([key, value]) => (
          <div key={key} className="flex flex-col gap-y-1 border-t px-4 py-3 md:border-t-0 md:[&:nth-child(n+3)]:border-t">
            <Text size="xsmall" className="text-ui-fg-muted">
              {t(`chinaAdmin.operations.marketDetail.fields.${key}`)}
            </Text>
            <Text size="small">{value}</Text>
          </div>
        ))}
      </div>
    </Container>
  )
}

const EmptyTableState = ({ labelKey }: { labelKey: string }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <div className="px-4 py-3">
      <Text size="small" className="text-ui-fg-subtle">
        {t(labelKey)}
      </Text>
    </div>
  )
}

const MembershipsTable = ({
  memberships,
}: {
  memberships: ChinaAdminMarketMembership[]
}) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.marketDetail.sections.memberships")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.marketDetail.sections.membershipsDescription")}
        </Text>
      </div>
      {memberships.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.membershipColumns.seller")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.membershipColumns.booth")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.membershipColumns.category")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.membershipColumns.primary")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.membershipColumns.status")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {memberships.map((membership) => (
                <Table.Row key={membership.id}>
                  <Table.Cell>
                    <div className="flex min-w-[180px] flex-col gap-y-0.5">
                      <Text size="small" weight="plus">
                        {membership.sellerName}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {membership.sellerHandle ?? membership.sellerId}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex min-w-[140px] flex-col gap-y-0.5">
                      <Text size="small">{membership.boothNo}</Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {membership.stallName ?? "-"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {membership.mainCategoryIds.length > 0
                      ? membership.mainCategoryIds.join(", ")
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>
                    {membership.isPrimary
                      ? t("chinaAdmin.common.yes")
                      : t("chinaAdmin.common.no")}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={membershipStatusColors[membership.status]}>
                      {t(`chinaAdmin.operations.marketDetail.membershipStatus.${membership.status}`)}
                    </StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <EmptyTableState labelKey="chinaAdmin.operations.marketDetail.empty.memberships" />
      )}
    </Container>
  )
}

const DeliveryProfilesTable = ({
  profiles,
}: {
  profiles: ChinaAdminMarketDeliveryProfile[]
}) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.marketDetail.sections.deliveryProfiles")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.marketDetail.sections.deliveryProfilesDescription")}
        </Text>
      </div>
      {profiles.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.deliveryColumns.name")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.deliveryColumns.type")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.deliveryColumns.serviceArea")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.deliveryColumns.cutoff")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.deliveryColumns.enabled")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {profiles.map((profile) => (
                <Table.Row key={profile.id}>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {profile.displayName}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{t(getDeliveryTypeKey(profile))}</Table.Cell>
                  <Table.Cell className="max-w-[360px]">
                    <Text size="small" className="line-clamp-2">
                      {profile.serviceAreaNote ?? "-"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{profile.cutoffTime ?? "-"}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={profile.enabled ? "green" : "grey"}>
                      {profile.enabled
                        ? t("chinaAdmin.common.enabled")
                        : t("chinaAdmin.common.disabled")}
                    </StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <EmptyTableState labelKey="chinaAdmin.operations.marketDetail.empty.deliveryProfiles" />
      )}
    </Container>
  )
}

const BusinessHoursTable = ({
  businessHours,
}: {
  businessHours: ChinaAdminMarketDetailView["businessHours"]
}) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.marketDetail.sections.businessHours")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.marketDetail.sections.businessHoursDescription")}
        </Text>
      </div>
      {businessHours.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.businessHourColumns.weekday")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.businessHourColumns.time")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.businessHourColumns.status")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.businessHourColumns.note")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {businessHours.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    {t(
                      `chinaAdmin.operations.marketDetail.weekdays.${
                        weekdayLabelKeys[item.weekday] ?? "monday"
                      }`,
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {item.isClosed ? "-" : `${item.opensAt} - ${item.closesAt}`}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={item.isClosed ? "grey" : "green"}>
                      {item.isClosed
                        ? t("chinaAdmin.operations.marketDetail.businessHourStatus.closed")
                        : t("chinaAdmin.operations.marketDetail.businessHourStatus.open")}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>{item.note ?? "-"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <EmptyTableState labelKey="chinaAdmin.operations.marketDetail.empty.businessHours" />
      )}
    </Container>
  )
}

const AnnouncementsTable = ({
  announcements,
}: {
  announcements: ChinaAdminMarketAnnouncement[]
}) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.marketDetail.sections.announcements")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.marketDetail.sections.announcementsDescription")}
        </Text>
      </div>
      {announcements.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.announcementColumns.title")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.announcementColumns.audience")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.announcementColumns.severity")}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {t("chinaAdmin.operations.marketDetail.announcementColumns.status")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {announcements.map((announcement) => (
                <Table.Row key={announcement.id}>
                  <Table.Cell className="max-w-[440px]">
                    <div className="flex min-w-[220px] flex-col gap-y-0.5">
                      <Text size="small" weight="plus">
                        {announcement.title}
                      </Text>
                      <Text size="xsmall" className="line-clamp-2 text-ui-fg-muted">
                        {announcement.content}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {t(`chinaAdmin.operations.marketDetail.audience.${announcement.audience}`)}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={announcementSeverityColors[announcement.severity]}>
                      {t(`chinaAdmin.operations.marketDetail.severity.${announcement.severity}`)}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={announcementStatusColors[announcement.status]}>
                      {t(`chinaAdmin.operations.marketDetail.announcementStatus.${announcement.status}`)}
                    </StatusBadge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <EmptyTableState labelKey="chinaAdmin.operations.marketDetail.empty.announcements" />
      )}
    </Container>
  )
}

const ReadonlyBoundary = ({ data }: { data: ChinaAdminMarketDetailView }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="flex flex-col gap-y-1">
          <Heading level="h2">
            {t("chinaAdmin.operations.marketDetail.sections.boundary")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketDetail.sections.boundaryDescription")}
          </Text>
        </div>
        <Badge size="2xsmall">{data.mode}</Badge>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="flex flex-col gap-y-1 border-t px-4 py-3 md:border-t-0">
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("chinaAdmin.operations.marketDetail.fields.runtimeEnabled")}
          </Text>
          <StatusBadge color="grey">
            {data.runtimeEnabled
              ? t("chinaAdmin.common.enabled")
              : t("chinaAdmin.common.disabled")}
          </StatusBadge>
        </div>
        <div className="flex flex-col gap-y-1 border-t px-4 py-3 md:border-t-0">
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("chinaAdmin.operations.marketDetail.fields.note")}
          </Text>
          <Text size="small">{data.note}</Text>
        </div>
      </div>
    </Container>
  )
}

const ChinaAdminMarketDetailReadonly = () => {
  const { t } = useChinaAdminTranslation()
  const { id } = useParams()
  const marketId = useMemo(() => decodeURIComponent(id ?? ""), [id])
  const [detailState, setDetailState] = useState<MarketDetailState>({
    status: "loading",
  })

  useEffect(() => {
    let mounted = true

    retrieveChinaAdminMarketDetail(marketId)
      .then((data) => {
        if (mounted) {
          setDetailState({ status: "ready", data })
        }
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return
        }

        setDetailState({
          status: "error",
          message: error instanceof Error ? error.message : "unknown",
        })
      })

    return () => {
      mounted = false
    }
  }, [marketId])

  return (
    <ChinaAdminShell
      titleKey="chinaAdmin.operations.marketDetail.title"
      descriptionKey="chinaAdmin.operations.marketDetail.description"
      page={marketDetailPage}
      actions={
        <>
          <Button asChild size="small" variant="secondary">
            <Link to="/cn/operations/market-capabilities">
              <ArrowLeft />
              {t("chinaAdmin.operations.marketDetail.actions.back")}
            </Link>
          </Button>
          <Button size="small" variant="primary" disabled>
            {t("chinaAdmin.operations.actions.mockConfigure")}
          </Button>
        </>
      }
    >
      {detailState.status === "loading" ? (
        <Container className="px-4 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketDetail.loading")}
          </Text>
        </Container>
      ) : null}

      {detailState.status === "error" ? (
        <Container className="flex flex-col gap-y-1 px-4 py-3">
          <StatusBadge color="orange">
            {t("chinaAdmin.operations.marketReadonlyApi.fallbackStatus")}
          </StatusBadge>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketDetail.errorMessage", {
              message: detailState.message,
            })}
          </Text>
        </Container>
      ) : null}

      {detailState.status === "ready" ? (
        <>
          <MarketDetailSummary data={detailState.data} />
          <MarketOverview data={detailState.data} marketId={marketId} />
          <div className="grid gap-3 xl:grid-cols-2">
            <MembershipsTable memberships={detailState.data.memberships} />
            <DeliveryProfilesTable profiles={detailState.data.deliveryProfiles} />
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            <BusinessHoursTable businessHours={detailState.data.businessHours} />
            <AnnouncementsTable announcements={detailState.data.announcements} />
          </div>
          <ReadonlyBoundary data={detailState.data} />
        </>
      ) : null}
    </ChinaAdminShell>
  )
}

export default ChinaAdminMarketDetailReadonly
